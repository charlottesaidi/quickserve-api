const { pool } = require('../config/database');
const { publishEvent } = require('../config/rabbitmq');
const logger = require('../utils/logger');

class ServiceRatingModel {
  // Récupérer les évaluations d'une prestation
  async getRatingsByServiceId(serviceId) {
    try {
      const result = await pool.query(
        'SELECT * FROM service_ratings WHERE service_id = $1',
        [serviceId]
      );
      return result.rows;
    } catch (error) {
      logger.error(`Erreur lors de la récupération des évaluations pour la prestation #${serviceId}:`, error);
      throw error;
    }
  }

  // Créer une évaluation pour une prestation
  async createRating (serviceId, rating, comment) {
    try {
      // Vérifier si une évaluation existe déjà
      const ratingCheck = await pool.query(
        'SELECT * FROM service_ratings WHERE service_id = $1',
        [serviceId]
      );
      
      if (ratingCheck.rows.length > 0) {
        throw new Error('Cette prestation a déjà été évaluée');
      }
      
      // Vérifier la validité de l'évaluation
      if (rating < 1 || rating > 5) {
        throw new Error('L\'évaluation doit être comprise entre 1 et 5');
      }
      
      // Enregistrer l'évaluation
      const result = await pool.query(
        'INSERT INTO service_ratings (service_id, rating, comment) VALUES ($1, $2, $3) RETURNING *',
        [serviceId, rating, comment]
      );
      
      return result.rows[0];
    } catch (error) {
      logger.error(`Erreur lors de la création d'une évaluation pour la prestation #${serviceId}:`, error);
      throw error;
    }
  }
}

module.exports = new ServiceRatingModel();