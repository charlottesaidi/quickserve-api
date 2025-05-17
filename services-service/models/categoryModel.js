const { pool } = require('../config/database');
const logger = require('../utils/logger');

class CategoryModel {
  // Récupérer toutes les catégories actives
  async getAllCategories() {
    try {
      const result = await pool.query(
        'SELECT * FROM service_categories WHERE active = true ORDER BY name'
      );
      return result.rows;
    } catch (error) {
      logger.error('Erreur lors de la récupération des catégories:', error);
      throw error;
    }
  }

  // Récupérer une catégorie par son ID
  async getCategoryById(categoryId) {
    try {
      const result = await pool.query(
        'SELECT * FROM service_categories WHERE id = $1 AND active = true',
        [categoryId]
      );
      return result.rows[0];
    } catch (error) {
      logger.error(`Erreur lors de la récupération de la catégorie #${categoryId}:`, error);
      throw error;
    }
  }
}

module.exports = new CategoryModel();