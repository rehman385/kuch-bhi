import express from 'express';
import { getEvents, createEvent, deleteEvent } from '../controllers/calendarController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getEvents);
router.post('/', protect, createEvent);
router.delete('/:id', protect, deleteEvent);

export default router;

