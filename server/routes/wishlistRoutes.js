import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getWishlistItems,
  getWishlistItemById,
  createWishlistItem,
  updateWishlistItem,
  deleteWishlistItem
} from '../controllers/wishlistController.js';

const router = express.Router();

// All wishlist routes are protected
router.use(protect);

router.route('/')
  .get(getWishlistItems)
  .post(createWishlistItem);

router.route('/:id')
  .get(getWishlistItemById)
  .put(updateWishlistItem)
  .delete(deleteWishlistItem);

export default router;

