import mongoose from 'mongoose';

const wishlistItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  category: {
    type: String,
    enum: ['experience', 'gift', 'travel', 'other'],
    default: 'other'
  },
  estimatedCost: {
    type: Number,
    default: 0
  },
  link: {
    type: String,
    default: null
  },
  image: {
    type: String,
    default: null
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedDate: {
    type: Date,
    default: null
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for faster queries
wishlistItemSchema.index({ addedBy: 1, isCompleted: 1 });
wishlistItemSchema.index({ priority: 1 });

const WishlistItem = mongoose.model('WishlistItem', wishlistItemSchema);

export default WishlistItem;

