const { getIO } = require('../config/socket');
const logger = require('../utils/logger');

class SocketService {
  constructor() {
    this.activeClients = new Map();
    this.serviceSubscriptions = new Map();
  }

  registerClient(socket) {
    this.activeClients.set(socket.userId, socket);
    
    // Configurer les écouteurs d'événements pour ce socket
    this.setupSocketListeners(socket);
  }

  setupSocketListeners(socket) {
    // Mise à jour de la position (pour les prestataires)
    socket.on('update_location', async (data) => {
      if (socket.userRole !== 'provider') {
        socket.emit('error', { message: 'Non autorisé' });
        return;
      }
      
      try {
        // La logique de mise à jour est dans le contrôleur
        // Nous ne faisons qu'émettre l'événement ici
        socket.emit('location_updated', { success: true });
      } catch (error) {
        logger.error('Erreur dans update_location socket:', error);
        socket.emit('error', { message: 'Erreur serveur' });
      }
    });
    
    // Abonnement à la position d'un prestataire (pour les clients)
    socket.on('subscribe_provider_location', async (data) => {
      const { service_id } = data;
      
      if (!service_id) {
        socket.emit('error', { message: 'ID de service manquant' });
        return;
      }
      
      try {
        // Ajouter le socket à la room du service
        socket.join(`service_${service_id}`);
        
        // Stocker l'abonnement
        if (!this.serviceSubscriptions.has(service_id)) {
          this.serviceSubscriptions.set(service_id, new Set());
        }
        this.serviceSubscriptions.get(service_id).add(socket.userId);
        
        socket.emit('subscription_success', { service_id });
        logger.info(`User ${socket.userId} subscribed to service ${service_id}`);
      } catch (error) {
        logger.error('Erreur dans subscribe_provider_location socket:', error);
        socket.emit('error', { message: 'Erreur serveur' });
      }
    });
  }

  emitLocationUpdate(serviceId, providerId, latitude, longitude) {
    try {
      const io = getIO();
      
      // Émettre à tous les clients abonnés à ce service
      io.to(`service_${serviceId}`).emit('provider_location_update', {
        service_id: serviceId,
        provider_id: providerId,
        latitude,
        longitude,
        updated_at: new Date()
      });
      
      logger.debug(`Émission de mise à jour de position pour le service ${serviceId}`);
    } catch (error) {
      logger.error('Erreur lors de l\'émission de la mise à jour de position:', error);
      throw error;
    }
  }

  emitToUser(userId, event, data) {
    try {
      const io = getIO();
      io.to(`user_${userId}`).emit(event, data);
    } catch (error) {
      logger.error(`Erreur lors de l'émission à l'utilisateur ${userId}:`, error);
    }
  }
}

module.exports = new SocketService();