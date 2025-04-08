// server/models/Session.js
import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema(
  {
    coachId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Or ref: 'Client' if Client is a separate model
      required: true
    },
    sessionDate: { // Combined Date and Time
      type: Date,
      required: true
    },
    startTime: { // Start time as string (e.g., "10:00")
      type: String,
      required: true,
    },
    endTime: { // End time as string (e.g., "11:30")
      type: String,
      required: true,
    },
    location: { // Location of the session
      type: String,
      default: '', // Optional field
    },
    status: {
      type: String,
      enum: ['Upcoming', 'Completed', 'Cancelled', 'No Show'],
      default: 'Upcoming'
    },
    notes: { // Coach's private notes
      type: String,
      default: ''
    },
    // Removed focusTopic as it's covered by notes
    relatedInvoiceId: { // Link to an invoice if applicable
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Invoice',
      required: false // Make optional
    }
    // Add other fields if needed, e.g., client feedback, completion date
  },
  {
    timestamps: true // Adds createdAt and updatedAt
  }
);

// Create the model from the schema
const Session = mongoose.model('Session', sessionSchema);

// Export the model as default
export default Session;