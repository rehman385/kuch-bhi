import express from 'express';
import { uploadMedia, getGallery, deleteMedia, upload } from '../controllers/galleryController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getGallery);
router.post('/', protect, upload.single('media'), uploadMedia);
router.delete('/:id', protect, deleteMedia);

export default router;

