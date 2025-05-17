const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectToDatabase } = require('./config/database');
const { connectEventBus } = require('./config/rabbitmq');
const serviceRoutes = require('./routes/serviceRoutes');
const errorHandler = require('./utils/errorHandler');
const logger = require('./utils/logger');

// Charger les variables d'environnement
dotenv.config();

// Initialiser l'application Express
const app = express();
app.use(cors());
app.use(express.json());

// Enregistrer les routes
app.use('/', serviceRoutes);

// Middleware de gestion des erreurs
app.use(errorHandler.errorHandler);

// Démarrer le serveur
const PORT = process.env.PORT || 3003;

async function startServer() {
  try {
    // Initialiser la base de données
    await connectToDatabase();
    
    // Se connecter au bus d'événements
    await connectEventBus();
    
    // Démarrer le serveur HTTP
    app.listen(PORT, () => {
      logger.info(`Service de prestations démarré sur le port ${PORT}`);
    });
  } catch (error) {
    logger.error('Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
}

startServer();