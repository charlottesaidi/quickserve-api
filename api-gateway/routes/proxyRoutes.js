const { createProxyMiddleware } = require('http-proxy-middleware');
const logger = require('../utils/logger');

// Configuration des routes de proxy
function setupProxyRoutes(app, services) {
  // Configuration des routes génériques pour les services
  Object.keys(services).forEach((service) => {
    const { url, path } = services[service];
    
    // Configuration du proxy pour ce service
    const proxyOptions = {
      target: url,
      changeOrigin: true,
      pathRewrite: {
        [`^${path}`]: ''
      },
      onProxyReq: (proxyReq, req, res) => {
        // Transmettre les infos d'utilisateur si existantes
        if (req.user) {
          proxyReq.setHeader('X-User-Id', req.user.id);
          proxyReq.setHeader('X-User-Role', req.user.role);
        }
        
        // Si la requête a un body, le réécrire pour le proxy
        if (req.body && req.method !== 'GET') {
          const bodyData = JSON.stringify(req.body);
          proxyReq.setHeader('Content-Type', 'application/json');
          proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
          proxyReq.write(bodyData);
        }
      },
      onError: (err, req, res) => {
        logger.error(`Erreur de proxy vers ${service}:`, err);
        res.status(500).json({ message: `Service ${service} indisponible` });
      },
      logProvider: () => logger
    };
    
    // Créer le proxy pour ce service
    app.use(path, createProxyMiddleware(proxyOptions));
    logger.info(`Proxy configuré pour ${service} sur ${path}`);
  });
  
  // Configuration des routes spécifiques pour le service utilisateurs
  app.use('/api/users/login', createProxyMiddleware({ 
    target: services.users.url,
    changeOrigin: true,
    pathRewrite: { '^/api/users/login': '/login' }
  }));
  
  app.use('/api/users/register', createProxyMiddleware({ 
    target: services.users.url,
    changeOrigin: true,
    pathRewrite: { '^/api/users/register': '/register' }
  }));
  
  app.use('/api/providers', createProxyMiddleware({ 
    target: services.users.url,
    changeOrigin: true,
    pathRewrite: { '^/api/providers': '/providers' }
  }));
  
  app.use('/api/clients', createProxyMiddleware({ 
    target: services.users.url,
    changeOrigin: true,
    pathRewrite: { '^/api/clients': '/clients' }
  }));
  
  // Configuration des routes spécifiques pour le service prestations
  app.use('/api/categories', createProxyMiddleware({ 
    target: services.services.url,
    changeOrigin: true,
    pathRewrite: { '^/api/categories': '/categories' }
  }));
  
  logger.info('Routes de proxy configurées');
}

module.exports = setupProxyRoutes;