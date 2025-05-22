// Middleware de validation pour la création de service
function validateCreateService(req, res, next) {
  const { 
    category_id,
  } = req.body;
  
  // Valider la présence des champs obligatoires
  if (!category_id) {
    return res.status(400).json({ 
      message: 'Données invalides', 
      errors: {
        category_id: category_id === undefined ? undefined : 'La catégorie est requise',
      },
    });
  }
  
  // Valider le type des données
  if (typeof category_id !== 'number' || isNaN(category_id)) {
    return res.status(400).json({ 
      message: 'Données invalides', 
      errors: { category_id: 'La catégorie doit être un nombre' }, 
    });
  }
  
  next();
}

// Middleware de validation pour l'évaluation d'un service
function validateRating(req, res, next) {
  const { rating, comment } = req.body;
  
  // Valider la présence de l'évaluation
  if (rating === undefined) {
    return res.status(400).json({ 
      message: 'Données invalides', 
      errors: { rating: 'L\'évaluation est requise' }, 
    });
  }
  
  // Valider le type et la plage de l'évaluation
  if (isNaN(parseInt(rating)) || parseInt(rating) < 1 || parseInt(rating) > 5) {
    return res.status(400).json({ 
      message: 'Données invalides', 
      errors: { rating: 'L\'évaluation doit être un nombre entre 1 et 5' }, 
    });
  }
  
  next();
}

module.exports = {
  validateCreateService,
  validateRating,
};