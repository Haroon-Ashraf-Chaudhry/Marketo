const jwt = require('jsonwebtoken');
const User = require('../models/User');

const onlineUsers = new Map(); // userId -> socketId

const setupSocket = (io) => {
  // Auth middleware for Socket.io
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication error'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (!user) return next(new Error('User not found'));
      socket.user = user;
      next();
    } catch {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user._id.toString();
    onlineUsers.set(userId, socket.id);
    console.log(`User connected: ${socket.user.name} (${userId})`);

    // Broadcast online status
    io.emit('user:online', { userId });

    // Join personal room for notifications
    socket.join(`user:${userId}`);

    // Join conversation room
    socket.on('conversation:join', (conversationId) => {
      socket.join(`conv:${conversationId}`);
    });

    socket.on('conversation:leave', (conversationId) => {
      socket.leave(`conv:${conversationId}`);
    });

    // Real-time message — emit to room (REST API saves it, socket broadcasts)
    socket.on('message:send', ({ conversationId, message }) => {
      socket.to(`conv:${conversationId}`).emit('message:receive', {
        ...message,
        sender: { _id: userId, name: socket.user.name, avatar: socket.user.avatar },
      });
    });

    // Typing indicator
    socket.on('typing:start', ({ conversationId }) => {
      socket.to(`conv:${conversationId}`).emit('typing:start', {
        userId, name: socket.user.name,
      });
    });

    socket.on('typing:stop', ({ conversationId }) => {
      socket.to(`conv:${conversationId}`).emit('typing:stop', { userId });
    });

    // Notify a user (used after order status change)
    socket.on('notify:user', ({ targetUserId, notification }) => {
      const targetSocket = onlineUsers.get(targetUserId);
      if (targetSocket) {
        io.to(`user:${targetUserId}`).emit('notification', notification);
      }
    });

    socket.on('disconnect', () => {
      onlineUsers.delete(userId);
      io.emit('user:offline', { userId });
      console.log(`User disconnected: ${socket.user.name}`);
    });
  });

  return io;
};

module.exports = { setupSocket, onlineUsers };
