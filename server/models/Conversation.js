import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // References the User model
    required: true
  }]
}, {
  timestamps: true // Adds createdAt and updatedAt timestamps
});

// Index for efficient querying based on participants
conversationSchema.index({ participants: 1 });

// Ensure the model is not re-compiled if it already exists (useful for HMR)
const Conversation = mongoose.models.Conversation || mongoose.model('Conversation', conversationSchema);

export default Conversation;