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
const chatRoute = require('./routes/chat.route.js');

const app = express();
const server = http.createServer(app); 

const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true
  }
});

app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use(cors({
  origin:[" process.env.CLIENT_URL",
"https://frontend-drab-three-53.vercel.app", "https://dewgateconsults.netlify.app", "http://localhost:5173"],
 credentials:true}));
app.use(express.json());
app.use(cookieParser());

const URI = process.env.URI;

mongoose.connect(URI)
.then(() => {
    console.log("Database Connected Successfully!");
})
.catch((err) => {
    console.log("Database Connection Failed!", err);
    process.exit(1);
});

mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to DB');
});

mongoose.connection.on('error', (err) => {
  console.log('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected');
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('joinOwnerRoom', (ownerId) => {
    socket.join(ownerId);
    console.log(`Owner ${ownerId} joined their room`);
  });

  socket.on('joinClientRoom', (clientId) => {
    socket.join(clientId);
    console.log(`Client ${clientId} joined their room`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

app.use("/auth", authRoute);
app.use("/users", userRoute);
app.use("/posts", postRoute);
app.use("/test", testRoute);
app.use("/api/chat", chatRoute); 

app.post('/profile/update', (req, res) => {
  // handle update logic
  res.send({ success: true });
});

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