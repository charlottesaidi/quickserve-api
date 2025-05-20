const { pool } = require('../config/database');
const { publishEvent } = require('../config/rabbitmq');
const logger = require('../utils/logger');

// Gestion des événements de paiement
async function handlePaymentEvent(event) {
  try {
    let completedResult = null;
    let failedResult = null;

    switch (event.type) {
    case 'PAYMENT_COMPLETED':
      // Mettre à jour le statut du paiement de la prestation
      completedResult = await pool.query(
        'UPDATE services SET payment_status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
        ['completed', event.data.service_id],
      );
        
      if (completedResult.rows.length > 0) {
        logger.info(`Paiement complété pour le service #${event.data.service_id}`);
          
        // Publier l'événement de mise à jour du service
        publishEvent('service-events', {
          type: 'SERVICE_PAYMENT_COMPLETED',
          data: { service_id: event.data.service_id },
        });
      }
      break;
        
    case 'PAYMENT_FAILED':
      // Mettre à jour le statut du paiement de la prestation
      failedResult = await pool.query(
        'UPDATE services SET payment_status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
        ['failed', event.data.service_id],
      );
        
      if (failedResult.rows.length > 0) {
        logger.info(`Paiement échoué pour le service #${event.data.service_id}`);
          
        // Publier l'événement de mise à jour du service
        publishEvent('service-events', {
          type: 'SERVICE_PAYMENT_FAILED',
          data: { service_id: event.data.service_id },
        });
      }
      break;
        
    default:
      logger.warn(`Type d'événement de paiement non géré: ${event.type}`);
    }
  } catch (error) {
    logger.error('Erreur lors du traitement de l\'événement de paiement:', error);
    throw error;
  }
}

// Gestion des événements de géolocalisation
async function handleGeolocationEvent(event) {
  try {
    switch (event.type) {
    case 'PROVIDER_LOCATION_UPDATED':
      // On pourrait mettre à jour l'ETA (Estimated Time of Arrival) ici
      // Pour une prestation en cours si nécessaire
      logger.info(`Position mise à jour pour le prestataire #${event.data.provider_id}`);
      break;
        
    default:
      logger.warn(`Type d'événement de géolocalisation non géré: ${event.type}`);
    }
  } catch (error) {
    logger.error('Erreur lors du traitement de l\'événement de géolocalisation:', error);
    throw error;
  }
}

module.exports = {
  handlePaymentEvent,
  handleGeolocationEvent,
};