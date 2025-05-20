const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const userModel = require('./models/userModel');
const eventService = require('./services/eventService');
const logger = require('./utils/logger');
const { PORT } = require('./config/env');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/', userRoutes);

// Initialisation
async function initializeApp() {
  try {
    // Initialiser la base de données
    await userModel.initializeTable();
    
    // Initialiser la connexion aux événements
    await eventService.initialize();
    
    // Démarrer le serveur
    app.listen(PORT, () => {
      logger.info(`Service utilisateurs démarré sur le port ${PORT}`);
    });
  } catch (error) {
    logger.error('Erreur lors de l\'initialisation de l\'application:', error);
    throw error;
  }
}

initializeApp();

// Gestion des erreurs non capturées
process.on('uncaughtException', (error) => {
  logger.error('Erreur non capturée:', error);
});

process.on('unhandledRejection', (reason) => {
  logger.error('Promesse rejetée non gérée:', reason);
});

module.exports = app; // Pour les tests