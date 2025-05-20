const stripeService = require('../services/stripeService');
const paymentMethodModel = require('../models/paymentMethodModel');
const logger = require('../utils/logger');
const ErrorHandler = require('../utils/errorHandler');

class PaymentMethodController {
  async addPaymentMethod(req, res) {
    try {
      const { paymentMethodId, setDefault, autoPay } = req.validatedData;
      const clientId = req.user.id;
      
      // Récupérer les détails de la méthode de paiement auprès de Stripe
      const stripePaymentMethod = await stripeService.retrievePaymentMethod(paymentMethodId);
      
      // Obtenir ou créer un customer Stripe
      let stripeCustomerId = await paymentMethodModel.getStripeCustomerId(clientId);
      
      if (!stripeCustomerId) {
        // Créer un nouveau customer
        const customerEmail = req.user.email || `client-${clientId}@example.com`;
        stripeCustomerId = await stripeService.createCustomer(customerEmail, clientId);
      }
      
      // Attacher la méthode de paiement au client
      await stripeService.attachPaymentMethodToCustomer(paymentMethodId, stripeCustomerId);
      
      // Si c'est défini comme carte par défaut dans Stripe
      if (setDefault) {
        await stripeService.updateDefaultPaymentMethod(stripeCustomerId, paymentMethodId);
      }
      
      // Enregistrer la méthode de paiement dans notre base de données
      const cardDetails = stripePaymentMethod.card || {};
      
      const paymentMethodData = {
        client_id: clientId,
        type: stripePaymentMethod.type,
        last_digits: cardDetails.last4 || null,
        expiry_month: cardDetails.exp_month || null,
        expiry_year: cardDetails.exp_year || null,
        card_brand: cardDetails.brand || null,
        stripe_payment_method_id: paymentMethodId,
        stripe_customer_id: stripeCustomerId,
        is_default: setDefault,
        auto_pay: autoPay,
      };
      
      // Si c'est défini comme carte par défaut, mettre à jour toutes les autres cartes
      if (setDefault) {
        await paymentMethodModel.setDefaultPaymentMethod(0, clientId); // 0 est un ID fictif qui sera ignoré
      }
      
      const result = await paymentMethodModel.addPaymentMethod(paymentMethodData);
      
      res.status(201).json({
        message: 'Méthode de paiement ajoutée avec succès',
        payment_method_id: result.id,
        is_default: setDefault,
        auto_pay: autoPay,
      });
    } catch (error) {
      logger.error('Erreur lors de l\'ajout de la méthode de paiement:', error);
      return ErrorHandler.handleError(res, error);
    }
  }

  async getPaymentMethods(req, res) {
    try {
      const clientId = req.user.id;
      
      const paymentMethods = await paymentMethodModel.getPaymentMethods(clientId);
      
      res.status(200).json({ payment_methods: paymentMethods });
    } catch (error) {
      logger.error('Erreur lors de la récupération des méthodes de paiement:', error);
      return ErrorHandler.handleError(res, error);
    }
  }

  async deletePaymentMethod(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      const clientId = req.user.id;
      
      if (isNaN(id)) {
        return res.status(400).json({ message: 'ID de méthode de paiement invalide' });
      }
      
      // Récupérer la méthode de paiement
      const paymentMethod = await paymentMethodModel.getPaymentMethod(id, clientId);
      
      if (!paymentMethod) {
        return res.status(404).json({ message: 'Méthode de paiement non trouvée' });
      }
      
      // Détacher la méthode de paiement dans Stripe
      await stripeService.detachPaymentMethod(paymentMethod.stripe_payment_method_id);
      
      // Supprimer la méthode de paiement de notre base de données
      await paymentMethodModel.deletePaymentMethod(id, clientId);
      
      // Si c'était la méthode par défaut, en définir une autre
      if (paymentMethod.is_default) {
        const otherMethods = await paymentMethodModel.getPaymentMethods(clientId);
        
        if (otherMethods.length > 0) {
          await paymentMethodModel.setDefaultPaymentMethod(otherMethods[0].id, clientId);
          
          // Mettre à jour dans Stripe
          await stripeService.updateDefaultPaymentMethod(
            paymentMethod.stripe_customer_id,
            otherMethods[0].stripe_payment_method_id,
          );
        }
      }
      
      res.status(200).json({ message: 'Méthode de paiement supprimée avec succès' });
    } catch (error) {
      logger.error('Erreur lors de la suppression de la méthode de paiement:', error);
      return ErrorHandler.handleError(res, error);
    }
  }

  async setDefaultPaymentMethod(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      const clientId = req.user.id;
      
      if (isNaN(id)) {
        return res.status(400).json({ message: 'ID de méthode de paiement invalide' });
      }
      
      // Récupérer la méthode de paiement
      const paymentMethod = await paymentMethodModel.getPaymentMethod(id, clientId);
      
      if (!paymentMethod) {
        return res.status(404).json({ message: 'Méthode de paiement non trouvée' });
      }
      
      // Définir comme méthode par défaut dans notre base de données
      await paymentMethodModel.setDefaultPaymentMethod(id, clientId);
      
      // Mettre à jour dans Stripe
      await stripeService.updateDefaultPaymentMethod(
        paymentMethod.stripe_customer_id,
        paymentMethod.stripe_payment_method_id,
      );
      
      res.status(200).json({ message: 'Méthode de paiement définie par défaut avec succès' });
    } catch (error) {
      logger.error('Erreur lors de la définition de la méthode de paiement par défaut:', error);
      return ErrorHandler.handleError(res, error);
    }
  }
}

module.exports = new PaymentMethodController();