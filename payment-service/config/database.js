const { Pool } = require('pg');
const { DB_CONFIG } = require('./env');
const logger = require('../utils/logger');

const pool = new Pool(DB_CONFIG);

// Test de connexion
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    logger.error('Erreur de connexion à la base de données:', err);
  } else {
    logger.info('Connexion à la base de données établie');
  }
});

module.exports = pool;