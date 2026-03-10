import jwt from 'jsonwebtoken';
import { asyncHandler } from './errorMiddleware.js';
import User from '../models/User.js';

// Protect routes - verify JWT token
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header (format: "Bearer TOKEN")
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token (exclude password)
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        res.status(401);
        throw new Error('User not found');
      }

      next();
    } catch (error) {
      console.error('Token verification error:', error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token provided');
  }
});

// Validate registration secret key
export const validateRegistrationSecret = (req, res, next) => {
  const { registrationSecret } = req.body;
  const envSecret = process.env.REGISTRATION_SECRET;

  if (!registrationSecret || !envSecret || registrationSecret.trim() !== envSecret.trim()) {
    console.log('--- Debug Registration Secret FAILED ---');
    console.log('Received (trimmed):', registrationSecret?.trim());
    console.log('Expected (trimmed):', envSecret?.trim());
    console.log('----------------------------------------');

    res.status(403);
    throw new Error('Invalid registration secret. This app is private.');
  }

  next();
};
