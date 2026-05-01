const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIO = require('socket.io');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const setupSocketHandlers = require('./socket');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

// Initialize Express
const app = express();

// Create HTTP server for Socket.io
const server = http.createServer(app);

// Initialize Socket.io with CORS
const io = socketIO(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Setup Socket.io handlers
setupSocketHandlers(io);

// ─── MIDDLEWARE ──────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Make 'io' available to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// ─── ROUTES ─────────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
    res.json({ message: 'Civic Issue Reporting Platform API is running 🚀' });
});

app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/notifications', notificationRoutes);

// ─── ERROR HANDLER (must be after routes) ───────────────────────────────────
app.use(errorHandler);

// ─── START SERVER ───────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const startServer = async () => {
    await connectDB();
    server.listen(PORT, () => {
        console.log(`✅ Server running on port ${PORT}`);
        console.log(`🔌 Socket.io ready for real-time connections`);
    });
};

startServer();
