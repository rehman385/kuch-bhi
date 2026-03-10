import express from 'express';
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  updateMood
} from '../controllers/authController.js';
import { protect, validateRegistrationSecret } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', validateRegistrationSecret, registerUser);
router.post('/login', loginUser);

// Protected routes
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.put('/mood', protect, updateMood);

export default router;
