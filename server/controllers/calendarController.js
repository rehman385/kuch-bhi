import { asyncHandler } from '../middleware/errorMiddleware.js';
import CalendarEvent from '../models/CalendarEvent.js';

// @desc  Get all calendar events
// @route GET /api/calendar
// @access Protected
export const getEvents = asyncHandler(async (req, res) => {
  const events = await CalendarEvent.find().sort({ date: 1 });
  res.json({ success: true, data: events });
});

// @desc  Create a calendar event
// @route POST /api/calendar
// @access Protected
export const createEvent = asyncHandler(async (req, res) => {
  const { title, date, emoji, type } = req.body;
  if (!title || !date) {
    res.status(400);
    throw new Error('Title and date are required');
  }
  const event = await CalendarEvent.create({
    title,
    date,
    emoji: emoji || '💕',
    type: type || 'special',
    createdBy: req.user._id,
  });
  res.status(201).json({ success: true, data: event });
});

// @desc  Delete a calendar event
// @route DELETE /api/calendar/:id
// @access Protected
export const deleteEvent = asyncHandler(async (req, res) => {
  const event = await CalendarEvent.findById(req.params.id);
  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }
  await event.deleteOne();
  res.json({ success: true, message: 'Event deleted' });
});

