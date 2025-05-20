const logger = require('../utils/logger');

// Service de vérification de l'état des microservices
const healthService = {
  // Vérifier l'état de santé de tous les services
  checkServicesHealth: async (services) => {
    const servicesHealth = {};
    const servicePromises = Object.keys(services).map(async (service) => {
      try {
        const { url } = services[service];
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // Timeout après 5 secondes
        
        const response = await fetch(`${url}/health`, { 
          signal: controller.signal 
        });
        
        clearTimeout(timeoutId);
        
        servicesHealth[service] = {
          status: response.ok ? 'ok' : 'error',
          statusCode: response.status
        };
        
        // Si la réponse est OK, essayer de récupérer les détails
        if (response.ok) {
          try {
            const data = await response.json();
            servicesHealth[service].details = data;
          } catch (jsonError) {
            logger.warn(`Erreur lors de l'analyse JSON pour le service ${service}:`, jsonError);
          }
        }
      } catch (error) {
        logger.error(`Erreur lors de la vérification du service ${service}:`, error);
        servicesHealth[service] = {
          status: 'error',
          message: error.name === 'AbortError' ? 'Timeout' : error.message
        };
      }
    });
    
    // Attendre que toutes les vérifications soient terminées
    await Promise.allSettled(servicePromises);
    
    return servicesHealth;
  }
};

module.exports = healthService;