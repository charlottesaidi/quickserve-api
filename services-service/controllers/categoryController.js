const CategoryModel = require('../models/categoryModel');

class CategoryController {
    async getAllCategories (req, res, next) {
        try {
            const categories = await CategoryModel.getAllCategories();
            res.status(200).json({ categories });
        } catch (error) {
            next(error);
        }
    } 
}

module.exports = new CategoryController();