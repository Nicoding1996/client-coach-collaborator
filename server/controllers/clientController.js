import asyncHandler from 'express-async-handler';
import Client from '../models/Client.js'; // Assuming Client model uses export default

// @desc    Create a new client
// @route   POST /api/clients
// @access  Private
export const createClient = asyncHandler(async (req, res) => {
  // Note: You might want more robust validation/data handling here
  const { name, email, phone, engagementStatus, programProgress, contactInfo, goals } = req.body;

  // Check if client already exists for this coach (optional but good)
  const clientExists = await Client.findOne({ email: email, coachId: req.user._id });
  if (clientExists) {
    res.status(400);
    throw new Error('Client with this email already exists for you.');
  }

  const client = new Client({
    // Assuming your Client schema links to User for name/email,
    // you might need to create/find the User first or adjust schema.
    // This example assumes Client schema has these fields directly for simplicity here.
    name,
    email,
    phone: contactInfo?.phone || phone, // Example: get phone if nested
    coachId: req.user._id,
    engagementStatus,
    programProgress,
    contactInfo,
    goals
  });

  const createdClient = await client.save();
  res.status(201).json(createdClient);
});

// @desc    Get all clients for the logged-in coach
// @route   GET /api/clients
// @access  Private
export const getMyClients = asyncHandler(async (req, res) => {
  const search = req.query.search ? {
    $or: [
      // Adjust field names if they differ in your Client schema
      { name: { $regex: req.query.search, $options: 'i' } },
      { email: { $regex: req.query.search, $options: 'i' } }
    ]
  } : {};

  const clients = await Client.find({
    coachId: req.user._id,
    ...search
  });
  // Consider populating user details if needed: .populate('userId', 'name email avatar')
  res.json(clients);
});

// @desc    Get client by ID
// @route   GET /api/clients/:id
// @access  Private
export const getClientById = asyncHandler(async (req, res) => {
  const client = await Client.findOne({ _id: req.params.id, coachId: req.user._id });
  // Ensure coach can only get their own clients

  if (client) {
     // Consider populating user details if needed
    res.json(client);
  } else {
    res.status(404);
    throw new Error('Client not found');
  }
});

// @desc    Update client
// @route   PUT /api/clients/:id
// @access  Private
export const updateClient = asyncHandler(async (req, res) => {
  // Extract only the fields you allow to be updated
  const { name, email, phone, engagementStatus, programProgress, contactInfo, goals } = req.body;

  const client = await Client.findOne({ _id: req.params.id, coachId: req.user._id });
  // Ensure coach can only update their own clients

  if (client) {
    client.name = name ?? client.name; // Use ?? to allow empty strings if needed
    client.email = email ?? client.email;
    client.phone = phone ?? client.phone; // Adjust if phone is in contactInfo
    client.engagementStatus = engagementStatus ?? client.engagementStatus;
    client.programProgress = programProgress ?? client.programProgress;
    client.contactInfo = contactInfo ?? client.contactInfo;
    client.goals = goals ?? client.goals;
    // Add other updatable fields

    const updatedClient = await client.save();
    res.json(updatedClient);
  } else {
    res.status(404);
    throw new Error('Client not found');
  }
});

// @desc    Delete client
// @route   DELETE /api/clients/:id
// @access  Private
export const deleteClient = asyncHandler(async (req, res) => {
  // Use deleteOne or findOneAndDelete for better practice
  const result = await Client.deleteOne({ _id: req.params.id, coachId: req.user._id });
  // Ensure coach can only delete their own clients

  if (result.deletedCount === 1) {
    res.json({ message: 'Client removed' });
  } else {
    res.status(404);
    throw new Error('Client not found');
  }
});

// NO module.exports or block export {} needed here