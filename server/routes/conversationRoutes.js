import express from 'express';
import { findOrCreateConversation, getMyConversations, getMessagesForConversation } from '../controllers/conversationController.js';
import { protect } from '../middleware/authMiddleware.js'; // Assuming protect handles auth and sets req.user

const router = express.Router();

// Route to find or create a conversation between the logged-in user and another user
// Expects { clientUserId: "..." } in the request body
router.post('/findOrCreate', protect, findOrCreateConversation);
// GET all conversations for the logged-in user
router.get('/', protect, getMyConversations);

// GET messages for a specific conversation
// Ensure :id corresponds to the conversationId expected by the controller
router.get('/:id/messages', protect, getMessagesForConversation);

// Add other conversation/message routes here later (e.g., POST send message)
// Add other conversation/message routes here later (e.g., get messages, send message)

export default router;