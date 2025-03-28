import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register new user
// @route   POST /api/users/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    console.log('Registration attempt:', { name, email, role }); // Log registration attempt

    if (!name || !email || !password || !role) {
      console.log('Missing required fields:', { name: !!name, email: !!email, password: !!password, role: !!role });
      res.status(400);
      throw new Error('Please add all fields');
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    console.log('User exists check:', !!userExists);

    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }

    // Create user
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
        avatar: user.avatar,
        token: generateToken(user._id),
      });
    } else {
      console.log('Failed to create user');
      res.status(400);
      throw new Error('Invalid user data');
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      message: error.message || 'An error occurred during registration',
      stack: process.env.NODE_ENV === 'development' ? error.stack : null,
    });
  }
});

// @desc    Authenticate a user
// @route   POST /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check for user email
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .select('-password')
    .populate('clients', 'name email avatar')
    .populate('coaches', 'name email avatar');

  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    // Log the incoming update request
    console.log('Profile update request:', req.body);
    
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.bio = req.body.bio || user.bio;
    user.phone = req.body.phone || user.phone;
    user.company = req.body.company || user.company;
    user.location = req.body.location || user.location;
    user.website = req.body.website || user.website;
    user.specialties = req.body.specialties || user.specialties;
    user.certifications = req.body.certifications || user.certifications;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();
    console.log('User profile updated successfully');

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
      token: generateToken(updatedUser._id),
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user avatar
// @route   PUT /api/users/profile/avatar
// @access  Private
const updateUserAvatar = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (!req.file) {
    res.status(400);
    throw new Error('Please upload a file');
  }

  // Get the file path to save in database
  const avatar = `/uploads/${req.file.filename}`;
  
  user.avatar = avatar;
  await user.save();

  res.json({
    _id: user._id,
    avatar: user.avatar,
    message: 'Avatar updated successfully',
  });
});

export {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  updateUserAvatar,
}; 