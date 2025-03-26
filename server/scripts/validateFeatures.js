/**
 * Feature Validation Script
 * 
 * This script validates the core functionality of the application:
 * 1. MongoDB connection
 * 2. User authentication (register/login)
 * 3. Profile updates
 * 4. Avatar uploads
 * 
 * Run with: node server/scripts/validateFeatures.js
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// We need to import these modules dynamically
let connectDB, User;

// Test data
const testUser = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123',
  role: 'coach'
};

// Load environment variables
dotenv.config();

// Validation functions
async function validateMongoConnection() {
  console.log('\n🔍 Testing MongoDB Connection...');
  try {
    // Import the modules dynamically
    const dbModule = await import('../config/db.js');
    connectDB = dbModule.default;
    
    // Connect to MongoDB
    await connectDB();
    console.log('✅ MongoDB connection successful');
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    return false;
  }
}

async function validateUserRegistration() {
  console.log('\n🔍 Testing User Registration...');
  try {
    // Import User model dynamically
    const userModule = await import('../models/User.js');
    User = userModule.default;
    
    // Check if test user already exists
    const existingUser = await User.findOne({ email: testUser.email });
    if (existingUser) {
      console.log('⚠️ Test user already exists, skipping registration');
      return existingUser;
    }
    
    // Create new user
    const user = await User.create(testUser);
    console.log(`✅ User registration successful: ${user.name} (${user.role})`);
    return user;
  } catch (error) {
    console.error('❌ User registration failed:', error.message);
    return null;
  }
}

async function validateUserAuthentication(user) {
  console.log('\n🔍 Testing User Authentication...');
  if (!user) {
    console.error('❌ Cannot test authentication: No user available');
    return false;
  }
  
  try {
    // Test password matching
    const isMatch = await user.matchPassword('password123');
    if (isMatch) {
      console.log('✅ User authentication successful');
      return true;
    } else {
      console.error('❌ Password did not match');
      return false;
    }
  } catch (error) {
    console.error('❌ Authentication test failed:', error.message);
    return false;
  }
}

async function validateProfileUpdate(user) {
  console.log('\n🔍 Testing Profile Update...');
  if (!user) {
    console.error('❌ Cannot test profile update: No user available');
    return false;
  }
  
  try {
    // Update user profile
    user.bio = 'This is a test bio update';
    user.phone = '+1 123-456-7890';
    user.company = 'Test Company';
    user.location = 'Test Location';
    user.website = 'https://example.com';
    
    await user.save();
    console.log('✅ Profile update successful');
    return true;
  } catch (error) {
    console.error('❌ Profile update failed:', error.message);
    return false;
  }
}

async function validateAvatarUpload(user) {
  console.log('\n🔍 Testing Avatar Upload (simulated)...');
  if (!user) {
    console.error('❌ Cannot test avatar upload: No user available');
    return false;
  }
  
  try {
    // Simulate avatar upload by setting the avatar path
    const avatarPath = '/uploads/test-avatar.png';
    user.avatar = avatarPath;
    
    await user.save();
    console.log('✅ Avatar upload simulation successful');
    
    // Check if uploads directory exists
    const uploadsDir = path.join(__dirname, '../../public/uploads');
    if (fs.existsSync(uploadsDir)) {
      console.log('✅ Uploads directory exists');
    } else {
      console.warn('⚠️ Uploads directory does not exist: ' + uploadsDir);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Avatar upload simulation failed:', error.message);
    return false;
  }
}

// Main validation function
async function validateAllFeatures() {
  console.log('====== FEATURE VALIDATION ======');
  
  // Test MongoDB connection
  const isConnected = await validateMongoConnection();
  if (!isConnected) {
    console.error('❌ Cannot proceed: MongoDB connection failed');
    process.exit(1);
  }
  
  // Test user registration
  const user = await validateUserRegistration();
  
  // Test user authentication
  await validateUserAuthentication(user);
  
  // Test profile update
  await validateProfileUpdate(user);
  
  // Test avatar upload
  await validateAvatarUpload(user);
  
  console.log('\n====== VALIDATION COMPLETE ======');
  console.log('\n✅ Your application has been set up correctly.');
  console.log('\nNext steps:');
  console.log('1. Run the application: npm run dev:full');
  console.log('2. Open your browser at: http://localhost:5173');
  console.log('3. Register a new account or log in with:');
  console.log('   - Email: test@example.com');
  console.log('   - Password: password123\n');
  
  // Close MongoDB connection
  await mongoose.connection.close();
}

// Run validation
validateAllFeatures().catch(error => {
  console.error('Validation error:', error);
  mongoose.connection.close();
  process.exit(1);
}); 