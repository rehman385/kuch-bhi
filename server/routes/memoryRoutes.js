import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getMemories,
  getMemoryById,
  createMemory,
  updateMemory,
  deleteMemory
} from '../controllers/memoryController.js';

const router = express.Router();

// All memory routes are protected
router.use(protect);

router.route('/')
  .get(getMemories)
  .post(createMemory);

router.route('/:id')
  .get(getMemoryById)
  .put(updateMemory)
  .delete(deleteMemory);

export default router;

