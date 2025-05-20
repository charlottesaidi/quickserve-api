const pool = require('../config/database');
const logger = require('../utils/logger');

class HistoryModel {
  async initializeTable() {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS service_location_history (
          id SERIAL PRIMARY KEY,
          service_id INTEGER NOT NULL,
          provider_id INTEGER NOT NULL,
          latitude DECIMAL(10, 8) NOT NULL,
          longitude DECIMAL(11, 8) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE INDEX IF NOT EXISTS idx_service_provider ON service_location_history (service_id, provider_id);
      `);
      logger.info('Table service_location_history initialisée');
    } catch (error) {
      logger.error('Erreur lors de l\'initialisation de la table service_location_history:', error);
      throw error;
    }
  }

  async addLocationToHistory(serviceId, providerId, latitude, longitude) {
    try {
      const result = await pool.query(
        `INSERT INTO service_location_history (service_id, provider_id, latitude, longitude)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [serviceId, providerId, latitude, longitude],
      );
      
      return result.rows[0];
    } catch (error) {
      logger.error(`Erreur lors de l'ajout à l'historique pour le service ${serviceId}:`, error);
      throw error;
    }
  }

  async getServiceLocationHistory(serviceId) {
    try {
      const result = await pool.query(
        'SELECT latitude, longitude, created_at FROM service_location_history WHERE service_id = $1 ORDER BY created_at',
        [serviceId],
      );
      
      return result.rows;
    } catch (error) {
      logger.error(`Erreur lors de la récupération de l'historique du service ${serviceId}:`, error);
      throw error;
    }
  }

  async getServiceProviderInfo(serviceId) {
    try {
      // Cette requête est un exemple et dépend de la structure de votre base de données
      // Elle pourrait nécessiter une jointure avec une table services ou une requête à un autre service
      const result = await pool.query(
        'SELECT DISTINCT provider_id, service_id FROM service_location_history WHERE service_id = $1 LIMIT 1',
        [serviceId],
      );
      
      return result.rows[0] || null;
    } catch (error) {
      logger.error(`Erreur lors de la récupération des informations du service ${serviceId}:`, error);
      throw error;
    }
  }
}

module.exports = new HistoryModel();