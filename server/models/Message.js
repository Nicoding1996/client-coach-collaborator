import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true,
    index: true // Add index for faster lookups by conversation
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  readBy: [{ // Array to track who has read the message
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: []
  }]
}, {
  timestamps: true // Adds createdAt and updatedAt timestamps
});

// Ensure the model is not re-compiled if it already exists
const Message = mongoose.models.Message || mongoose.model('Message', messageSchema);

export default Message;