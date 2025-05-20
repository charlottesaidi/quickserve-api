const helmet = require('helmet');
const logger = require('../utils/logger');

// Middleware de sécurité
function setupSecurityMiddleware(app) {
  // Utiliser Helmet pour sécuriser les en-têtes HTTP
  app.use(helmet());
  
  // Configuration de Content-Security-Policy personnalisée
  app.use((req, res, next) => {
    res.setHeader(
      'Content-Security-Policy',
      'default-src \'self\'; script-src \'self\' \'unsafe-inline\' https://cdnjs.cloudflare.com; style-src \'self\' \'unsafe-inline\' https://cdnjs.cloudflare.com',
    );
    next();
  });
  
  logger.info('Middlewares de sécurité configurés');
}

module.exports = setupSecurityMiddleware;