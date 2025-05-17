const locationService = require('../services/locationService');
const historyModel = require('../models/historyModel');
const logger = require('../utils/logger');
const ErrorHandler = require('../utils/errorHandler');

class LocationController {
  async updateLocation(req, res) {
    try {
      const providerId = req.user.id;
      const locationData = req.locationData;
      
      // Vérifier que l'utilisateur est un prestataire
      if (req.user.role !== 'provider') {
        return res.status(403).json({ message: 'Accès non autorisé' });
      }
      
      const updatedLocation = await locationService.updateProviderLocation(providerId, locationData);
      
      res.status(200).json({ success: true, location: updatedLocation });
    } catch (error) {
      logger.error('Erreur lors de la mise à jour de la position:', error);
      return ErrorHandler.handleError(res, error);
    }
  }

  async getProviderLocation(req, res) {
    try {
      const providerId = parseInt(req.params.id, 10);
      
      if (isNaN(providerId)) {
        return res.status(400).json({ message: 'ID de prestataire invalide' });
      }
      
      const location = await locationService.getProviderLocation(providerId);
      
      if (!location) {
        return res.status(404).json({ message: 'Position non trouvée' });
      }
      
      res.status(200).json({ location });
    } catch (error) {
      logger.error('Erreur lors de la récupération de la position:', error);
      return ErrorHandler.handleError(res, error);
    }
  }

  async getNearbyProviders(req, res) {
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

  async getLocationHistory(req, res) {
    try {
      const serviceId = parseInt(req.params.id, 10);
      
      if (isNaN(serviceId)) {
        return res.status(400).json({ message: 'ID de service invalide' });
      }
      
      // Vérifier les autorisations (client, prestataire de ce service, ou admin)
      const serviceInfo = await historyModel.getServiceProviderInfo(serviceId);
      
      if (!serviceInfo) {
        return res.status(404).json({ message: 'Service non trouvé' });
      }
      
      const history = await locationService.getServiceLocationHistory(serviceId, req.user.id, req.user.role);
      
      res.status(200).json({ history });
    } catch (error) {
      logger.error('Erreur lors de la récupération de l\'historique:', error);
      return ErrorHandler.handleError(res, error);
    }
  }
}

module.exports = new LocationController();