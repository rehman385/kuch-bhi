import { asyncHandler } from '../middleware/errorMiddleware.js';
import Memory from '../models/Memory.js';

// @desc    Get all memories
// @route   GET /api/memories
// @access  Private
export const getMemories = asyncHandler(async (req, res) => {
  // Get all memories, sorted by date (newest first)
  const memories = await Memory.find()
    .populate('createdBy', 'name email avatar')
    .sort({ date: -1 });

  res.json({
    success: true,
    count: memories.length,
    data: memories
  });
});

// @desc    Get single memory by ID
// @route   GET /api/memories/:id
// @access  Private
export const getMemoryById = asyncHandler(async (req, res) => {
  const memory = await Memory.findById(req.params.id)
    .populate('createdBy', 'name email avatar');

  if (!memory) {
    res.status(404);
    throw new Error('Memory not found');
  }

  res.json({
    success: true,
    data: memory
  });
});

// @desc    Create new memory
// @route   POST /api/memories
// @access  Private
export const createMemory = asyncHandler(async (req, res) => {
  const { title, description, date, images, tags, isFavorite } = req.body;

  // Validation
  if (!title || !description) {
    res.status(400);
    throw new Error('Please provide title and description');
  }

  const memory = await Memory.create({
    title,
    description,
    date: date || Date.now(),
    images: images || [],
    tags: tags || [],
    isFavorite: isFavorite || false,
    createdBy: req.user._id
  });

  res.status(201).json({
    success: true,
    data: memory
  });
});

// @desc    Update memory
// @route   PUT /api/memories/:id
// @access  Private
export const updateMemory = asyncHandler(async (req, res) => {
  const memory = await Memory.findById(req.params.id);

  if (!memory) {
    res.status(404);
    throw new Error('Memory not found');
  }

  // Update fields
  memory.title = req.body.title || memory.title;
  memory.description = req.body.description || memory.description;
  memory.date = req.body.date || memory.date;
  memory.images = req.body.images !== undefined ? req.body.images : memory.images;
  memory.tags = req.body.tags !== undefined ? req.body.tags : memory.tags;
  memory.isFavorite = req.body.isFavorite !== undefined ? req.body.isFavorite : memory.isFavorite;

  const updatedMemory = await memory.save();

  res.json({
    success: true,
    data: updatedMemory
  });
});

// @desc    Delete memory
// @route   DELETE /api/memories/:id
// @access  Private
export const deleteMemory = asyncHandler(async (req, res) => {
  const memory = await Memory.findById(req.params.id);

  if (!memory) {
    res.status(404);
    throw new Error('Memory not found');
  }

  await memory.deleteOne();

  res.json({
    success: true,
    message: 'Memory deleted successfully',
    data: {}
  });
});

