const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware de base
app.use(cors());
app.use(helmet());
app.use(express.json());

// Configuration de rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limite chaque IP à 100 requêtes par fenêtre
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Trop de requêtes, veuillez réessayer plus tard' }
});

// Appliquer le rate limiting à toutes les routes de l'API
app.use('/api', apiLimiter);

// Middleware de vérification d'authentification
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    
    jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret', (err, user) => {
      if (err) {
        return res.status(403).json({ message: 'Token invalide' });
      }
      
      req.user = user;
      next();
    });
  } else {
    // Certaines routes n'ont pas besoin d'authentification
    const publicPaths = [
      '/users/login',
      '/users/register',
      '/categories'
    ];
    
    // Vérifier si c'est une route publique
    const isPublicPath = publicPaths.some(path => req.path.startsWith(path));
    
    if (isPublicPath) {
      next();
    } else {
      res.status(401).json({ message: "Authentification requise" });
    }
  }
};

app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com"
  );
  next();
});

// Middleware d'authentification globale (sauf pour les routes publiques)
app.use('/api', authenticateJWT);

// Configuration des services
const services = {
  users: {
    url: process.env.USERS_SERVICE_URL || 'http://localhost:3001',
    path: '/api/users'
  },
  geolocation: {
    url: process.env.GEOLOCATION_SERVICE_URL || 'http://localhost:3002',
    path: '/api/geolocation'
  },
  services: {
    url: process.env.SERVICES_SERVICE_URL || 'http://localhost:3003',
    path: '/api/services'
  },
  payments: {
    url: process.env.PAYMENT_SERVICE_URL || 'http://localhost:3004',
    path: '/api/payments'
  }
};

// Configuration des routes pour les services
Object.keys(services).forEach((service) => {
  const { url, path } = services[service];
  
  // Création du proxy pour chaque service
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
      console.error(`Erreur de proxy vers ${service}:`, err);
      res.status(500).json({ message: `Service ${service} indisponible` });
    }
  };
  
  // Création du proxy pour ce service
  app.use(path, createProxyMiddleware(proxyOptions));
  console.log(`Proxy configuré pour ${service} sur ${path}`);
});

// Service utilisateurs - routes spécifiques
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

// Service prestations - routes spécifiques
app.use('/api/categories', createProxyMiddleware({ 
  target: services.services.url,
  changeOrigin: true,
  pathRewrite: { '^/api/categories': '/categories' }
}));

// Route pour vérifier l'état de santé de l'API Gateway
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Route pour vérifier l'état de santé des services
app.get('/api/health', async (req, res) => {
  const servicesHealth = {};
  const servicePromises = Object.keys(services).map(async (service) => {
    try {
      const { url } = services[service];
      const response = await fetch(`${url}/health`, { timeout: 5000 });
      servicesHealth[service] = {
        status: response.ok ? 'ok' : 'error',
        statusCode: response.status
      };
    } catch (error) {
      servicesHealth[service] = {
        status: 'error',
        message: error.message
      };
    }
  });
  
  try {
    await Promise.all(servicePromises);
    res.status(200).json({
      gateway: { status: 'ok' },
      services: servicesHealth
    });
  } catch (error) {
    res.status(500).json({
      gateway: { status: 'ok' },
      services: servicesHealth,
      error: error.message
    });
  }
});

// Ajouter express.static pour servir la documentation
const path = require('path');
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
app.use((err, req, res, next) => {
  console.error('Erreur:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Erreur serveur'
  });
});

// Démarrer le serveur
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`API Gateway démarré sur le port ${PORT}`);
  console.log('Services configurés:');
  Object.keys(services).forEach((service) => {
    console.log(`- ${service}: ${services[service].url}`);
  });
});