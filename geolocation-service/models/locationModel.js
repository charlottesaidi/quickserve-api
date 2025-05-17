const pool = require('../config/database');
const logger = require('../utils/logger');

class LocationModel {
  async initializeTable() {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS provider_locations (
          id SERIAL PRIMARY KEY,
          provider_id INTEGER NOT NULL UNIQUE,
          latitude DECIMAL(10, 8) NOT NULL,
          longitude DECIMAL(11, 8) NOT NULL,
          accuracy DECIMAL(6, 2),
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE INDEX IF NOT EXISTS idx_provider_id ON provider_locations (provider_id);
      `);
      logger.info('Table provider_locations initialisée');
    } catch (error) {
      logger.error('Erreur lors de l\'initialisation de la table provider_locations:', error);
      throw error;
    }
  }

  async updateProviderLocation(providerId, latitude, longitude, accuracy) {
    try {
      const result = await pool.query(
        `INSERT INTO provider_locations (provider_id, latitude, longitude, accuracy, updated_at)
         VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
         ON CONFLICT (provider_id) 
         DO UPDATE SET latitude = $2, longitude = $3, accuracy = $4, updated_at = CURRENT_TIMESTAMP
         RETURNING *`,
        [providerId, latitude, longitude, accuracy]
      );
      
      return result.rows[0];
    } catch (error) {
      logger.error(`Erreur lors de la mise à jour de la position du prestataire ${providerId}:`, error);
      throw error;
    }
  }

  async getProviderLocation(providerId) {
    try {
      const result = await pool.query(
        'SELECT latitude, longitude, accuracy, updated_at FROM provider_locations WHERE provider_id = $1',
        [providerId]
      );
      
      return result.rows[0] || null;
    } catch (error) {
      logger.error(`Erreur lors de la récupération de la position du prestataire ${providerId}:`, error);
      throw error;
    }
  }

  async findNearbyProviders(latitude, longitude, radiusKm) {
    try {
      // Utiliser la formule haversine pour trouver les prestataires à proximité
      const result = await pool.query(`
        SELECT provider_id, latitude, longitude, updated_at,
          (6371 * acos(cos(radians($1)) * cos(radians(latitude)) * cos(radians(longitude) - radians($2)) + sin(radians($1)) * sin(radians(latitude)))) AS distance
        FROM provider_locations
        WHERE (6371 * acos(cos(radians($1)) * cos(radians(latitude)) * cos(radians(longitude) - radians($2)) + sin(radians($1)) * sin(radians(latitude)))) < $3
        ORDER BY distance
      `, [latitude, longitude, radiusKm]);
      
      return result.rows;
    } catch (error) {
      logger.error('Erreur lors de la recherche de prestataires à proximité:', error);
      throw error;
    }
  }
}

module.exports = new LocationModel();