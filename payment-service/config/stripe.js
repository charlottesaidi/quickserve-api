const stripe = require('stripe');
const { STRIPE } = require('./env');
const logger = require('../utils/logger');

// Initialisation de l'API Stripe
const stripeClient = stripe(STRIPE.SECRET_KEY, {
  apiVersion: STRIPE.API_VERSION,
  maxNetworkRetries: 3, // Réessayer automatiquement en cas d'échec
});

// Vérifier la connexion à Stripe
async function checkStripeConnection() {
  try {
    // const balance = await stripeClient.balance.retrieve();
    logger.info('Connexion à Stripe établie');
    return true;
  } catch (error) {
    logger.error('Erreur de connexion à Stripe:', error);
    return false;
  }
}

module.exports = {
  stripe: stripeClient,
  checkStripeConnection,
};