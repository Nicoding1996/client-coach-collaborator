import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  updateUserAvatar,
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), 'public/uploads');
if (!fs.existsSync(path.join(process.cwd(), 'public'))) {
  fs.mkdirSync(path.join(process.cwd(), 'public'));
  console.log('Created public directory');
}
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
  console.log('Created uploads directory at:', uploadDir);
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log('Multer processing file:', file.originalname);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const filename = `user-${Date.now()}${path.extname(file.originalname)}`;
    console.log('Generated filename:', filename);
    cb(null, filename);
  },
});

// Check file type
const fileFilter = (req, file, cb) => {
  console.log('Validating file type:', file.mimetype);
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    console.log('File type rejected:', file.mimetype);
    cb(new Error('Images only!'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5000000 }, // 5MB
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

// Avatar debug middleware
const avatarDebugMiddleware = (req, res, next) => {
  console.log('Avatar upload request received');
  console.log('Content-Type:', req.headers['content-type']);
  console.log('Has files?', !!req.files);
  console.log('Has file?', !!req.file);
  next();
};

// Routes
router.post('/register', debugMiddleware, registerUser);
router.post('/login', debugMiddleware, loginUser);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.put('/profile/avatar', protect, avatarDebugMiddleware, upload.single('avatar'), avatarDebugMiddleware, updateUserAvatar);

export default router; 