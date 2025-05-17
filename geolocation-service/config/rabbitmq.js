const amqp = require('amqplib');
const { RABBITMQ_URL } = require('./env');
const logger = require('../utils/logger');

class EventBus {
  constructor() {
    this.connection = null;
    this.channel = null;
  }

  async connect() {
    try {
      this.connection = await amqp.connect(RABBITMQ_URL);
      this.channel = await this.connection.createChannel();
      
      // Créer les files d'attente
      await this.channel.assertQueue('geolocation-events', { durable: true });
      await this.channel.assertQueue('service-events', { durable: true });
      
      logger.info('Connexion à RabbitMQ établie');
      return this.channel;
    } catch (error) {
      logger.error('Erreur de connexion à RabbitMQ:', error);
      // Réessayer après 5 secondes
      setTimeout(() => this.connect(), 5000);
    }
  }

  publish(queue, message) {
    if (this.channel) {
      this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
    }
  }

  async subscribe(queue, callback) {
    if (this.channel) {
      await this.channel.assertQueue(queue, { durable: true });
      this.channel.consume(queue, (msg) => {
        if (msg) {
          try {
            const content = JSON.parse(msg.content.toString());
            callback(content);
            this.channel.ack(msg);
          } catch (error) {
            logger.error('Erreur lors du traitement du message:', error);
            this.channel.nack(msg);
          }
        }
      });
    }
  }
}

module.exports = new EventBus();