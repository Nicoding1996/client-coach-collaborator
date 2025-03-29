import express from 'express';
import { createSession, getMySessions, getSessionById, updateSession, deleteSession } from '../controllers/sessionController.js';
import { protect } from '../middleware/authMiddleware.js';
import asyncHandler from 'express-async-handler';

const router = express.Router();

router.post('/', protect, asyncHandler(createSession));
router.get('/', protect, asyncHandler(getMySessions));
router.get('/:id', protect, asyncHandler(getSessionById));
router.put('/:id', protect, asyncHandler(updateSession));
router.delete('/:id', protect, asyncHandler(deleteSession));

export default router; 