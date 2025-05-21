const { pool } = require('./../database');
const logger = require('../../utils/logger');

async function migrateSchema() {
  try {
    logger.info('Démarrage de la migration du schéma de la base de données...');

    // Ajout des colonnes à service_categories si elles n'existent pas
    await pool.query(`
      ALTER TABLE service_categories 
        ADD COLUMN IF NOT EXISTS slug VARCHAR(100) NOT NULL DEFAULT '',
        ADD COLUMN IF NOT EXISTS full_description TEXT,
        ADD COLUMN IF NOT EXISTS features JSONB,
        ADD COLUMN IF NOT EXISTS faq JSONB;
    `);

    logger.info('Migration du schéma terminée avec succès.');
  } catch (error) {
    logger.error('Erreur lors de la migration du schéma:', error);
    throw error;
  }
}

module.exports = migrateSchema;
