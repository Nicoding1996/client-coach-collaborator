import crypto from 'crypto';
import asyncHandler from 'express-async-handler';
import Invite from '../models/Invite.js';

// @desc    Generate a new invite link token
// @route   POST /api/invites/link
// @access  Private (Coach)
export const generateInviteLink = asyncHandler(async (req, res) => {
  const coachId = req.user._id; // Get coachId from authenticated user

  // Generate a unique token
  // Note: While collisions are rare, a robust implementation might check
  // the DB or use a library designed for guaranteed uniqueness if needed.
  const inviteToken = crypto.randomBytes(16).toString('hex');

  // Calculate expiration date (e.g., 7 days from now)
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  try {
    const newInvite = await Invite.create({
      coachId,
      inviteToken,
      expiresAt,
      // status defaults to 'Pending' based on the schema
    });

    res.status(201).json({ inviteToken: newInvite.inviteToken });

  } catch (error) {
    // Handle potential errors (e.g., database error)
    console.error("Error creating invite link:", error);
    // Check for duplicate token error specifically, though unlikely
    if (error.code === 11000) {
         res.status(400);
         throw new Error('Failed to generate a unique invite token. Please try again.');
    }
    res.status(500);
    throw new Error('Server error while generating invite link.');
  }
});

// @desc    Validate an invite token
// @route   GET /api/invites/validate/:inviteToken
// @access  Public
export const validateInviteToken = asyncHandler(async (req, res) => {
  const { inviteToken } = req.params;

  if (!inviteToken) {
    res.status(400);
    throw new Error('Invite token is required.');
  }

  try {
    const invite = await Invite.findOne({
      inviteToken: inviteToken,
      status: 'Pending',
      expiresAt: { $gt: new Date() } // Check if not expired
    });
    // Optionally populate coach info if needed later:
    // .populate('coachId', 'name'); // Example: assuming User model has 'name'

    if (invite) {
      // Token is valid, pending, and not expired
      res.status(200).json({
          valid: true,
          // coachName: invite.coachId.name // Include if populated
       });
    } else {
      // Token not found, or expired, or already accepted
      res.status(404).json({
        valid: false,
        message: 'Invite link is invalid, expired, or has already been used.'
      });
    }
  } catch (error) {
    console.error("Error validating invite token:", error);
    res.status(500);
    throw new Error('Server error while validating invite link.');
  }
});