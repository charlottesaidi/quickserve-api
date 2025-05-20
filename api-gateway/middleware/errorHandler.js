const logger = require('../utils/logger');

// Middleware de gestion des erreurs
function errorHandler(err, req, res) {
  // Log de l'erreur
  logger.error({
    message: 'Erreur non gérée',
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
  });

  // Déterminer le code de statut approprié
  const statusCode = err.status || 500;
  
  // Répondre avec un message d'erreur, en masquant les détails en production
  res.status(statusCode).json({
    message: err.message || 'Erreur serveur',
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
}

module.exports = errorHandler;