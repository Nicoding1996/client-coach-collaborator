import express from 'express';
import { createClient, getMyClients, getClientById, updateClient, deleteClient } from '../controllers/clientController.js';
import { protect } from '../middleware/authMiddleware.js';
import asyncHandler from 'express-async-handler';

const router = express.Router();

router.post('/', protect, asyncHandler(createClient));
router.get('/', protect, asyncHandler(getMyClients));
router.get('/:id', protect, asyncHandler(getClientById));
router.put('/:id', protect, asyncHandler(updateClient));
router.delete('/:id', protect, asyncHandler(deleteClient));

export default router; 