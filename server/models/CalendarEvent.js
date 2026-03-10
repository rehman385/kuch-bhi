import mongoose from 'mongoose';

const calendarEventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: String, // stored as "YYYY-MM-DD"
      required: true,
    },
    emoji: {
      type: String,
      default: '💕',
    },
    type: {
      type: String,
      enum: ['anniversary', 'birthday', 'special', 'date', 'other'],
      default: 'special',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

const CalendarEvent = mongoose.model('CalendarEvent', calendarEventSchema);
export default CalendarEvent;

