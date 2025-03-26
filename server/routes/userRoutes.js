import express from 'express';
import multer from 'multer';
import path from 'path';
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  updateUserAvatar,
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `user-${Date.now()}${path.extname(file.originalname)}`);
  },
});

// Check file type
const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Images only!'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 1000000 }, // 1MB
});

// Debug middleware
const debugMiddleware = (req, res, next) => {
  console.log('Incoming request:', {
    method: req.method,
    path: req.path,
    body: req.body,
    headers: req.headers,
  });
  next();
};

// Routes
router.post('/register', debugMiddleware, registerUser);
router.post('/login', debugMiddleware, loginUser);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.put('/profile/avatar', protect, upload.single('avatar'), updateUserAvatar);

export default router; 