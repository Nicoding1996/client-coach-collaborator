import asyncHandler from 'express-async-handler';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js'; // Import Message model
import mongoose from 'mongoose'; // Import mongoose to validate ObjectId

// @desc    Find or create a conversation between logged-in user and another user
// @route   POST /api/conversations/findOrCreate
// @access  Private
export const findOrCreateConversation = asyncHandler(async (req, res) => {
  const coachId = req.user._id; // Logged-in user (assuming coach initiates)
  const { clientUserId } = req.body;

  // Validate clientUserId
  if (!clientUserId) {
    res.status(400);
    throw new Error('Client user ID (clientUserId) is required in the request body.');
  }

  // Validate if clientUserId is a valid MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(clientUserId)) {
      res.status(400);
      throw new Error('Invalid client user ID format.');
  }

  // Ensure participants are not the same user
  if (coachId.toString() === clientUserId.toString()) {
      res.status(400);
      throw new Error('Cannot create a conversation with yourself.');
  }

  // Sort participants to ensure consistent query regardless of order
  const participantIds = [coachId, new mongoose.Types.ObjectId(clientUserId)].sort();

  console.log(`[findOrCreateConversation] Attempting for participants: ${participantIds.join(', ')}`);

  try {
    const conversation = await Conversation.findOneAndUpdate(
      { participants: participantIds }, // Find conversation with these exact participants in any order (sorting handles this)
      { $setOnInsert: { participants: participantIds } }, // Set participants only on insert
      {
        new: true, // Return the new document if created, or the existing one if found
        upsert: true, // Create the document if it doesn't exist
        setDefaultsOnInsert: true // Ensure timestamps are added on creation
      }
    );

    if (!conversation) {
        // This should theoretically not happen with upsert: true, but handle defensively
         console.error(`[findOrCreateConversation] Failed to find or create conversation for participants: ${participantIds.join(', ')}`);
         res.status(500);
         throw new Error('Failed to find or create conversation.');
    }

    console.log(`[findOrCreateConversation] Found or created conversation: ${conversation._id}`);
    res.status(200).json(conversation); // 200 OK for find or create is common

  } catch (error) {
    console.error(`[findOrCreateConversation] Error: ${error.message}`);
    // Rethrow or handle specific errors
    res.status(500); // General server error if not handled otherwise
    throw new Error('Server error during conversation find/create.');
  }
});

// @desc    Get all conversations for the logged-in user
// @route   GET /api/conversations
// @access  Private
export const getMyConversations = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    console.log(`[getMyConversations] Fetching conversations for user: ${userId}`);

    try {
        const conversations = await Conversation.find({ participants: userId })
            .populate({
                path: 'participants', // Populate participants array
                select: '_id name avatar email role', // Select fields from User model
                // If you want to exclude the current user from the populated array:
                // match: { _id: { $ne: userId } }
                // However, often it's useful to have all participant details.
                // You can filter/map on the frontend if needed.
            })
            // Optional: Populate last message (more complex, might need aggregation or saving last message ref on Conversation)
            // .populate('lastMessage')
            .sort({ updatedAt: -1 }) // Sort by most recently active
            .lean();

        // If you only want the *other* participant's details directly on the conversation object
        // you might need to map the results afterwards.
        // For now, returning the populated participants array is standard.

        console.log(`[getMyConversations] Found ${conversations.length} conversations for user ${userId}`);
        res.status(200).json(conversations);

    } catch (error) {
        console.error(`[getMyConversations] Error fetching conversations for user ${userId}:`, error);
        res.status(500);
        throw new Error('Server error fetching conversations.');
    }
});


// @desc    Get messages for a specific conversation
// @route   GET /api/conversations/:id/messages
// @access  Private
export const getMessagesForConversation = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const conversationId = req.params.id;

    console.log(`[getMessages] User ${userId} fetching messages for conversation ${conversationId}`);

    // Validate conversationId
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
        res.status(400);
        throw new Error('Invalid conversation ID format.');
    }

    try {
        // 1. Verify the user is part of the conversation
        const conversation = await Conversation.findOne({
             _id: conversationId,
             participants: userId // Check if logged-in user is a participant
        }).lean(); // Use lean if just checking existence

        if (!conversation) {
            console.log(`[getMessages] User ${userId} not authorized or conversation ${conversationId} not found.`);
            res.status(404); // Or 403 Forbidden
            throw new Error('Conversation not found or user not authorized.');
        }

        // 2. Fetch messages for the conversation
        const messages = await Message.find({ conversationId: conversationId })
            .populate('senderId', '_id name avatar') // Populate sender details
            .sort({ createdAt: 1 }); // Sort by oldest first

        console.log(`[getMessages] Found ${messages.length} messages for conversation ${conversationId}`);
        res.status(200).json(messages);

    } catch (error) {
         // Catch specific errors if needed, otherwise rethrow generic
         if (!res.headersSent) { // Avoid setting status if already set (e.g., by 404)
             res.status(500);
         }
         // Avoid throwing the same error twice if already handled (like 404)
         if (error.message.includes('Conversation not found')) {
             throw error;
         } else {
            console.error(`[getMessages] Error fetching messages for conversation ${conversationId}:`, error);
            throw new Error('Server error fetching messages.');
         }
    }
});