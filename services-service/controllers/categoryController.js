const CategoryModel = require('../models/categoryModel');

class CategoryController {
  async getAllCategories(req, res, next) {
    try {
      const categories = await CategoryModel.getAllCategories();
      res.status(200).json({ categories });
    } catch (error) {
      next(error);
    }
  }

  async getCategoryBySlug(req, res, next) {
    try {
      const category = await CategoryModel.getCategoryBySlug(req.params.slug);
      res.status(200).json(category);
    } catch (error) {
      next(error);
    }
  }

  async createCategory(req, res, next) {
    try {
      const {
        name,
        slug,
        description,
        full_description,
        features,
        faq,
        base_price,
        image_url
      } = req.body;

      // Créer la prestation
      const categoryData = {
        name,
        slug,
        description,
        full_description,
        features: JSON.stringify(features || []),
        faq: JSON.stringify(faq || []),
        base_price,
        image_url,
        active: true,
      };

      const category = await CategoryModel.createCategory(categoryData);

      res.status(201).json({
        message: 'Catégorie de prestation créée avec succès',
        category,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CategoryController();