// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs'); // ✅ Added for folder check
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();

const app = express();
const server = http.createServer(app);

// ✅ Socket.io setup
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// ✅ Attach io to requests
app.use((req, res, next) => {
  req.io = io;
  next();
});

// ✅ Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// ✅ Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Serve uploads statically (thumbnails & audio)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Main API Routes
app.get('/', (req, res) => res.send('🚀 Kilo App Backend is running!'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/lessons', require('./routes/lessonRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api', require('./routes/notificationRoutes')); // still used?
app.use('/api/community', require('./routes/communityRoutes'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/global-user-setting', require('./routes/globalUserSettingRoutes'));

// ✅ Auto-create admin if not exists
const createAdminIfNotExists = require('./utils/createAdminIfNotExists');

// 🔥 Global error handler
app.use((err, req, res, next) => {
  console.error('🔥 Uncaught error:', err);
  res.status(500).json({
    message: 'Something went wrong at the server level',
    error: err.message,
    full: err
  });
});

// ✅ MongoDB + server start
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('✅ MongoDB connected');
  await createAdminIfNotExists();
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
})
.catch((err) => {
  console.error('❌ MongoDB connection error:', err);
});

// ✅ Socket.io connection
io.on('connection', (socket) => {
  console.log('⚡ Client connected');
  socket.on('disconnect', () => {
    console.log('🚫 Client disconnected');
  });
});
