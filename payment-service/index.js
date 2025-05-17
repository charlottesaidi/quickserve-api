const express = require('express');
const cors = require('cors');
const paymentRoutes = require('./routes/paymentRoutes');
const paymentModel = require('./models/paymentModel');
const paymentMethodModel = require('./models/paymentMethodModel');
const eventService = require('./services/eventService');
const { checkStripeConnection } = require('./config/stripe');
const logger = require('./utils/logger');
const { PORT } = require('./config/env');

const app = express();

// Middleware spécial pour les webhooks Stripe (doit être avant express.json())
app.use('/stripe-webhook', express.raw({ type: 'application/json' }));

// Middleware standard
app.use(cors());
app.use(express.json());

// Routes
app.use('/', paymentRoutes);

// Initialisation
async function initializeApp() {
  try {
    // Initialiser les tables
    await paymentModel.initializeTable();
    await paymentMethodModel.initializeTable();
    
    // Initialiser la connexion aux événements
    await eventService.initialize();
    
    // Vérifier la connexion à Stripe
    await checkStripeConnection();
    
    // Démarrer le serveur
    app.listen(PORT, () => {
      logger.info(`Service de paiement démarré sur le port ${PORT}`);
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

module.exports = app; // Pour les tests