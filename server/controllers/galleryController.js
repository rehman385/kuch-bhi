import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { asyncHandler } from '../middleware/errorMiddleware.js';
import Gallery from '../models/Gallery.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Only images and mp4 videos are allowed'), false);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
});

// @desc  Upload a photo/video
// @route POST /api/gallery
// @access Protected
export const uploadMedia = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No file uploaded');
  }

  const media = await Gallery.create({
    uploadedBy: req.user._id,
    uploaderName: req.user.name,
    filename: req.file.filename,
    originalName: req.file.originalname,
    caption: req.body.caption || '',
    mimetype: req.file.mimetype,
  });

  res.status(201).json({ success: true, data: media });
});

// @desc  Get all gallery items
// @route GET /api/gallery
// @access Protected
export const getGallery = asyncHandler(async (req, res) => {
  const items = await Gallery.find().sort({ createdAt: -1 });
  res.json({ success: true, data: items });
});

// @desc  Delete a gallery item
// @route DELETE /api/gallery/:id
// @access Protected
export const deleteMedia = asyncHandler(async (req, res) => {
  const item = await Gallery.findById(req.params.id);
  if (!item) {
    res.status(404);
    throw new Error('Item not found');
  }

  // Delete the file from disk
  const filePath = path.join(uploadsDir, item.filename);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

  await item.deleteOne();
  res.json({ success: true, message: 'Deleted successfully' });
});

