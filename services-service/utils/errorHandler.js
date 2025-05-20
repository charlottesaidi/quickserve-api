const logger = require('./logger');

// Middleware de gestion des erreurs
function errorHandler(err, req, res) {
  // Log de l'erreur
  logger.error({
    message: 'Erreur non gérée',
    error: err.message,
  });

  // Déterminer le code de statut approprié
  const statusCode = err.statusCode || 500;
  
  // Répondre avec un message d'erreur
  res.status(statusCode).json({
    message: statusCode === 500 ? 'Erreur serveur' : err.message,
    error: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
}

// Classe d'erreur personnalisée pour les erreurs métier
class BusinessError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = 'BusinessError';
    this.statusCode = statusCode;
  }
}

// Classe d'erreur personnalisée pour les erreurs d'authentification
class AuthError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AuthError';
    this.statusCode = 401;
  }
}

// Classe d'erreur personnalisée pour les erreurs d'autorisation
class ForbiddenError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ForbiddenError';
    this.statusCode = 403;
  }
}

// Classe d'erreur personnalisée pour les ressources non trouvées
class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = 404;
  }
}

module.exports = {
  errorHandler,
  BusinessError,
  AuthError,
  ForbiddenError,
  NotFoundError,
};