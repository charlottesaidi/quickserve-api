const { pool } = require('../config/database');
const logger = require('../utils/logger');

class CategoryModel {
  async createCategory(categoryData) {
    try {
      const { 
        name, 
        slug,
        description,
        full_description,
        features,
        faq,
        base_price,
        image_url, 
        active 
      } = categoryData;
      
      const result = await pool.query(
        `INSERT INTO service_categories 
         (name, slug, description, full_description, features, faq, base_price, image_url, active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [
          name,
          slug,
          description,
          full_description,
          features,
          faq,
          base_price,
          image_url,
          active
        ]
      );
      
      const category = result.rows[0];
      
      return category;
    } catch (error) {
      logger.error('Erreur lors de la création de la catégorie de prestation:', error);
      throw error;
    }
  }

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