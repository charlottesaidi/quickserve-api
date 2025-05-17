const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, SOCKET_CORS } = require('./env');
const logger = require('../utils/logger');

let io;

function initializeSocket(server) {
  io = socketIo(server, {
    cors: SOCKET_CORS
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.query.token;
    
    if (!token) {
      return next(new Error('Authentication error'));
    }
    
    try {
      // Vérifier le token JWT
      const user = jwt.verify(token, JWT_SECRET);
      socket.userId = user.id;
      socket.userRole = user.role;
      next();
    } catch (error) {
      logger.error('Socket authentication error:', error);
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    logger.info(`Client connecté: ${socket.id} (User: ${socket.userId})`);
    
    socket.join(`user_${socket.userId}`);
    
    socket.on('disconnect', () => {
      logger.info(`Client déconnecté: ${socket.id}`);
    });
  });

  return io;
}

function getIO() {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
}

module.exports = {
  initializeSocket,
  getIO
};