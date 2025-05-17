const ServiceRatingModel = require('../models/ratingModel');

class RatingController {
    async rateService(req, res, next) {
    try {
      const serviceId = req.params.id;
      const { rating, comment } = req.body;
      
      // Vérifier que l'utilisateur est le client de la prestation
      const service = await ServiceModel.getServiceById(serviceId);
      
      if (!service || service.client_id !== req.user.id || service.status !== 'completed') {
        return res.status(403).json({ message: 'Accès non autorisé ou prestation non terminée' });
      }
      
      // Créer l'évaluation
      const ratingData = await ServiceRatingModel.createRating(serviceId, rating, comment);
      
      // Publier l'événement prestation évaluée
      publishEvent('service-events', {
        type: 'SERVICE_RATED',
        data: { 
          service_id: serviceId,
          client_id: req.user.id,
          provider_id: service.provider_id,
          rating
        }
      });
      
      res.status(200).json({
        message: 'Évaluation enregistrée avec succès',
        rating: ratingData
      });
    } catch (error) {
      if (error.message === 'Cette prestation a déjà été évaluée' || 
          error.message === 'L\'évaluation doit être comprise entre 1 et 5') {
        return res.status(400).json({ message: error.message });
      }
      next(error);
    }
  }
}

module.exports = new RatingController();