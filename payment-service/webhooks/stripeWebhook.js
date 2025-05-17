const { STRIPE } = require('../config/env');
const stripeService = require('../services/stripeService');
const paymentModel = require('../models/paymentModel');
const eventService = require('../services/eventService');
const logger = require('../utils/logger');

async function handleWebhook(req, res) {
  const sig = req.headers['stripe-signature'];
  
  try {
    // Construire l'événement Stripe
    const event = await stripeService.constructWebhookEvent(
      req.body,
      sig,
      STRIPE.WEBHOOK_SECRET
    );
    
    logger.info(`Webhook Stripe reçu: ${event.type}`);
    
    // Traiter les différents types d'événements
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object);
        break;
        
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object);
        break;
        
      // Vous pouvez ajouter d'autres types d'événements au besoin
    }
    
    res.status(200).json({ received: true });
  } catch (error) {
    logger.error('Erreur lors du traitement du webhook Stripe:', error);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
}

async function handlePaymentIntentSucceeded(paymentIntent) {
  try {
    // Trouver le paiement associé
    const payment = await paymentModel.findByPaymentIntentId(paymentIntent.id);
    
    if (!payment) {
      logger.warn(`Aucun paiement trouvé pour l'intention de paiement ${paymentIntent.id}`);
      return;
    }
    
    // Mettre à jour le statut du paiement
    await paymentModel.updatePaymentStatus(payment.id, 'completed');
    
    // Publier l'événement de paiement réussi
    eventService.publishPaymentCompleted(
      payment.service_id,
      payment.client_id,
      payment.id,
      payment.amount,
      paymentIntent.id
    );
    
    logger.info(`Paiement #${payment.id} validé via webhook Stripe`);
  } catch (error) {
    logger.error('Erreur lors du traitement du paiement réussi:', error);
    throw error;
  }
}

async function handlePaymentIntentFailed(paymentIntent) {
  try {
    // Trouver le paiement associé
    const payment = await paymentModel.findByPaymentIntentId(paymentIntent.id);
    
    if (!payment) {
      logger.warn(`Aucun paiement trouvé pour l'intention de paiement ${paymentIntent.id}`);
      return;
    }
    
    // Obtenir le message d'erreur
    const errorMessage = paymentIntent.last_payment_error 
      ? paymentIntent.last_payment_error.message 
      : 'Paiement échoué';
    
    // Mettre à jour le statut du paiement
    await paymentModel.updatePaymentStatus(payment.id, 'failed', errorMessage);
    
    // Publier l'événement de paiement échoué
    eventService.publishPaymentFailed(
      payment.service_id,
      payment.client_id,
      payment.id,
      errorMessage
    );
    
    logger.info(`Paiement #${payment.id} échoué via webhook Stripe: ${errorMessage}`);
  } catch (error) {
    logger.error('Erreur lors du traitement du paiement échoué:', error);
    throw error;
  }
}

module.exports = {
  handleWebhook
};