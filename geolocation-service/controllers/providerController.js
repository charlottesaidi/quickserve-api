const locationService = require('../services/locationService');
const logger = require('../utils/logger');
const ErrorHandler = require('../utils/errorHandler');

class ProviderController {
  async findNearbyProviders(req, res) {
    try {
      const { latitude, longitude } = req.coordinates;
      const radius = req.query.radius ? parseFloat(req.query.radius) : 5;
      
      const providers = await locationService.findNearbyProviders(latitude, longitude, radius);
      
      res.status(200).json({ providers });
    } catch (error) {
      logger.error('Erreur lors de la recherche de prestataires à proximité:', error);
      return ErrorHandler.handleError(res, error);
    }
  }

  // ... autres méthodes spécifiques aux prestataires
}

module.exports = new ProviderController();