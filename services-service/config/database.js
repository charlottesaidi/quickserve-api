const { Pool } = require('pg');
const config = require('./env');
const logger = require('../utils/logger');

// Création du pool de connexion PostgreSQL
const pool = new Pool({
  user: config.DB_USER,
  host: config.DB_HOST,
  database: config.DB_NAME,
  password: config.DB_PASSWORD,
  port: config.DB_PORT,
});

// Fonction pour initialiser les tables de la base de données
async function initializeDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS service_categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        full_description TEXT,
        features JSONB,
        full_description JSONB,
        base_price DECIMAL(10, 2) NOT NULL,
        image_url TEXT,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS services (
        id SERIAL PRIMARY KEY,
        client_id INTEGER NOT NULL,
        provider_id INTEGER,
        category_id INTEGER NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        address TEXT NOT NULL,
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        payment_status VARCHAR(20) NOT NULL DEFAULT 'pending',
        payment_amount DECIMAL(10, 2),
        scheduled_at TIMESTAMP,
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES service_categories(id)
      );
      
      CREATE TABLE IF NOT EXISTS service_ratings (
        id SERIAL PRIMARY KEY,
        service_id INTEGER NOT NULL,
        rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (service_id) REFERENCES services(id)
      );
      
      CREATE INDEX IF NOT EXISTS idx_services_client ON services (client_id);
      CREATE INDEX IF NOT EXISTS idx_services_provider ON services (provider_id);
      CREATE INDEX IF NOT EXISTS idx_services_status ON services (status);
    `);
    logger.info('Base de données initialisée avec succès');
  } catch (error) {
    logger.error('Erreur d\'initialisation de la base de données:', error);
    throw error;
  }
}

// Fonction pour se connecter à la base de données
async function connectToDatabase() {
  try {
    await pool.query('SELECT NOW()');
    logger.info('Connexion à la base de données établie');
    await initializeDatabase();
    return pool;
  } catch (error) {
    logger.error('Erreur de connexion à la base de données:', error);
    throw error;
  }
}

module.exports = {
  pool,
  connectToDatabase
};