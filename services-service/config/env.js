const dotenv = require('dotenv');

// Charger les variables d'environnement
dotenv.config();

// Configuration des variables d'environnement avec valeurs par défaut
module.exports = {
  PORT: process.env.PORT || 3003,
  DB_USER: process.env.DB_USER || 'postgres',
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_NAME: process.env.DB_NAME || 'quickserve',
  DB_PASSWORD: process.env.DB_PASSWORD || 'postgres',
  DB_PORT: process.env.DB_PORT || 5432,
  RABBITMQ_URL: process.env.RABBITMQ_URL || 'amqp://localhost',
  JWT_SECRET: process.env.JWT_SECRET || 'your_jwt_secret',
};