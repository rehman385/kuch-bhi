import { asyncHandler } from '../middleware/errorMiddleware.js';
import Message from '../models/Message.js';

// @desc  Get last 100 messages
// @route GET /api/chat/messages
// @access Protected
export const getMessages = asyncHandler(async (req, res) => {
  const messages = await Message.find()
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

  res.json({ success: true, data: messages.reverse() });
});

// @desc  Add reaction to a message
// @route PUT /api/chat/messages/:id/reaction
// @access Protected
export const addReaction = asyncHandler(async (req, res) => {
  const { reaction } = req.body;
  const message = await Message.findByIdAndUpdate(
    req.params.id,
    { reaction },
    { new: true }
  );
  if (!message) {
    res.status(404);
    throw new Error('Message not found');
  }
  res.json({ success: true, data: message });
});

// @desc  Upload chat image
// @route POST /api/chat/upload
// @access Protected
export const uploadChatImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No file uploaded');
  }

  // Return the path to the file
  res.json({
    success: true,
    url: `/uploads/${req.file.filename}`,
  });
});
