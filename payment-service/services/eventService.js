const eventBus = require('../config/rabbitmq');
const logger = require('../utils/logger');
const paymentService = require('./paymentService');

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
      case 'SERVICE_CREATED':
        // Enregistrer le paiement en attente
        try {
          await paymentService.registerPendingPayment(
            event.data.service_id,
            event.data.client_id,
            event.data.amount,
          );
          logger.info(`Paiement en attente enregistré pour le service #${event.data.service_id}`);
        } catch (error) {
          logger.error(`Erreur lors de l'enregistrement du paiement en attente: ${error.message}`);
        }
        break;
          
      case 'SERVICE_COMPLETED':
        // Traiter le paiement automatique si configuré
        try {
          await paymentService.processAutomaticPayment(event.data.service_id, event.data.client_id);
        } catch (error) {
          logger.error(`Erreur lors du traitement du paiement automatique: ${error.message}`);
        }
        break;
          
      case 'SERVICE_CANCELLED':
        // Mettre à jour le statut du paiement
        try {
          await paymentService.cancelPayment(event.data.service_id);
          logger.info(`Paiement annulé pour le service #${event.data.service_id}`);
        } catch (error) {
          logger.error(`Erreur lors de l'annulation du paiement: ${error.message}`);
        }
        break;
      }
    });
  }

  publishPaymentCompleted(serviceId, clientId, paymentId, amount, paymentIntentId) {
    eventBus.publish('payment-events', {
      type: 'PAYMENT_COMPLETED',
      data: {
        service_id: serviceId,
        client_id: clientId,
        payment_id: paymentId,
        amount,
        payment_intent_id: paymentIntentId,
      },
    });
  }

  publishPaymentFailed(serviceId, clientId, paymentId, error) {
    eventBus.publish('payment-events', {
      type: 'PAYMENT_FAILED',
      data: {
        service_id: serviceId,
        client_id: clientId,
        payment_id: paymentId,
        error: error || 'Erreur de paiement',
      },
    });
  }
}

module.exports = new EventService();