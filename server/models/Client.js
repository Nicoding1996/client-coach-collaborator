import mongoose from 'mongoose';

const clientSchema = new mongoose.Schema({
  coachId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true // Add index for faster lookups by coach
  },
  userId: { // Link back to the User document for this client
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true // Each User should only have one Client profile per coach? Or just one overall? Let's assume one overall for now.
  },
  name: { // Add name field
    type: String,
    required: [true, 'Client name is required'],
  },
  email: { // Add email field
    type: String,
    required: [true, 'Client email is required'],
    lowercase: true,
    trim: true,
  },
  engagementStatus: {
    type: String,
    enum: ['Active', 'Inactive', 'Paused'],
    default: 'Active'
  },
  programProgress: {
    type: Number,
    default: 0
  },
  contactInfo: {
    phone: String,
    address: String
  },
  goals: {
    type: String,
    default: ''
  },
  // Add any additional client-specific fields here
}, {
  timestamps: true
});

const Client = mongoose.model('Client', clientSchema);

export default Client;