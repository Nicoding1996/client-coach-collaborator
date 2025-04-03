import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Invite from '../models/Invite.js'; // Import Invite model
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
  const { name, email, password, role, inviteToken } = req.body; // Add inviteToken
  console.log('Registration attempt:', { name, email, role, inviteToken: !!inviteToken });

  if (inviteToken) {
    // --- Invite Token Registration Path ---
    console.log('[RegisterUser] Attempting registration via invite token:', inviteToken); // Log the token received

    // 1. Validate Invite Token
    console.log(`[RegisterUser] inviteToken type: ${typeof inviteToken}, length: ${inviteToken?.length}`); // Log type and length
    const invite = await Invite.findOne({
      inviteToken: inviteToken, // Correct field name from Invite model
      status: 'Pending',
      expiresAt: { $gt: new Date() },
    });
    console.log('[RegisterUser] Invite.findOne result:', invite ? `Found invite ID: ${invite._id}` : 'No matching invite found'); // Log findOne result

    if (!invite) {
      console.log('[RegisterUser] Validation failed: Invalid or expired invite token provided:', inviteToken); // Log failure details
      res.status(400);
      throw new Error('Invalid or expired invite token.');
    }
    console.log('[RegisterUser] Validation success: Valid invite found:', JSON.stringify(invite)); // Log the found invite details

    // 2. Check if user already exists (even with invite)
    const userExists = await User.findOne({ email });
    if (userExists) {
      console.log('User already exists despite invite:', email);
      res.status(400);
      throw new Error('User already exists');
    }

    // 3. Create the new Client User (Force role to 'client')
    // Basic validation for client creation fields
    if (!name || !email || !password) {
       console.log('Missing required fields for invite registration:', { name: !!name, email: !!email, password: !!password });
       res.status(400);
       throw new Error('Please provide name, email, and password');
    }

    const newUser = await User.create({
      name,
      email,
      password,
      role: 'client', // Force role to client for invite registration
    });

    if (!newUser) {
      // This case might be less likely if validation passes but handle defensively
      console.log('Failed to create user during invite registration');
      res.status(500); // Or 400 depending on assumed cause
      throw new Error('Could not create user account.');
    }
    console.log('Client user created successfully:', newUser._id);

    // 4. Link Coach and Client
    const coach = await User.findById(invite.coachId);
    // newUser is already the client object

    if (coach && newUser) {
       try {
          coach.clients.push(newUser._id);
          newUser.coaches.push(coach._id);

          await coach.save();
          console.log('Coach document updated with new client.');
          await newUser.save(); // newUser already has role: 'client' from creation
          console.log('Client document updated with coach.');

          // 5. Update Invite Status
          invite.status = 'Accepted';
          await invite.save();
          console.log('Invite status updated to Accepted.');

       } catch (linkError) {
         console.error('Error linking coach and client or updating invite:', linkError);
         // Consider cleanup? Difficult to roll back cleanly here. Log is crucial.
         // Perhaps don't throw, allow login but flag for admin?
         // For now, let registration succeed but log the linking failure.
         // Alternatively, could attempt to delete the newly created user
         // await User.findByIdAndDelete(newUser._id);
         // res.status(500);
         // throw new Error('Failed to link coach and client.');
       }

    } else {
       console.error(`Critical: Coach (ID: ${invite.coachId}, Found: ${!!coach}) or Client (ID: ${newUser?._id}, Found: ${!!newUser}) not found after creation.`);
       // This is a serious state inconsistency. Registration technically succeeded, but linking failed.
       // Decide on recovery strategy: Allow login but log error? Attempt cleanup?
    }

    // 6. Return Response
    console.log('Invite registration successful for user:', newUser._id);
    res.status(201).json({
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role, // will be 'client'
      avatar: newUser.avatar,
      token: generateToken(newUser._id),
    });

  } else {
    // --- Standard Registration Path (No Invite Token) ---
    console.log('Attempting standard registration.');

    if (!name || !email || !password || !role) {
      console.log('Missing required fields for standard registration:', { name: !!name, email: !!email, password: !!password, role: !!role });
      res.status(400);
      throw new Error('Please add all fields (name, email, password, role)');
    }

    // Role validation (optional, depends on your requirements for standard sign-up)
    // if (role !== 'coach') { // Example: Only allow coaches for standard registration
    //   res.status(400);
    //   throw new Error('Invalid role for standard registration.');
    // }

    const userExists = await User.findOne({ email });
    console.log('User exists check (standard):', !!userExists);

    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }

    // Password hashing is handled by pre-save middleware

    const user = await User.create({
      name,
      email,
      password,
      role, // Use the role provided in the request
    });

    if (user) {
      console.log('Standard user created successfully:', user._id);
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        token: generateToken(user._id),
      });
    } else {
      console.log('Failed to create user (standard)');
      res.status(400);
      throw new Error('Invalid user data');
    }
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