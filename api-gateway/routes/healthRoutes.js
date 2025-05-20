const healthService = require('../services/healthService');
const logger = require('../utils/logger');

// Configuration des routes de vérification d'état
function setupHealthRoutes(app, services) {
  // Route pour vérifier l'état de santé de l'API Gateway
  app.get('/health', (req, res) => {
    res.status(200).json({ 
      status: 'ok', 
      version: process.env.npm_package_version || '1.0.0',
      timestamp: new Date()
    });
    logger.debug('Vérification de santé de l\'API Gateway réussie');
  });
  
  // Route pour vérifier l'état de santé des services
  app.get('/api/health', async (req, res, next) => {
    try {
      const healthStatus = await healthService.checkServicesHealth(services);
      res.status(200).json({
        gateway: { 
          status: 'ok',
          uptime: process.uptime()
        },
        services: healthStatus
      });
      logger.debug('Vérification de santé de tous les services réussie');
    } catch (error) {
      logger.error('Erreur lors de la vérification de santé des services:', error);
      next(error);
    }
  });
  
  logger.info('Routes de vérification d\'état configurées');
}

module.exports = setupHealthRoutes;