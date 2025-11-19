const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
dotenv.config();

const postRoute = require('./routes/post.route.js');
const authRoute = require('./routes/auth.route.js');
const testRoute = require('./routes/test.route.js');
const userRoute = require('./routes/user.route.js');
const chatRoute = require('./routes/chat.route.js'); // Add chat routes

const app = express();
const server = http.createServer(app); // Create HTTP server for Socket.io

// Socket.io configuration
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true
  }
});

// Middleware to attach io to requests
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use(cors({origin: process.env.CLIENT_URL, credentials:true}));
app.use(express.json());
app.use(cookieParser());

// Improved MongoDB connection
const URI = process.env.URI;

mongoose.connect(URI)
.then(() => {
    console.log("Database Connected Successfully!");
})
.catch((err) => {
    console.log("Database Connection Failed!", err);
    process.exit(1);
});

// Connection event handlers
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to DB');
});

mongoose.connection.on('error', (err) => {
  console.log('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected');
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join room for owner notifications
  socket.on('joinOwnerRoom', (ownerId) => {
    socket.join(ownerId);
    console.log(`Owner ${ownerId} joined their room`);
  });

  // Join room for client notifications
  socket.on('joinClientRoom', (clientId) => {
    socket.join(clientId);
    console.log(`Client ${clientId} joined their room`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Routes
app.use("/auth", authRoute);
app.use("/users", userRoute);
app.use("/posts", postRoute);
app.use("/test", testRoute);
app.use("/api/chat", chatRoute); // Add chat routes

// Health check endpoint
app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.status(200).json({ 
    status: 'OK', 
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
});

server.listen(8800, () => {
    console.log("Server is Running on port 8800!");
});