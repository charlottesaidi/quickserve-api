const amqp = require('amqplib');
const config = require('./env');
const logger = require('../utils/logger');
const { handlePaymentEvent, handleGeolocationEvent } = require('../services/eventService');

// Variable pour stocker le canal RabbitMQ
let channel;

// Fonction pour se connecter au bus d'événements RabbitMQ
async function connectEventBus() {
  try {
    const connection = await amqp.connect(config.RABBITMQ_URL);
    channel = await connection.createChannel();
    
    // Créer les files d'attente
    await channel.assertQueue('service-events', { durable: true });
    await channel.assertQueue('payment-events', { durable: true });
    await channel.assertQueue('geolocation-events', { durable: true });
    
    // Consommer les événements de paiement
    await channel.consume('payment-events', async (msg) => {
      if (msg) {
        try {
          const event = JSON.parse(msg.content.toString());
          await handlePaymentEvent(event, channel);
          channel.ack(msg);
        } catch (error) {
          logger.error('Erreur lors du traitement de l\'événement de paiement:', error);
          channel.nack(msg);
        }
      }
    });
    
    // Consommer les événements de géolocalisation
    await channel.consume('geolocation-events', async (msg) => {
      if (msg) {
        try {
          const event = JSON.parse(msg.content.toString());
          await handleGeolocationEvent(event);
          channel.ack(msg);
        } catch (error) {
          logger.error('Erreur lors du traitement de l\'événement de géolocalisation:', error);
          channel.nack(msg);
        }
      }
    });
    
    logger.info('Connecté au bus d\'événements');
    return channel;
  } catch (error) {
    logger.error('Erreur de connexion au bus d\'événements:', error);
    setTimeout(connectEventBus, 5000); // Réessayer après 5 secondes
  }
}

// Fonction pour publier un événement
function publishEvent(queue, event) {
  if (channel) {
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(event)));
    return true;
  }
  return false;
}

module.exports = {
  connectEventBus,
  publishEvent
};