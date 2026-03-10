import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';

// Import routes (to be created)
import authRoutes from './routes/authRoutes.js';
import memoryRoutes from './routes/memoryRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import galleryRoutes from './routes/galleryRoutes.js';
import calendarRoutes from './routes/calendarRoutes.js';

// Import middleware
import { errorHandler } from './middleware/errorMiddleware.js';
import Message from './models/Message.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express app
const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;

// Socket.io setup
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Request logging middleware (development)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// Health check route
app.get('/', (req, res) => {
  res.json({
    message: '🔒 Private Memory Sharing API',
    status: 'Running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/memories', memoryRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/calendar', calendarRoutes);

// Socket.io real-time chat
io.on('connection', (socket) => {
  console.log(`🔌 Socket connected: ${socket.id}`);

  socket.on('sendMessage', async (data) => {
    try {
      const message = await Message.create({
        sender: data.senderId,
        senderName: data.senderName,
        text: data.text || '',
        image: data.image || null,
      });
      io.emit('newMessage', message);
    } catch (err) {
      console.error('Socket message error:', err.message);
    }
  });

  socket.on('addReaction', async (data) => {
    try {
      const message = await Message.findByIdAndUpdate(
        data.messageId,
        { reaction: data.reaction },
        { new: true }
      );
      if (message) io.emit('reactionUpdated', message);
    } catch (err) {
      console.error('Reaction error:', err.message);
    }
  });

  socket.on('typing', (data) => {
    socket.broadcast.emit('partnerTyping', data);
  });

  socket.on('stopTyping', () => {
    socket.broadcast.emit('partnerStopTyping');
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Socket disconnected: ${socket.id}`);
  });
});

// 404 Handler
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`📍 Server URL: http://localhost:${PORT}`);
});

export default app;

