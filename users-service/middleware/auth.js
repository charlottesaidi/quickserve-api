const authService = require('../services/authService');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Accès non autorisé' });
  }
  
  try {
    const user = authService.verifyToken(token);
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Token invalide' });
  }
}

// Middleware pour vérifier le rôle de l'utilisateur
function checkRole(role) {
  return (req, res, next) => {
    // S'assurer que l'utilisateur est authentifié
    if (!req.user) {
      return res.status(401).json({ message: 'Accès non autorisé' });
    }
    
    // Vérifier le rôle
    if (req.user.role !== role && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès non autorisé - Rôle insuffisant' });
    }
    
    next();
  };
}

module.exports = {
  authenticateToken,
  checkRole,
};