import express from 'express';
import { createInvoice, getMyInvoices, getInvoiceById, updateInvoice, deleteInvoice } from '../controllers/invoiceController.js';
import { protect } from '../middleware/authMiddleware.js';
import asyncHandler from 'express-async-handler';

const router = express.Router();

router.post('/', protect, asyncHandler(createInvoice));
router.get('/', protect, asyncHandler(getMyInvoices));
router.get('/:id', protect, asyncHandler(getInvoiceById));
router.put('/:id', protect, asyncHandler(updateInvoice));
router.delete('/:id', protect, asyncHandler(deleteInvoice));

export default router; 