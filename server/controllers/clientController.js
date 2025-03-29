const asyncHandler = require('express-async-handler');
const Client = require('../models/Client');

// @desc    Create a new client
// @route   POST /api/clients
// @access  Private
const createClient = asyncHandler(async (req, res) => {
  const { name, email, phone } = req.body;

  const client = new Client({
    name,
    email,
    phone,
    coachId: req.user._id
  });

  const createdClient = await client.save();
  res.status(201).json(createdClient);
});

// @desc    Get all clients for the logged-in coach
// @route   GET /api/clients
// @access  Private
const getMyClients = asyncHandler(async (req, res) => {
  const search = req.query.search ? {
    $or: [
      { name: { $regex: req.query.search, $options: 'i' } },
      { email: { $regex: req.query.search, $options: 'i' } }
    ]
  } : {};

  const clients = await Client.find({
    coachId: req.user._id,
    ...search
  });
  res.json(clients);
});

// @desc    Get client by ID
// @route   GET /api/clients/:id
// @access  Private
const getClientById = asyncHandler(async (req, res) => {
  const client = await Client.findById(req.params.id);

  if (client) {
    res.json(client);
  } else {
    res.status(404);
    throw new Error('Client not found');
  }
});

// @desc    Update client
// @route   PUT /api/clients/:id
// @access  Private
const updateClient = asyncHandler(async (req, res) => {
  const { name, email, phone } = req.body;

  const client = await Client.findById(req.params.id);

  if (client) {
    client.name = name || client.name;
    client.email = email || client.email;
    client.phone = phone || client.phone;

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
const deleteClient = asyncHandler(async (req, res) => {
  const client = await Client.findById(req.params.id);

  if (client) {
    await client.remove();
    res.json({ message: 'Client removed' });
  } else {
    res.status(404);
    throw new Error('Client not found');
  }
});

module.exports = {
  createClient,
  getMyClients,
  getClientById,
  updateClient,
  deleteClient
}; 