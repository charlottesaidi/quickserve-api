const jwt = require('jsonwebtoken');
const env = require('../config/env');
const logger = require('../utils/logger');

// Liste des chemins qui ne nécessitent pas d'authentification
const publicPaths = [
  '/users/login',
  '/users/register',
  '/categories',
  '/health',
];

// Middleware d'authentification
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    
    jwt.verify(token, env.JWT_SECRET, (err, user) => {
      if (err) {
        logger.warn(`Tentative d'accès avec un token invalide: ${err.message}`);
        return res.status(403).json({ message: 'Token invalide' });
      }
      
      req.user = user;
      next();
    });
  } else {
    // Vérifier si c'est une route publique
    const isPublicPath = publicPaths.some((path) => req.path.includes(path));
    
    if (isPublicPath) {
      next();
    } else {
      logger.warn(`Tentative d'accès sans authentification: ${req.path}`);
      res.status(401).json({ message: 'Authentification requise' });
    }
  }
};

module.exports = authenticateJWT;