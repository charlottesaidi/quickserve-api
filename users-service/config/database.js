const { Pool } = require('pg');
const { DB_CONFIG } = require('./env');

const pool = new Pool(DB_CONFIG);

// Test de connexion
pool.query('SELECT NOW()', (err) => {
  if (err) {
    console.error('Erreur de connexion à la base de données:', err);
  } else {
    console.log('Connexion à la base de données établie');
  }
});

module.exports = pool;