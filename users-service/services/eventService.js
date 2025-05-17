const eventBus = require('../config/rabbitmq');

class EventService {
  async initialize() {
    await eventBus.connect();
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Écouter les événements si nécessaire
  }

  publishUserCreated(userData) {
    eventBus.publish('user-events', {
      type: 'USER_CREATED',
      data: {
        id: userData.id,
        email: userData.email,
        role: userData.role
      }
    });
  }

  publishUserLoggedIn(userData) {
    eventBus.publish('user-events', {
      type: 'USER_LOGGED_IN',
      data: { 
        id: userData.id, 
        email: userData.email 
      }
    });
  }

  publishUserUpdated(userData) {
    eventBus.publish('user-events', {
      type: 'USER_UPDATED',
      data: { id: userData.id }
    });
  }
}

module.exports = new EventService();