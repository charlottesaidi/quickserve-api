const paymentModel = require('../models/paymentModel');
const paymentMethodModel = require('../models/paymentMethodModel');
const stripeService = require('./stripeService');
const eventService = require('./eventService');
const logger = require('../utils/logger');

class PaymentService {
  async registerPendingPayment(serviceId, clientId, amount) {
    try {
      // Vérifier si un paiement existe déjà pour ce service
      const existingPayment = await paymentModel.findByServiceId(serviceId);
      
      if (existingPayment) {
        // Si le paiement est annulé, le réactiver
        if (existingPayment.status === 'cancelled') {
          return await paymentModel.updatePaymentStatus(existingPayment.id, 'pending');
        }
        return existingPayment;
      }
      
      // Créer un nouveau paiement
      return await paymentModel.createPayment(serviceId, clientId, amount);
    } catch (error) {
      logger.error('Erreur lors de l\'enregistrement du paiement en attente:', error);
      throw error;
    }
  }

  async createPaymentIntent(serviceId, clientId, paymentMethodId = null) {
    try {
      // Récupérer les informations du paiement
      const payment = await paymentModel.findByServiceId(serviceId);
      
      if (!payment) {
        throw new Error('Paiement non trouvé');
      }
      
      if (payment.status === 'completed') {
        throw new Error('Ce service est déjà payé');
      }
      
      // Récupérer la méthode de paiement si spécifiée
      let paymentMethod = null;
      if (paymentMethodId) {
        paymentMethod = await paymentMethodModel.getPaymentMethod(paymentMethodId, clientId);
        if (!paymentMethod) {
          throw new Error('Méthode de paiement non trouvée');
        }
      }
      
      // Créer l'intention de paiement avec Stripe
      const amount = Math.round(payment.amount * 100); // Conversion en centimes pour Stripe
      let paymentIntent;
      
      if (paymentMethod) {
        // Utiliser une méthode de paiement enregistrée
        paymentIntent = await stripeService.createPaymentIntentWithSavedMethod(
          amount,
          paymentMethod.stripe_customer_id,
          paymentMethod.stripe_payment_method_id,
          `Paiement pour le service #${serviceId}`
        );
      } else {
        // Obtenir ou créer un customer Stripe
        let stripeCustomerId = await paymentMethodModel.getStripeCustomerId(clientId);
        
        if (!stripeCustomerId) {
          // Créer un nouveau customer si nécessaire
          const customerEmail = `client-${clientId}@example.com`; // Idéalement, récupérer l'email du service utilisateurs
          stripeCustomerId = await stripeService.createCustomer(customerEmail, clientId);
        }
        
        // Créer une intention sans méthode spécifique
        paymentIntent = await stripeService.createPaymentIntent(
          amount,
          stripeCustomerId,
          `Paiement pour le service #${serviceId}`
        );
      }
      
      // Mettre à jour l'ID de l'intention de paiement
      await paymentModel.updatePaymentIntent(payment.id, paymentIntent.id);
      
      return {
        client_secret: paymentIntent.client_secret
      };
    } catch (error) {
      logger.error('Erreur lors de la création de l\'intention de paiement:', error);
      throw error;
    }
  }

  async confirmPayment(paymentIntentId, clientId) {
    try {
      // Vérifier l'état du paiement auprès de Stripe
      const paymentIntent = await stripeService.retrievePaymentIntent(paymentIntentId);
      
      if (paymentIntent.status !== 'succeeded') {
        throw new Error('Le paiement n\'a pas été validé');
      }
      
      // Récupérer le paiement dans notre base de données
      const payment = await paymentModel.findByPaymentIntentId(paymentIntentId);
      
      if (!payment) {
        throw new Error('Paiement non trouvé');
      }
      
      // Vérifier que l'utilisateur est bien le client
      if (payment.client_id !== clientId) {
        throw new Error('Accès non autorisé');
      }
      
      // Mettre à jour le statut du paiement
      const updatedPayment = await paymentModel.updatePaymentStatus(payment.id, 'completed');
      
      // Publier l'événement de paiement réussi
      eventService.publishPaymentCompleted(
        payment.service_id,
        payment.client_id,
        payment.id,
        payment.amount,
        paymentIntentId
      );
      
      return updatedPayment;
    } catch (error) {
      logger.error('Erreur lors de la confirmation du paiement:', error);
      throw error;
    }
  }

  async processAutomaticPayment(serviceId, clientId) {
    try {
      // Récupérer le paiement
      const payment = await paymentModel.findByServiceId(serviceId);
      
      if (!payment || payment.status !== 'pending') {
        return null;
      }
      
      // Vérifier si le client a une méthode de paiement par défaut avec auto_pay activé
      const defaultPaymentMethod = await paymentMethodModel.getDefaultPaymentMethod(clientId);
      
      if (!defaultPaymentMethod || !defaultPaymentMethod.auto_pay) {
        logger.info(`Pas de paiement automatique configuré pour le service #${serviceId}`);
        return null;
      }
      
      try {
        // Créer et confirmer immédiatement un PaymentIntent
        const amount = Math.round(payment.amount * 100);
        const paymentIntent = await stripeService.createAndConfirmPaymentIntent(
          amount,
          defaultPaymentMethod.stripe_customer_id,
          defaultPaymentMethod.stripe_payment_method_id,
          `Paiement automatique pour le service #${serviceId}`
        );
        
        // Mettre à jour le paiement
        await paymentModel.updatePaymentIntent(payment.id, paymentIntent.id);
        const updatedPayment = await paymentModel.updatePaymentStatus(payment.id, 'completed');
        
        // Publier l'événement de paiement réussi
        eventService.publishPaymentCompleted(
          serviceId,
          clientId,
          payment.id,
          payment.amount,
          paymentIntent.id
        );
        
        logger.info(`Paiement automatique réussi pour le service #${serviceId}`);
        return updatedPayment;
      } catch (error) {
        // En cas d'échec, mettre à jour le statut du paiement
        const errorMessage = error.message || 'Erreur lors du paiement automatique';
        await paymentModel.updatePaymentStatus(payment.id, 'failed', errorMessage);
        
        // Publier l'événement de paiement échoué
        eventService.publishPaymentFailed(serviceId, clientId, payment.id, errorMessage);
        
        logger.error(`Erreur lors du paiement automatique pour le service #${serviceId}:`, error);
        throw error;
      }
    } catch (error) {
      logger.error('Erreur lors du traitement du paiement automatique:', error);
      throw error;
    }
  }

  async cancelPayment(serviceId) {
    try {
      const payment = await paymentModel.findByServiceId(serviceId);
      
      if (!payment || payment.status !== 'pending') {
        return null;
      }
      
      return await paymentModel.updatePaymentStatus(payment.id, 'cancelled');
    } catch (error) {
      logger.error('Erreur lors de l\'annulation du paiement:', error);
      throw error;
    }
  }

  async getPaymentHistory(clientId) {
    try {
      return await paymentModel.getPaymentHistory(clientId);
    } catch (error) {
      logger.error('Erreur lors de la récupération de l\'historique des paiements:', error);
      throw error;
    }
  }
}

module.exports = new PaymentService();