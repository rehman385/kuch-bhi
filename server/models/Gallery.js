import mongoose from 'mongoose';

const gallerySchema = new mongoose.Schema(
  {
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    uploaderName: {
      type: String,
      required: true,
    },
    filename: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    caption: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },
    mimetype: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Gallery = mongoose.model('Gallery', gallerySchema);
export default Gallery;

