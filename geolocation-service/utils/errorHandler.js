const logger = require('./logger');

class ErrorHandler {
  static handleError(res, error, defaultMessage = 'Erreur serveur') {
    logger.error('Erreur traitée par ErrorHandler:', error);
    
    // Erreurs connues
    if (error.message === 'Coordonnées invalides') {
      return res.status(400).json({ message: error.message });
    }
    
    if (error.message === 'Non autorisé') {
      return res.status(403).json({ message: error.message });
    }
    
    if (error.message === 'Position non trouvée') {
      return res.status(404).json({ message: error.message });
    }
    
    // Erreur serveur par défaut
    return res.status(500).json({ message: defaultMessage });
  }
}

module.exports = ErrorHandler;