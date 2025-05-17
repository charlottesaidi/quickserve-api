const logger = require('./logger');

class ErrorHandler {
  static handleError(res, error, defaultMessage = 'Erreur serveur') {
    logger.error('Erreur traitée par ErrorHandler:', error);
    
    // Erreurs connues
    if (error.message === 'Paiement non trouvé') {
      return res.status(404).json({ message: error.message });
    }
    
    if (error.message === 'Méthode de paiement non trouvée') {
      return res.status(404).json({ message: error.message });
    }
    
    if (error.message === 'Ce service est déjà payé') {
      return res.status(400).json({ message: error.message });
    }
    
    if (error.message === 'Le paiement n\'a pas été validé') {
      return res.status(400).json({ message: error.message });
    }
    
    if (error.message === 'Accès non autorisé') {
      return res.status(403).json({ message: error.message });
    }
    
    // Erreurs Stripe
    if (error.type === 'StripeCardError') {
      return res.status(400).json({ message: error.message });
    }
    
    // Erreur serveur par défaut
    return res.status(500).json({ message: defaultMessage });
  }
}

module.exports = ErrorHandler;