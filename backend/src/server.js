import 'dotenv/config';
import express from 'express';
import { createServer } from 'http'; // Native Node module
import { Server } from 'socket.io';   // Socket.io Server package
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import { initNotificationScheduler } from './services/notificationScheduler.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); // Essential for parsing JSON body payloads

// Initialize Socket.io Server with a permissive local testing configuration
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Allows Thunder Client or your local app port to connect seamlessly
    allowedHeaders: ["ngrok-skip-browser-warning"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  },
    transports: ["websocket"]
});

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);


// Base Health Check Route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Real-Time Pipelines
io.on('connection', (socket) => {
  console.log(`📡 Client connected to WebSockets: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

// Pass down the instantiated 'io' object so your background cron tasks can emit messages
initNotificationScheduler(io);

// CRITICAL FIX: listen via httpServer instead of app to keep WebSocket bindings active!
httpServer.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});