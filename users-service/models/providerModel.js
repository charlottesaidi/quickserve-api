const pool = require('../config/database');
const logger = require('../utils/logger');

class ProviderModel {
  // Récupérer tous les prestataires
  async getAllProviders() {
    try {
      const result = await pool.query(
        'SELECT * FROM users WHERE role LIKE \'%provider%\' ORDER BY lastname',
      );
      return result.rows;
    } catch (error) {
      logger.error('Erreur lors de la récupération des prestataires:', error);
      throw error;
    }
  }

  // Récupérer un prestataire par son ID
  async getProviderById(providerId) {
    try {
      const result = await pool.query(
        'SELECT * FROM users WHERE id = $1 AND role LIKE \'%provider%\'',
        [providerId],
      );
      return result.rows[0];
    } catch (error) {
      logger.error(`Erreur lors de la récupération du prestataires #${providerId}:`, error);
      throw error;
    }
  }
}

module.exports = new ProviderModel();