import express from 'express';
import { getMessages, addReaction, uploadChatImage } from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../controllers/galleryController.js';

const router = express.Router();

router.get('/messages', protect, getMessages);
router.put('/messages/:id/reaction', protect, addReaction);
router.post('/upload', protect, upload.single('image'), uploadChatImage);

export default router;
