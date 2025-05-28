const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();

const app = express();
const server = http.createServer(app);

// ✅ Socket.io setup
const io = new Server(server, {
  cors: {
    origin: '*', // Adjust to match your frontend origin
    methods: ['GET', 'POST']
  }
});

// ✅ Attach `io` to each request
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.set('io', io);

// ✅ Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Routes
const authRoutes = require('./routes/authRoutes');
const lessonRoutes = require('./routes/lessonRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const userRoutes = require('./routes/userRoutes');
const communityRoutes = require('./routes/communityRoutes');
const adminRoutes = require('./routes/adminRoutes');


app.use('/api/auth', authRoutes);
app.use('/api/lessons', require('./routes/lessonRoutes'));
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/admin', adminRoutes);


// ✅ Auto-create admin
const createAdminIfNotExists = async () => {
  const existing = await User.findOne({ username: 'kayaniadmin' });
  if (!existing) {
    const hashedPassword = await bcrypt.hash('#Kayani2025', 10);
    const admin = new User({
      username: 'kayaniadmin',
      password: hashedPassword,
      avatar: ''
    });
    await admin.save();
    console.log('✅ Admin user created: kayaniadmin');
  } else {
    console.log('✅ Admin already exists');
  }
};

// Socket connection
io.on('connection', (socket) => {
  console.log('⚡ Client connected');
  socket.on('disconnect', () => {
    console.log('🚫 Client disconnected');
  });
  });

// ✅ MongoDB connection and server start
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('✅ MongoDB connected');
  await createAdminIfNotExists();
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
})
.catch((err) => {
  console.error('❌ MongoDB connection error:', err);
});