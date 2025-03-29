const asyncHandler = require('express-async-handler');
const Invoice = require('../models/Invoice');

// @desc    Create a new invoice
// @route   POST /api/invoices
// @access  Private
const createInvoice = asyncHandler(async (req, res) => {
  const { amount, description, dueDate } = req.body;

  const invoice = new Invoice({
    amount,
    description,
    dueDate,
    coachId: req.user._id
  });

  const createdInvoice = await invoice.save();
  res.status(201).json(createdInvoice);
});

// @desc    Get all invoices for the logged-in coach
// @route   GET /api/invoices
// @access  Private
const getMyInvoices = asyncHandler(async (req, res) => {
  const invoices = await Invoice.find({ coachId: req.user._id });
  res.json(invoices);
});

// @desc    Get invoice by ID
// @route   GET /api/invoices/:id
// @access  Private
const getInvoiceById = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findById(req.params.id);

  if (invoice) {
    res.json(invoice);
  } else {
    res.status(404);
    throw new Error('Invoice not found');
  }
});

// @desc    Update invoice
// @route   PUT /api/invoices/:id
// @access  Private
const updateInvoice = asyncHandler(async (req, res) => {
  const { amount, description, dueDate } = req.body;

  const invoice = await Invoice.findById(req.params.id);

  if (invoice) {
    invoice.amount = amount || invoice.amount;
    invoice.description = description || invoice.description;
    invoice.dueDate = dueDate || invoice.dueDate;

    const updatedInvoice = await invoice.save();
    res.json(updatedInvoice);
  } else {
    res.status(404);
    throw new Error('Invoice not found');
  }
});

// @desc    Delete invoice
// @route   DELETE /api/invoices/:id
// @access  Private
const deleteInvoice = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findById(req.params.id);

  if (invoice) {
    await invoice.remove();
    res.json({ message: 'Invoice removed' });
  } else {
    res.status(404);
    throw new Error('Invoice not found');
  }
});

module.exports = {
  createInvoice,
  getMyInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice
}; 