import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import http from 'http'; // Added for socket.io
import { Server } from 'socket.io'; // Added for socket.io
import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import { errorHandler } from './middleware/errorMiddleware.js';
import clientRoutes from './routes/clientRoutes.js';
import sessionRoutes from './routes/sessionRoutes.js';
import invoiceRoutes from './routes/invoiceRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import inviteRoutes from './routes/inviteRoutes.js';
import conversationRoutes from './routes/conversationRoutes.js'; // Import conversation routes
// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const httpServer = http.createServer(app); // Create HTTP server
const io = new Server(httpServer, { // Initialize socket.io
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173", // Allow frontend origin
    methods: ["GET", "POST"]
  }
});

// In-memory storage for user sockets { userId: socketId }
const userSockets = {};

export { io, userSockets }; // Export for use in controllers

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CORS configuration
const corsOptions = {
  origin: '*', // Allow all origins for debugging - restrict this in production
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/invites', inviteRoutes);
app.use('/api/conversations', conversationRoutes); // Mount conversation routes
// Serve static files from dist directory
app.use(express.static(path.join(__dirname, '../dist')));

// Handle all other routes by serving index.html
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../dist/index.html'));
});

// Error handling
app.use(errorHandler);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Handle user registration event
  socket.on('register_user', (userId) => {
    if (userId) {
      userSockets[userId] = socket.id;
      console.log(`User ${userId} registered with socket ${socket.id}`);
      console.log('Current user sockets:', userSockets);
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    // Find userId associated with this socket.id and remove it
    for (const userId in userSockets) {
      if (userSockets[userId] === socket.id) {
        delete userSockets[userId];
        console.log(`User ${userId} removed from socket mapping.`);
        console.log('Current user sockets:', userSockets);
        break;
      }
    }
  });
});


const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => { // Use httpServer to listen
  console.log(`Server running on port ${PORT}`);
});