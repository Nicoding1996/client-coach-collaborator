import asyncHandler from 'express-async-handler';
import Session from '../models/Session.js'; // Use import and .js
import { io, userSockets } from '../server.js'; // Import io and userSockets

// @desc    Create a new session
// @route   POST /api/sessions
// @access  Private
export const createSession = asyncHandler(async (req, res) => {
  // Destructure expected fields from req.body
  const { clientId, sessionDate, startTime, endTime, location, notes, status } = req.body; // Updated fields
  console.log(`[createSession] Received clientId from form: ${clientId}`); // <-- ADD LOG

  // Basic validation
  if (!clientId || !sessionDate || !startTime || !endTime) {
      res.status(400);
      throw new Error('Client, Session Date, Start Time, and End Time are required');
  }

  // Combine date/time if needed before creating
  // Example: const combinedDate = new Date(`${sessionDate}T${time}:00`); - needs robust parsing

  const session = new Session({
    coachId: req.user._id, // Assign logged-in coach
    clientId,
    sessionDate, // Ensure this is a valid Date object
    startTime,
    endTime,
    location, // Added location
    notes,
    status: status || 'Upcoming' // Default status
  });
console.log(`[createSession] Saving session with clientId: ${session.clientId}`); // <-- ADD LOG
const createdSession = await session.save();
  // Removed duplicate declaration

  // Emit WebSocket event
  try {
    const coachSocketId = userSockets[createdSession.coachId.toString()];
    const clientSocketId = userSockets[createdSession.clientId.toString()];

    if (coachSocketId) {
      io.to(coachSocketId).emit('session_created', createdSession);
      console.log(`Emitted 'session_created' to coach ${createdSession.coachId} via socket ${coachSocketId}`);
    }
    if (clientSocketId) {
      io.to(clientSocketId).emit('session_created', createdSession);
      console.log(`Emitted 'session_created' to client ${createdSession.clientId} via socket ${clientSocketId}`);
    }
  } catch (socketError) {
      console.error("Socket emission error in createSession:", socketError);
      // Decide if you want to throw or just log
  }

  res.status(201).json(createdSession);
});

// @desc    Get all sessions for the logged-in user (coach or client)
// @route   GET /api/sessions
// @access  Private
export const getMySessions = asyncHandler(async (req, res) => {
  console.log(`[getMySessions] User ID making request: ${req.user?._id}`); // Added log
  // Add filtering by status (upcoming/past) or date range via query params later
  const sessions = await Session.find({
    $or: [
      { coachId: req.user._id },
      { clientId: req.user._id }
    ]
  })
  // REMOVED: .populate('clientId', 'name avatar')
  .populate('coachId', 'name avatar') // Keep coach populate if needed
  .lean() // Add lean()
  .sort({ sessionDate: -1 }); // Sort by date descending
console.log(`[getMySessions] Found ${sessions.length} sessions for user ${req.user?._id}`); // Added log
res.json(sessions);
  res.json(sessions);
});

// @desc    Get session by ID
// @route   GET /api/sessions/:id
// @access  Private
export const getSessionById = asyncHandler(async (req, res) => {
  const session = await Session.findOne({
    _id: req.params.id,
    // Ensure user is either the coach or the client for this session
    $or: [ { coachId: req.user._id }, { clientId: req.user._id } ]
   })
   .populate('clientId', 'name email avatar')
   .populate('coachId', 'name email avatar');

  if (session) {
    res.json(session);
  } else {
    res.status(404);
    throw new Error('Session not found or not authorized');
  }
});

// @desc    Update session
// @route   PUT /api/sessions/:id
// @access  Private
export const updateSession = asyncHandler(async (req, res) => {
  // Allow updating specific fields like notes, status, date, duration etc.
  // Allow updating specific fields like notes, status, date, times, location etc.
  const { sessionDate, startTime, endTime, location, notes, status } = req.body; // Updated fields
  console.log(`[updateSession] Received body for session ${req.params.id}:`, req.body); // <-- ADD LOG

  // Find session ensuring the logged-in user is the coach (usually only coach can update)
  const session = await Session.findOne({ _id: req.params.id, coachId: req.user._id });

  if (session) {
    // Update only provided fields
    if (sessionDate !== undefined) session.sessionDate = sessionDate;
    if (startTime !== undefined) session.startTime = startTime;
    if (endTime !== undefined) session.endTime = endTime;
    if (location !== undefined) session.location = location;
    if (notes !== undefined) session.notes = notes; // notes already existed, keeping it
    if (status !== undefined) session.status = status;

    console.log(`[updateSession] Saving session ${session._id} with clientId: ${session.clientId}`); // <-- ADD LOG
    const updatedSession = await session.save();

    // Emit WebSocket event
    try {
        const coachSocketId = userSockets[updatedSession.coachId.toString()];
        const clientSocketId = userSockets[updatedSession.clientId.toString()];

        if (coachSocketId) {
          io.to(coachSocketId).emit('session_updated', updatedSession);
          console.log(`Emitted 'session_updated' to coach ${updatedSession.coachId} via socket ${coachSocketId}`);
        }
        if (clientSocketId) {
          io.to(clientSocketId).emit('session_updated', updatedSession);
          console.log(`Emitted 'session_updated' to client ${updatedSession.clientId} via socket ${clientSocketId}`);
        }
    } catch (socketError) {
        console.error("Socket emission error in updateSession:", socketError);
    }

    res.json(updatedSession);
  } else {
    res.status(404);
    throw new Error('Session not found or not authorized');
  }
});

// @desc    Delete session
// @route   DELETE /api/sessions/:id
// @access  Private
export const deleteSession = asyncHandler(async (req, res) => {
  // Find the session first to get IDs for socket emission
  const sessionToDelete = await Session.findOne({ _id: req.params.id, coachId: req.user._id }).lean();

  if (!sessionToDelete) {
    res.status(404);
    throw new Error('Session not found or not authorized');
  }

  const coachId = sessionToDelete.coachId.toString();
  const clientId = sessionToDelete.clientId.toString();
  const sessionId = sessionToDelete._id.toString();

  // Perform the deletion
  const result = await Session.deleteOne({ _id: req.params.id, coachId: req.user._id });

  if (result.deletedCount === 1) {
    // Emit WebSocket event after successful deletion
    try {
        const coachSocketId = userSockets[coachId];
        const clientSocketId = userSockets[clientId];

        if (coachSocketId) {
          io.to(coachSocketId).emit('session_deleted', { sessionId });
           console.log(`Emitted 'session_deleted' for session ${sessionId} to coach ${coachId} via socket ${coachSocketId}`);
        }
        if (clientSocketId) {
          io.to(clientSocketId).emit('session_deleted', { sessionId });
          console.log(`Emitted 'session_deleted' for session ${sessionId} to client ${clientId} via socket ${clientSocketId}`);
        }
    } catch (socketError) {
        console.error("Socket emission error in deleteSession:", socketError);
    }

    res.json({ message: 'Session removed' });
  } else {
    // This case should technically be less likely now due to the initial find
    res.status(404);
    throw new Error('Session not found during deletion or not authorized');
  }
});

// NO module.exports or block export {} needed here