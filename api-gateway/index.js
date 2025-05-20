const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// Charger les variables d'environnement
dotenv.config();

// Importer les configurations et middlewares
const services = require('./config/services');
const securityMiddleware = require('./middleware/security');
const rateLimitMiddleware = require('./middleware/rateLimit');
const authMiddleware = require('./middleware/auth');
const errorHandler = require('./middleware/errorHandler');
const proxyRoutes = require('./routes/proxyRoutes');
const healthRoutes = require('./routes/healthRoutes');
const logger = require('./utils/logger');

// Initialiser l'application Express
const app = express();

// Middleware de base
app.use(cors());
app.use(express.json());

// Appliquer les middlewares de sécurité
securityMiddleware(app);

// Appliquer la limitation de taux aux routes API
app.use('/api', rateLimitMiddleware);

// Middleware d'authentification globale (sauf pour les routes publiques)
app.use('/api', authMiddleware);

// Enregistrer les routes de proxy
proxyRoutes(app, services);

// Enregistrer les routes de vérification d'état
healthRoutes(app, services);

// Ajouter express.static pour servir la documentation
app.use('/api-docs', express.static(path.join(__dirname, 'docs')));

// Route pour accéder à la spécification OpenAPI au format JSON
app.get('/api-docs/swagger.json', (req, res) => {
  res.sendFile(path.join(__dirname, 'docs/swagger.json'));
});

// Middleware pour les erreurs 404
app.use((req, res) => {
  res.status(404).json({ message: 'Route non trouvée' });
});

// Middleware de gestion des erreurs
app.use(errorHandler);

// Démarrer le serveur
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(`API Gateway démarré sur le port ${PORT}`);
  logger.info('Services configurés:');
  Object.keys(services).forEach((service) => {
    logger.info(`- ${service}: ${services[service].url}`);
  });
});