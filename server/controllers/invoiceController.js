import asyncHandler from 'express-async-handler';
import Invoice from '../models/Invoice.js'; // Use import and .js
import { generateInvoiceNumber } from '../utils/invoiceUtils.js'; // Assuming you create a utility for this

// @desc    Create a new invoice
// @route   POST /api/invoices
// @access  Private
export const createInvoice = asyncHandler(async (req, res) => {
  // Destructure expected fields from req.body
  const { clientId, amount, lineItems, description, dueDate, notes, status } = req.body;

  // Basic validation
  if (!clientId || (!amount && !lineItems)) {
      res.status(400);
      throw new Error('Client ID and Amount or Line Items are required');
  }

  // Calculate amount from lineItems if necessary
  let calculatedAmount = amount;
  if (!calculatedAmount && lineItems && lineItems.length > 0) {
    calculatedAmount = lineItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  }
  if (!calculatedAmount) {
      res.status(400);
      throw new Error('Invoice amount cannot be zero');
  }

  const invoiceNumber = await generateInvoiceNumber(); // Implement this utility function

  const invoice = new Invoice({
    coachId: req.user._id, // Assign logged-in coach
    clientId,
    invoiceNumber,
    amount: calculatedAmount,
    lineItems,
    description, // Add description if needed in schema/request
    dueDate,
    notes,
    status: status || 'Draft' // Default status if not provided
  });

  const createdInvoice = await invoice.save();
  res.status(201).json(createdInvoice);
});

// @desc    Get all invoices for the logged-in coach
// @route   GET /api/invoices
// @access  Private
export const getMyInvoices = asyncHandler(async (req, res) => {
  // Add filtering/sorting/pagination later if needed
  const invoices = await Invoice.find({ coachId: req.user._id })
                                .populate('clientId', 'name email') // Populate client info
                                .sort({ issueDate: -1 }); // Sort by issue date descending
  res.json(invoices);
});

// @desc    Get invoice by ID
// @route   GET /api/invoices/:id
// @access  Private
export const getInvoiceById = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findOne({ _id: req.params.id, coachId: req.user._id })
                               .populate('clientId', 'name email'); // Populate client info
  // Ensure coach can only get their own invoices

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
export const updateInvoice = asyncHandler(async (req, res) => {
  // Allow updating specific fields like status, notes, dueDate, etc.
  const { amount, lineItems, description, dueDate, notes, status } = req.body;

  const invoice = await Invoice.findOne({ _id: req.params.id, coachId: req.user._id });
  // Ensure coach can only update their own invoices

  if (invoice) {
    // Update only provided fields
    if (amount !== undefined) invoice.amount = amount;
    if (lineItems !== undefined) invoice.lineItems = lineItems;
    if (description !== undefined) invoice.description = description;
    if (dueDate !== undefined) invoice.dueDate = dueDate;
    if (notes !== undefined) invoice.notes = notes;
    if (status !== undefined) invoice.status = status;
     // Add logic here if status changes to 'Paid', maybe set a paidDate?

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
export const deleteInvoice = asyncHandler(async (req, res) => {
  const result = await Invoice.deleteOne({ _id: req.params.id, coachId: req.user._id });
  // Ensure coach can only delete their own invoices

  if (result.deletedCount === 1) {
    res.json({ message: 'Invoice removed' });
  } else {
    res.status(404);
    throw new Error('Invoice not found');
  }
});

// NO module.exports or block export {} needed here