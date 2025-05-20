const locationModel = require('../models/locationModel');
const historyModel = require('../models/historyModel');
const socketService = require('./socketService');
const eventService = require('./eventService');
const logger = require('../utils/logger');

class LocationService {
  async updateProviderLocation(providerId, data) {
    try {
      const { latitude, longitude, accuracy, service_id } = data;
      
      // Validation des coordonnées
      if (!this.validateCoordinates(latitude, longitude)) {
        throw new Error('Coordonnées invalides');
      }
      
      // Mettre à jour la position du prestataire
      const location = await locationModel.updateProviderLocation(
        providerId,
        latitude,
        longitude,
        accuracy,
      );
      
      // Si c'est dans le cadre d'un service, ajouter à l'historique
      if (service_id) {
        await historyModel.addLocationToHistory(service_id, providerId, latitude, longitude);
        
        // Obtenir le client associé au service (cette logique dépend de votre implémentation)
        // Dans un vrai système, vous pourriez avoir besoin de faire une requête à un autre service
        try {
          // Informer le client via Socket.IO
          socketService.emitLocationUpdate(service_id, providerId, latitude, longitude);
          
          // Publier l'événement sur le bus d'événements
          eventService.publishLocationUpdate(providerId, service_id, latitude, longitude);
        } catch (socketError) {
          logger.error('Erreur lors de l\'émission Socket.IO:', socketError);
          // Ne pas faire échouer la mise à jour de position à cause d'une erreur de socket
        }
      }
      
      return location;
    } catch (error) {
      logger.error('Erreur lors de la mise à jour de la position:', error);
      throw error;
    }
  }

  async getProviderLocation(providerId) {
    return locationModel.getProviderLocation(providerId);
  }

  async findNearbyProviders(latitude, longitude, radius = 5) {
    // Validation des coordonnées
    if (!this.validateCoordinates(latitude, longitude)) {
      throw new Error('Coordonnées invalides');
    }
    
    return locationModel.findNearbyProviders(latitude, longitude, radius);
  }

  async getServiceLocationHistory(serviceId) {
    return historyModel.getServiceLocationHistory(serviceId);
  }

  validateCoordinates(latitude, longitude) {
    return !isNaN(latitude) && !isNaN(longitude) && 
           latitude >= -90 && latitude <= 90 && 
           longitude >= -180 && longitude <= 180;
  }
}

module.exports = new LocationService();