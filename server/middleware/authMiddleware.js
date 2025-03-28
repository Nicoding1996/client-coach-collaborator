import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

const protect = asyncHandler(async (req, res, next) => {
  let token;

  console.log('Checking authentication:', req.headers.authorization ? 'Token provided' : 'No token');

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];
      console.log('Token received, attempting verification');

      // Verify token
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Token verified successfully for user:', decoded.id);

        // Get user from the token (exclude password)
        req.user = await User.findById(decoded.id).select('-password');

        if (!req.user) {
          console.log('Token valid but user not found in database');
          res.status(401);
          throw new Error('Not authorized, user not found');
        }

        next();
      } catch (jwtError) {
        console.error('JWT verification failed:', jwtError.message);
        
        if (jwtError.name === 'TokenExpiredError') {
          res.status(401).json({ message: 'Token expired, please login again' });
        } else if (jwtError.name === 'JsonWebTokenError') {
          res.status(401).json({ message: 'Invalid token, please login again' });
        } else {
          res.status(401).json({ message: 'Token validation failed, please login again' });
        }
        return;
      }
    } catch (error) {
      console.error('Auth middleware error:', error);
      res.status(401).json({ message: 'Not authorized, authentication failed' });
      return;
    }
  } else if (!token) {
    console.log('No token provided in request');
    res.status(401).json({ message: 'Not authorized, no token provided' });
    return;
  }
});

// Middleware to check if user has a specific role
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      console.log('Role check failed: No user in request');
      res.status(401).json({ message: 'Not authorized, no user found' });
      return;
    }

    console.log(`Role check: User role ${req.user.role}, allowed roles:`, roles);
    if (!roles.includes(req.user.role)) {
      console.log('Role check failed: User does not have required role');
      res.status(403).json({ message: `Not authorized, requires role: ${roles.join(' or ')}` });
      return;
    }
    
    next();
  };
};

export { protect, authorize }; 