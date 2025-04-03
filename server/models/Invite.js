import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const inviteSchema = new Schema({
  coachId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  inviteToken: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Accepted'],
    default: 'Pending',
  },
  expiresAt: {
    type: Date,
  },
}, {
  timestamps: true, // Enable timestamps (createdAt, updatedAt)
});

const Invite = model('Invite', inviteSchema);

export default Invite;