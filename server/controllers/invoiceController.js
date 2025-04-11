import asyncHandler from 'express-async-handler';
import Invoice from '../models/Invoice.js'; // Use import and .js
// Remove old import if invoiceUtils.js is no longer needed, or keep if it has other functions
// import { generateInvoiceNumber } from '../utils/invoiceUtils.js';
import getNextSequenceValue from '../utils/getNextSequence.js'; // Import the new helper

// @desc    Create a new invoice
// @route   POST /api/invoices
// @access  Private
export const createInvoice = asyncHandler(async (req, res) => {
  // Destructure expected fields from req.body
  // Assuming clientId received here is the User ID now
  const { clientId, amount, lineItems, description, dueDate, notes, status, issueDate } = req.body; // Added issueDate
  console.log(`[CreateInvoice BE] Received clientId (User ID) from form: ${clientId}`); // <-- ADD LOG

  // Basic validation - ensure issueDate is also included if required by schema
  // Also check if lineItems is empty when amount is not provided
  if (!clientId || (!amount && (!lineItems || lineItems.length === 0)) || !issueDate || !dueDate) {
      res.status(400);
      throw new Error('Client ID, Issue Date, Due Date and Amount or Line Items are required');
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

  // Get the next sequence number and format it
  const nextInvNum = await getNextSequenceValue('invoiceNumber'); // Use 'invoiceNumber' as the sequence name
  const formattedInvNum = `INV-${String(nextInvNum).padStart(4, '0')}`; // Format to INV-000X
  console.log(`[CreateInvoice BE] Generated invoiceNumber: ${formattedInvNum}`); // Log generated number

  const invoice = new Invoice({
    coachId: req.user._id, // Assign logged-in coach
    clientId, // Should be the User ID now
    invoiceNumber: formattedInvNum, // Use the generated number
    issueDate,
    dueDate,
    amount: calculatedAmount,
    lineItems,
    description,
    notes,
    status: status || 'Draft'
  });

  console.log(`[CreateInvoice BE] Saving invoice with clientId (User ID): ${invoice.clientId}`); // <-- ADD LOG
  const createdInvoice = await invoice.save();

  // Populate client details before sending back
  const populatedInvoice = await Invoice.findById(createdInvoice._id)
                                  .populate('clientId', '_id name avatar') // Populate with User details
                                  .lean(); // Use lean if not modifying further

  console.log('[CreateInvoice BE] Sending populated invoice:', populatedInvoice);
  res.status(201).json(populatedInvoice || createdInvoice); // Send populated if successful, else fallback
});

// @desc    Get all invoices for the logged-in coach
// @route   GET /api/invoices
// @access  Private
export const getMyInvoices = asyncHandler(async (req, res) => {
    console.log(`[getMyInvoices] User ID making request: ${req.user?._id}, Role: ${req.user?.role}`);
    const userId = req.user._id;
    let invoices;

    if (!req.user || !req.user.role) {
        console.error(`[getMyInvoices] User role not found for user ${userId}`);
        return res.status(403).json({ message: 'User role is required to fetch invoices.' });
    }

    if (req.user.role === 'coach') {
        // Coach: Find invoices where they are the coach, populate CLIENT details
        console.log(`[getMyInvoices] Fetching invoices for COACH ${userId}`);
        invoices = await Invoice.find({ coachId: userId })
            .populate('clientId', '_id name avatar email') // Populate User details into clientId
            .lean()
            .sort({ issueDate: -1 });
        console.log(`[getMyInvoices] Found ${invoices ? invoices.length : 0} invoices for COACH ${userId}`);

    } else if (req.user.role === 'client') {
        // Client: Find invoices where they are the client, populate COACH details
        console.log(`[getMyInvoices] Fetching invoices for CLIENT ${userId}`);
        invoices = await Invoice.find({ clientId: userId }) // Find by clientId (User ID)
            .populate('coachId', '_id name avatar') // Populate coach details
            .lean()
            .sort({ issueDate: -1 });
        console.log(`[getMyInvoices] Found ${invoices ? invoices.length : 0} invoices for CLIENT ${userId}`);

    } else {
        // Handle unknown roles
        console.log(`[getMyInvoices] Unknown role '${req.user.role}' for user ${userId}`);
        invoices = [];
    }

    console.log('[GetInvoices Controller] Invoices AFTER populate and role check:', JSON.stringify(invoices, null, 2));
    res.json(invoices || []); // Ensure an array is always returned
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