const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  coachId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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



export default Client; //