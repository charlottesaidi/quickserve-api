const express = require('express');
const http = require('http');
const cors = require('cors');
const locationRoutes = require('./routes/locationRoutes');
const locationModel = require('./models/locationModel');
const historyModel = require('./models/historyModel');
const eventService = require('./services/eventService');
const socketService = require('./services/socketService');
const { initializeSocket } = require('./config/socket');
const logger = require('./utils/logger');
const { PORT } = require('./config/env');

const app = express();
const server = http.createServer(app);

// Initialisation de Socket.IO
const io = initializeSocket(server);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/', locationRoutes);

// Initialisation
async function initializeApp() {
  try {
    // Initialiser les tables
    await locationModel.initializeTable();
    await historyModel.initializeTable();
    
    // Initialiser la connexion aux événements
    await eventService.initialize();
    
    // Configuration des écouteurs de socket
    io.on('connection', (socket) => {
      socketService.registerClient(socket);
      
      // Mise à jour de la position (pour les prestataires)
      socket.on('update_location', async (data) => {
        try {
          if (socket.userRole !== 'provider') {
            socket.emit('error', { message: 'Non autorisé' });
            return;
          }
          
          const { latitude, longitude, accuracy, service_id } = data;
          
          // Validation de base
          if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
            socket.emit('error', { message: 'Coordonnées invalides' });
            return;
          }
          
          // Mise à jour via le service
          const locationData = {
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            accuracy: accuracy ? parseFloat(accuracy) : null,
            service_id: service_id ? parseInt(service_id, 10) : null
          };
          
          await locationService.updateProviderLocation(socket.userId, locationData);
          socket.emit('location_updated', { success: true });
        } catch (error) {
          logger.error('Erreur lors de la mise à jour de la position via socket:', error);
          socket.emit('error', { message: 'Erreur serveur' });
        }
      });
    });
    
    // Démarrer le serveur
    server.listen(PORT, () => {
      logger.info(`Service de géolocalisation démarré sur le port ${PORT}`);
    });
  } catch (error) {
    logger.error('Erreur lors de l\'initialisation de l\'application:', error);
    process.exit(1);
  }
}

initializeApp();

// Gestion des erreurs non capturées
process.on('uncaughtException', (error) => {
  logger.error('Erreur non capturée:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Promesse rejetée non gérée:', reason);
});

module.exports = { app, server }; // Pour les tests