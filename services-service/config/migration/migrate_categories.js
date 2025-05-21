const { pool } = require('./../database');
const logger = require('../../utils/logger');

async function migrateSchema() {
  try {
    logger.info('Démarrage de la migration du schéma de la base de données...');

    // Vérifie si la colonne "slug" existe dans "service_categories"
    const columnCheckResult = await pool.query(`
      SELECT 1
      FROM information_schema.columns 
      WHERE table_name = 'service_categories' 
        AND column_name = 'slug'
      LIMIT 1;
    `);

    const slugExists = columnCheckResult.rowCount > 0;

    // Supprime les entrées uniquement si "slug" n'existe pas encore
    if (!slugExists) {
      await pool.query('DELETE FROM service_categories');
      logger.info('Table service_categories vidée car la colonne "slug" n\'existe pas encore.');
    } else {
      logger.info('La colonne "slug" existe déjà — suppression ignorée.');
    }

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
