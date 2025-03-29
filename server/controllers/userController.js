import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

// Generate JWT (Internal helper, no need to export)
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register new user
// @route   POST /api/users/register
// @access  Public
export const registerUser = asyncHandler(async (req, res) => {
  // Keep existing try/catch or rely on asyncHandler + external error middleware
  const { name, email, password, role } = req.body;
  console.log('Registration attempt:', { name, email, role });

  if (!name || !email || !password || !role) {
    console.log('Missing required fields:', { name: !!name, email: !!email, password: !!password, role: !!role });
    res.status(400);
    throw new Error('Please add all fields'); // asyncHandler handles this
  }

  const userExists = await User.findOne({ email });
  console.log('User exists check:', !!userExists);

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  // Password hashing is handled by pre-save middleware in User model

  const user = await User.create({
    name,
    email,
    password,
    role,
  });

  if (user) {
    console.log('User created successfully:', user._id);
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar, // Include avatar if needed
      // Include other fields needed on registration/login
      token: generateToken(user._id),
    });
  } else {
    console.log('Failed to create user'); // Should be caught by asyncHandler
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Authenticate a user
// @route   POST /api/users/login
// @access  Public
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      // Include other fields needed on login
      token: generateToken(user._id),
    });
  } else {
    res.status(401); // Unauthorized
    throw new Error('Invalid email or password');
  }
});

// @desc    Get user profile (logged in user)
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = asyncHandler(async (req, res) => {
  // req.user is attached by the 'protect' middleware
  const user = await User.findById(req.user._id)
    .select('-password') // Exclude password hash
    .populate('clients', 'name email avatar') // Example populate
    .populate('coaches', 'name email avatar'); // Example populate

  if (user) {
    res.json(user);
  } else {
    // This shouldn't happen if protect middleware works, but good practice
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user profile (logged in user)
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    console.log('Profile update request body:', req.body);

    // Update fields based on request body
    user.name = req.body.name ?? user.name;
    user.email = req.body.email ?? user.email; // Consider implications of changing email
    user.bio = req.body.bio ?? user.bio;
    user.phone = req.body.phone ?? user.phone;
    user.company = req.body.company ?? user.company;
    user.location = req.body.location ?? user.location;
    user.website = req.body.website ?? user.website;
    user.specialties = req.body.specialties ?? user.specialties;
    user.certifications = req.body.certifications ?? user.certifications;

    // Handle password update separately and securely
    if (req.body.password) {
       if (req.body.password.length < 6) {
           res.status(400);
           throw new Error('Password must be at least 6 characters');
       }
       // Hashing happens via pre-save middleware in the model
       user.password = req.body.password;
    }

    const updatedUser = await user.save();
    console.log('User profile updated successfully');

    // Return updated user data (excluding password) + new token? Usually not needed for profile update.
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      bio: updatedUser.bio,
      phone: updatedUser.phone,
      company: updatedUser.company,
      location: updatedUser.location,
      website: updatedUser.website,
      specialties: updatedUser.specialties,
      certifications: updatedUser.certifications,
      avatar: updatedUser.avatar,
      // Maybe omit token here unless you have a reason to refresh it on profile update
      // token: generateToken(updatedUser._id),
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user avatar (logged in user)
// @route   PUT /api/users/profile/avatar
// @access  Private
export const updateUserAvatar = asyncHandler(async (req, res) => {
  console.log('updateUserAvatar controller started');

  // req.user is attached by protect middleware
  const user = await User.findById(req.user._id);
  console.log('User found:', !!user);

  if (!user) {
    console.log('User not found');
    res.status(404);
    throw new Error('User not found');
  }

  // req.file is added by multer middleware
  if (!req.file) {
    console.log('No file in request');
    res.status(400);
    throw new Error('Please upload a file');
  }

  console.log('File received:', req.file);

  // Construct path relative to server root for DB storage
  // Ensure /uploads is served statically in server.js
  const avatarPath = `/uploads/${req.file.filename}`;
  console.log('Avatar path:', avatarPath);

  user.avatar = avatarPath;
  console.log('Saving user with new avatar');
  const savedUser = await user.save(); // Use saved user for response
  console.log('User saved successfully');

  res.json({
    _id: savedUser._id,
    avatar: savedUser.avatar, // Return the updated avatar path
    message: 'Avatar updated successfully',
  });
});

// NO block export {} needed here