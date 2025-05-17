class ErrorHandler {
  static handleError(res, error, defaultMessage = 'Erreur serveur') {
    console.error(error);
    
    // Erreurs connues
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    
    if (error.name === 'UnauthorizedError') {
      return res.status(401).json({ message: error.message });
    }
    
    if (error.name === 'ForbiddenError') {
      return res.status(403).json({ message: error.message });
    }
    
    if (error.name === 'NotFoundError') {
      return res.status(404).json({ message: error.message });
    }
    
    // Erreur serveur par défaut
    return res.status(500).json({ message: defaultMessage });
  }
}

module.exports = ErrorHandler;