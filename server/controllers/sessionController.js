const asyncHandler = require('express-async-handler');
const Session = require('../models/Session');

// @desc    Create a new session
// @route   POST /api/sessions
// @access  Private
const createSession = asyncHandler(async (req, res) => {
  const { title, description, date, duration } = req.body;

  const session = new Session({
    title,
    description,
    date,
    duration,
    coachId: req.user._id
  });

  const createdSession = await session.save();
  res.status(201).json(createdSession);
});

// @desc    Get all sessions for the logged-in user
// @route   GET /api/sessions
// @access  Private
const getMySessions = asyncHandler(async (req, res) => {
  const sessions = await Session.find({
    $or: [
      { coachId: req.user._id },
      { clientId: req.user._id }
    ]
  });
  res.json(sessions);
});

// @desc    Get session by ID
// @route   GET /api/sessions/:id
// @access  Private
const getSessionById = asyncHandler(async (req, res) => {
  const session = await Session.findById(req.params.id);

  if (session) {
    res.json(session);
  } else {
    res.status(404);
    throw new Error('Session not found');
  }
});

// @desc    Update session
// @route   PUT /api/sessions/:id
// @access  Private
const updateSession = asyncHandler(async (req, res) => {
  const { title, description, date, duration } = req.body;

  const session = await Session.findById(req.params.id);

  if (session) {
    session.title = title || session.title;
    session.description = description || session.description;
    session.date = date || session.date;
    session.duration = duration || session.duration;

    const updatedSession = await session.save();
    res.json(updatedSession);
  } else {
    res.status(404);
    throw new Error('Session not found');
  }
});

// @desc    Delete session
// @route   DELETE /api/sessions/:id
// @access  Private
const deleteSession = asyncHandler(async (req, res) => {
  const session = await Session.findById(req.params.id);

  if (session) {
    await session.remove();
    res.json({ message: 'Session removed' });
  } else {
    res.status(404);
    throw new Error('Session not found');
  }
});

module.exports = {
  createSession,
  getMySessions,
  getSessionById,
  updateSession,
  deleteSession
}; 