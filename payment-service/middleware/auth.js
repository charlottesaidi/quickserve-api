const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');
const logger = require('../utils/logger');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Accès non autorisé' });
  }
  
  try {
    const user = jwt.verify(token, JWT_SECRET);
    req.user = user;
    next();
  } catch (error) {
    logger.error('Token d\'authentification invalide:', error);
    return res.status(403).json({ message: 'Token invalide' });
  }
}

module.exports = {
  authenticateToken,
};