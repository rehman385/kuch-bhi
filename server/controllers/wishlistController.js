import { asyncHandler } from '../middleware/errorMiddleware.js';
import WishlistItem from '../models/WishlistItem.js';

// @desc    Get all wishlist items
// @route   GET /api/wishlist
// @access  Private
export const getWishlistItems = asyncHandler(async (req, res) => {
  // Get all wishlist items, sorted by priority and creation date
  const items = await WishlistItem.find()
    .populate('addedBy', 'name email avatar')
    .sort({ isCompleted: 1, priority: -1, createdAt: -1 });

  res.json({
    success: true,
    count: items.length,
    data: items
  });
});

// @desc    Get single wishlist item by ID
// @route   GET /api/wishlist/:id
// @access  Private
export const getWishlistItemById = asyncHandler(async (req, res) => {
  const item = await WishlistItem.findById(req.params.id)
    .populate('addedBy', 'name email avatar');

  if (!item) {
    res.status(404);
    throw new Error('Wishlist item not found');
  }

  res.json({
    success: true,
    data: item
  });
});

// @desc    Create new wishlist item
// @route   POST /api/wishlist
// @access  Private
export const createWishlistItem = asyncHandler(async (req, res) => {
  const { title, description, priority, category, estimatedCost, link, image } = req.body;

  // Validation
  if (!title || !description) {
    res.status(400);
    throw new Error('Please provide title and description');
  }

  const item = await WishlistItem.create({
    title,
    description,
    priority: priority || 'medium',
    category: category || 'other',
    estimatedCost: estimatedCost || 0,
    link: link || null,
    image: image || null,
    addedBy: req.user._id
  });

  res.status(201).json({
    success: true,
    data: item
  });
});

// @desc    Update wishlist item
// @route   PUT /api/wishlist/:id
// @access  Private
export const updateWishlistItem = asyncHandler(async (req, res) => {
  const item = await WishlistItem.findById(req.params.id);

  if (!item) {
    res.status(404);
    throw new Error('Wishlist item not found');
  }

  // Update fields
  item.title = req.body.title || item.title;
  item.description = req.body.description || item.description;
  item.priority = req.body.priority || item.priority;
  item.category = req.body.category || item.category;
  item.estimatedCost = req.body.estimatedCost !== undefined ? req.body.estimatedCost : item.estimatedCost;
  item.link = req.body.link !== undefined ? req.body.link : item.link;
  item.image = req.body.image !== undefined ? req.body.image : item.image;

  // Handle completion status
  if (req.body.isCompleted !== undefined) {
    item.isCompleted = req.body.isCompleted;
    item.completedDate = req.body.isCompleted ? new Date() : null;
  }

  const updatedItem = await item.save();

  res.json({
    success: true,
    data: updatedItem
  });
});

// @desc    Delete wishlist item
// @route   DELETE /api/wishlist/:id
// @access  Private
export const deleteWishlistItem = asyncHandler(async (req, res) => {
  const item = await WishlistItem.findById(req.params.id);

  if (!item) {
    res.status(404);
    throw new Error('Wishlist item not found');
  }

  await item.deleteOne();

  res.json({
    success: true,
    message: 'Wishlist item deleted successfully',
    data: {}
  });
});

