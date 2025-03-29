import asyncHandler from 'express-async-handler';
import Session from '../models/Session.js'; // Use import and .js

// @desc    Create a new session
// @route   POST /api/sessions
// @access  Private
export const createSession = asyncHandler(async (req, res) => {
  // Destructure expected fields from req.body
  const { clientId, sessionDate, duration, focusTopic, notes, status } = req.body; // Add time if sent separately

  // Basic validation
  if (!clientId || !sessionDate || !duration) {
      res.status(400);
      throw new Error('Client, Session Date, and Duration are required');
  }

  // Combine date/time if needed before creating
  // Example: const combinedDate = new Date(`${sessionDate}T${time}:00`); - needs robust parsing

  const session = new Session({
    coachId: req.user._id, // Assign logged-in coach
    clientId,
    sessionDate, // Ensure this is a valid Date object
    duration,
    focusTopic,
    notes,
    status: status || 'Upcoming' // Default status
  });

  const createdSession = await session.save();
  res.status(201).json(createdSession);
});

// @desc    Get all sessions for the logged-in user (coach or client)
// @route   GET /api/sessions
// @access  Private
export const getMySessions = asyncHandler(async (req, res) => {
  // Add filtering by status (upcoming/past) or date range via query params later
  const sessions = await Session.find({
    $or: [
      { coachId: req.user._id },
      { clientId: req.user._id }
    ]
  })
  .populate('clientId', 'name avatar') // Populate client info
  .populate('coachId', 'name avatar') // Populate coach info
  .sort({ sessionDate: -1 }); // Sort by date descending

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
  const { sessionDate, duration, focusTopic, notes, status } = req.body;

  // Find session ensuring the logged-in user is the coach (usually only coach can update)
  const session = await Session.findOne({ _id: req.params.id, coachId: req.user._id });

  if (session) {
    // Update only provided fields
    if (sessionDate !== undefined) session.sessionDate = sessionDate;
    if (duration !== undefined) session.duration = duration;
    if (focusTopic !== undefined) session.focusTopic = focusTopic;
    if (notes !== undefined) session.notes = notes;
    if (status !== undefined) session.status = status;

    const updatedSession = await session.save();
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
  // Ensure only the coach can delete the session
  const result = await Session.deleteOne({ _id: req.params.id, coachId: req.user._id });

  if (result.deletedCount === 1) {
    res.json({ message: 'Session removed' });
  } else {
    res.status(404);
    throw new Error('Session not found or not authorized');
  }
});

// NO module.exports or block export {} needed here