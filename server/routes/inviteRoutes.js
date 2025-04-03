import express from 'express';
import { generateInviteLink, validateInviteToken } from '../controllers/inviteController.js'; // Import validate function
import { protect } from '../middleware/authMiddleware.js'; // Assuming protect middleware is here

const router = express.Router();

// @route   POST /api/invites/link
// @desc    Generate a new invite link token for the logged-in coach
// @access  Private (Coach) - Requires authentication
router.post('/link', protect, generateInviteLink);

// @route   GET /api/invites/validate/:inviteToken
// @desc    Validate an invite token
// @access  Public
router.get('/validate/:inviteToken', validateInviteToken);

export default router;