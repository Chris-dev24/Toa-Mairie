const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
require('express-async-errors');

dotenv.config();

const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const { sequelize, User, Message } = require('./models');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');
const documentRoutes = require('./routes/documents');
const messagingRoutes = require('./routes/messaging');
const formRoutes = require('./routes/forms');
const dashboardRoutes = require('./routes/dashboard');
const syncRoutes = require('./routes/sync');

const app = express();
const server = http.createServer(app);

// Socket.io with CORS
const io = socketIO(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Store active users
const activeUsers = new Map(); // userId -> { socketId, joinedAt }

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/messaging', messagingRoutes);
app.use('/api/forms', formRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/sync', syncRoutes);

// Socket.io Middleware - Authenticate connection
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  
  if (!token) {
    logger.warn(`Connection attempt without token from ${socket.id}`);
    return next(new Error('Authentication token missing'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    socket.userRole = decoded.role;
    socket.userEmail = decoded.email;
    next();
  } catch (error) {
    logger.warn(`Authentication failed for socket ${socket.id}:`, error.message);
    next(new Error('Invalid authentication token'));
  }
});

// WebSocket connection and event handling
io.on('connection', (socket) => {
  const userId = socket.userId;
  const userEmail = socket.userEmail;
  
  logger.info(`User ${userEmail} connected with socket ${socket.id}`);

  // Track active user
  activeUsers.set(userId, {
    socketId: socket.id,
    joinedAt: new Date(),
    email: userEmail,
    role: socket.userRole
  });

  // Auto-join user room for direct messages
  socket.join(`user_${userId}`);
  
  // Broadcast user online status
  io.emit('user_online', {
    userId,
    email: userEmail,
    timestamp: new Date()
  });

  // Join conversation/group room
  socket.on('join_conversation', (conversationId) => {
    socket.join(`conversation_${conversationId}`);
    logger.debug(`User ${userId} joined conversation ${conversationId}`);
    io.to(`conversation_${conversationId}`).emit('user_joined', {
      userId,
      conversationId,
      timestamp: new Date()
    });
  });

  // Leave conversation/group room
  socket.on('leave_conversation', (conversationId) => {
    socket.leave(`conversation_${conversationId}`);
    logger.debug(`User ${userId} left conversation ${conversationId}`);
    io.to(`conversation_${conversationId}`).emit('user_left', {
      userId,
      conversationId,
      timestamp: new Date()
    });
  });

  // Typing indicator
  socket.on('typing', ({ conversationId, isTyping }) => {
    io.to(`conversation_${conversationId}`).emit('typing', {
      userId,
      email: userEmail,
      isTyping,
      timestamp: new Date()
    });
  });

  // Real-time message delivery acknowledgment
  socket.on('message_delivered', (messageId) => {
    logger.debug(`Message ${messageId} delivered to user ${userId}`);
  });

  // Mark message as read (persist and notify)
  socket.on('message_read', async ({ messageId, conversationId }, ack) => {
    try {
      if (!messageId) return ack && ack({ success: false, message: 'messageId missing' });

      // Update DB
      const msg = await Message.findByPk(messageId);
      if (!msg) return ack && ack({ success: false, message: 'Message not found' });

      await msg.update({ isRead: true, readAt: new Date() });

      io.to(`conversation_${conversationId}`).emit('message_read', {
        messageId,
        userId,
        timestamp: new Date()
      });

      ack && ack({ success: true });
    } catch (error) {
      logger.error('Socket message_read error:', error);
      ack && ack({ success: false, message: error.message });
    }
  });

  // Project updates subscription
  socket.on('subscribe_project', (projectId) => {
    socket.join(`project_${projectId}`);
    logger.debug(`User ${userId} subscribed to project ${projectId}`);
  });

  socket.on('unsubscribe_project', (projectId) => {
    socket.leave(`project_${projectId}`);
    logger.debug(`User ${userId} unsubscribed from project ${projectId}`);
  });

  // Task updates subscription
  socket.on('subscribe_task', (taskId) => {
    socket.join(`task_${taskId}`);
    logger.debug(`User ${userId} subscribed to task ${taskId}`);
  });

  socket.on('unsubscribe_task', (taskId) => {
    socket.leave(`task_${taskId}`);
    logger.debug(`User ${userId} unsubscribed from task ${taskId}`);
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    activeUsers.delete(userId);
    logger.info(`User ${userEmail} disconnected (socket: ${socket.id})`);
    
    // Broadcast user offline status
    io.emit('user_offline', {
      userId,
      email: userEmail,
      timestamp: new Date()
    });
  });

  // Handle send_message via socket (persist + emit)
  socket.on('send_message', async (payload, ack) => {
    try {
      const { content, receiverId, groupId, attachments } = payload || {};
      const senderId = userId;

      if (!content || (!receiverId && !groupId)) {
        return ack && ack({ success: false, message: 'Invalid payload' });
      }

      const message = await Message.create({
        senderId,
        receiverId: receiverId || null,
        groupId: groupId || null,
        content,
        attachments: attachments || []
      });

      const populated = await Message.findByPk(message.id, {
        include: [
          { model: User, as: 'sender', attributes: ['id', 'firstName', 'lastName', 'email'] }
        ]
      });

      if (receiverId) {
        io.to(`user_${receiverId}`).emit('message_received', populated);
      } else if (groupId) {
        io.to(`group_${groupId}`).emit('message_received', populated);
      }

      // Acknowledge sender with created message
      ack && ack({ success: true, data: populated });
    } catch (error) {
      logger.error('Socket send_message error:', error);
      ack && ack({ success: false, message: error.message });
    }
  });

  // Error handling
  socket.on('error', (error) => {
    logger.error(`Socket error for user ${userId}:`, error);
  });
});

// Make io accessible to routes
app.set('io', io);

// Error handling
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    logger.info('Database connection established');

    // Sync models
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      logger.info('Database models synchronized');
    }

    server.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = { app, io };
