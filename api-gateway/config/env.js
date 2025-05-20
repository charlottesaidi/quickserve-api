const dotenv = require('dotenv');

// Charger les variables d'environnement
dotenv.config();

// Configuration des variables d'environnement avec valeurs par défaut
module.exports = {
  PORT: process.env.PORT || 3000,
  JWT_SECRET: process.env.JWT_SECRET || 'your_jwt_secret',
  NODE_ENV: process.env.NODE_ENV || 'development',
  USERS_SERVICE_URL: process.env.USERS_SERVICE_URL || 'http://localhost:3001',
  GEOLOCATION_SERVICE_URL: process.env.GEOLOCATION_SERVICE_URL || 'http://localhost:3002',
  SERVICES_SERVICE_URL: process.env.SERVICES_SERVICE_URL || 'http://localhost:3003',
  PAYMENT_SERVICE_URL: process.env.PAYMENT_SERVICE_URL || 'http://localhost:3004',
};