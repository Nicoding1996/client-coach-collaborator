import mongoose from 'mongoose';

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // Use a string ID like 'invoiceNumber'
  seq: { type: Number, default: 0 }
});

// Ensure the model is not re-compiled if it already exists
const Counter = mongoose.models.Counter || mongoose.model('Counter', counterSchema);

export default Counter;