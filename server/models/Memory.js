import mongoose from 'mongoose';

const memorySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  date: {
    type: Date,
    default: Date.now
  },
  images: [{
    url: String,
    caption: String
  }],
  tags: [{
    type: String,
    trim: true
  }],
  isFavorite: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for faster queries
memorySchema.index({ createdBy: 1, date: -1 });
memorySchema.index({ tags: 1 });

const Memory = mongoose.model('Memory', memorySchema);

export default Memory;

