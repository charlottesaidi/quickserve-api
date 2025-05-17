const eventBus = require('../config/rabbitmq');
const logger = require('../utils/logger');
const locationService = require('./locationService');

class EventService {
  async initialize() {
    await eventBus.connect();
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Écouter les événements de service
    eventBus.subscribe('service-events', async (event) => {
      logger.info(`Événement reçu: ${event.type}`);
      
      switch (event.type) {
        case 'SERVICE_ASSIGNED':
        case 'SERVICE_STARTED':
          logger.info(`Suivi de géolocalisation activé pour le service #${event.data.service_id}`);
          break;
          
        case 'SERVICE_COMPLETED':
        case 'SERVICE_CANCELLED':
          logger.info(`Suivi de géolocalisation désactivé pour le service #${event.data.service_id}`);
          break;
      }
    });
  }

  publishLocationUpdate(providerId, serviceId, latitude, longitude) {
    eventBus.publish('geolocation-events', {
      type: 'PROVIDER_LOCATION_UPDATED',
      data: {
        provider_id: providerId,
        service_id: serviceId,
        latitude,
        longitude,
        updated_at: new Date()
      }
    });
  }
}

module.exports = new EventService();