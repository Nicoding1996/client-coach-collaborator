import express from 'express';
import { getCoachSummary } from '../controllers/dashboardController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Route to get coach summary
router.get('/coach-summary', protect, getCoachSummary);

export default router; 