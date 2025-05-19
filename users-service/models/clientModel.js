const pool = require('../config/database');
const logger = require('../utils/logger');

class ClientModel {
  // Récupérer tous les prestataires
  async getAllClients() {
    try {
      const result = await pool.query(
        "SELECT * FROM users WHERE role LIKE '%client%' ORDER BY lastname"
      );
      return result.rows;
    } catch (error) {
      logger.error('Erreur lors de la récupération des prestataires:', error);
      throw error;
    }
  }

  // Récupérer un prestataire par son ID
  async getClientById(clientId) {
    try {
      const result = await pool.query(
        "SELECT * FROM users WHERE id = $1 AND role LIKE '%client%'",
        [clientId]
      );
      return result.rows[0];
    } catch (error) {
      logger.error(`Erreur lors de la récupération du prestataires #${clientId}:`, error);
      throw error;
    }
  }
}

module.exports = new ClientModel();