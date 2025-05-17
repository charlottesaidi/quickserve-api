const ServiceModel = require('../models/serviceModel');

// Contrôleur pour les prestations de services
class ServiceController {
    async createService(req, res, next) {
    try {
      const { 
        category_id, 
        title, 
        description, 
        address, 
        latitude, 
        longitude, 
        scheduled_at 
      } = req.body;
      
      // Vérifier si la catégorie existe
      const category = await ServiceCategoryModel.getCategoryById(category_id);
      
      if (!category) {
        return res.status(404).json({ message: 'Catégorie non trouvée' });
      }
      
      // Créer la prestation
      const serviceData = {
        client_id: req.user.id,
        category_id,
        title,
        description,
        address,
        latitude,
        longitude,
        payment_amount: category.base_price,
        scheduled_at
      };
      
      const service = await ServiceModel.createService(serviceData);
      
      res.status(201).json({
        message: 'Prestation créée avec succès',
        service
      });
    } catch (error) {
      next(error);
    }
  }

  // Récupérer les prestations d'un client
  async getClientServices (req, res, next) {
    try {
      const { status } = req.query;
      const services = await ServiceModel.getClientServices(req.user.id, status);
      
      res.status(200).json({ services });
    } catch (error) {
      next(error);
    }
  }

  // Récupérer les prestations d'un prestataire
  async getProviderServices(req, res, next) {
    try {
      const { status } = req.query;
      const services = await ServiceModel.getProviderServices(req.user.id, status);
      
      res.status(200).json({ services });
    } catch (error) {
      next(error);
    }
  }

  // Récupérer les prestations disponibles
  async getAvailableServices(req, res, next) {
    try {
      const services = await ServiceModel.getAvailableServices();
      
      res.status(200).json({ services });
    } catch (error) {
      next(error);
    }
  }

  // Obtenir les détails d'une prestation
  async getServiceDetails(req, res, next) {
    try {
      const serviceId = req.params.id;
      
      const service = await ServiceModel.getServiceById(serviceId);
      
      if (!service) {
        return res.status(404).json({ message: 'Prestation non trouvée' });
      }
      
      // Vérifier que l'utilisateur est autorisé à voir cette prestation
      if (service.client_id !== req.user.id && service.provider_id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Accès non autorisé' });
      }
      
      // Récupérer les évaluations si la prestation est terminée
      let ratings = [];
      if (service.status === 'completed') {
        ratings = await ServiceRatingModel.getRatingsByServiceId(serviceId);
      }
      
      res.status(200).json({
        service,
        ratings
      });
    } catch (error) {
      next(error);
    }
  }

  // Accepter une prestation (prestataire)
  async acceptService (req, res, next) {
    try {
      const serviceId = req.params.id;
      
      // Vérifier que l'utilisateur est un prestataire
      if (req.user.role !== 'provider') {
        return res.status(403).json({ message: 'Accès non autorisé' });
      }
      
      const service = await ServiceModel.acceptService(serviceId, req.user.id);
      
      res.status(200).json({
        message: 'Prestation acceptée avec succès',
        service
      });
    } catch (error) {
      if (error.message === 'Prestation non disponible') {
        return res.status(400).json({ message: error.message });
      }
      next(error);
    }
  }

  // Démarrer une prestation
  async startService (req, res, next) {
    try {
      const serviceId = req.params.id;
      
      const service = await ServiceModel.startService(serviceId, req.user.id);
      
      res.status(200).json({
        message: 'Prestation démarrée avec succès',
        service
      });
    } catch (error) {
      if (error.message === 'Accès non autorisé ou prestation non assignée') {
        return res.status(403).json({ message: error.message });
      }
      next(error);
    }
  }

  // Terminer une prestation
  async completeService(req, res, next) {
    try {
      const serviceId = req.params.id;
      
      const service = await ServiceModel.completeService(serviceId, req.user.id);
      
      res.status(200).json({
        message: 'Prestation terminée avec succès',
        service
      });
    } catch (error) {
      if (error.message === 'Accès non autorisé ou prestation pas en cours') {
        return res.status(403).json({ message: error.message });
      }
      next(error);
    }
  }

  // Annuler une prestation
  async cancelService(req, res, next) {
    try {
      const serviceId = req.params.id;
      const { reason } = req.body;
      
      const service = await ServiceModel.cancelService(serviceId, req.user.id, reason);
      
      res.status(200).json({
        message: 'Prestation annulée avec succès',
        service
      });
    } catch (error) {
      if (error.message === 'Accès non autorisé' || error.message === 'Cette prestation ne peut pas être annulée') {
        return res.status(400).json({ message: error.message });
      }
      next(error);
    }
  }
}

module.exports = new ServiceController();