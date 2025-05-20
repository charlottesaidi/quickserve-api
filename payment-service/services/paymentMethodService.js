const paymentMethodModel = require('../models/paymentMethodModel');
const stripeService = require('./stripeService');
const logger = require('../utils/logger');

class PaymentMethodService {
  async addPaymentMethod(clientId, paymentMethodId, setDefault, autoPay) {
    try {
      // Récupérer les détails de la méthode de paiement auprès de Stripe
      const stripePaymentMethod = await stripeService.retrievePaymentMethod(paymentMethodId);
      
      // Obtenir ou créer un customer Stripe
      let stripeCustomerId = await paymentMethodModel.getStripeCustomerId(clientId);
      
      if (!stripeCustomerId) {
        // Créer un nouveau customer
        const customerEmail = `client-${clientId}@example.com`; // Idéalement, récupérer l'email du service utilisateurs
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
      
      return {
        id: result.id,
        is_default: setDefault,
        auto_pay: autoPay,
      };
    } catch (error) {
      logger.error('Erreur lors de l\'ajout de la méthode de paiement:', error);
      throw error;
    }
  }

  async getPaymentMethods(clientId) {
    try {
      return await paymentMethodModel.getPaymentMethods(clientId);
    } catch (error) {
      logger.error('Erreur lors de la récupération des méthodes de paiement:', error);
      throw error;
    }
  }

  async deletePaymentMethod(id, clientId) {
    try {
      // Récupérer la méthode de paiement
      const paymentMethod = await paymentMethodModel.getPaymentMethod(id, clientId);
      
      if (!paymentMethod) {
        throw new Error('Méthode de paiement non trouvée');
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
      
      return { success: true };
    } catch (error) {
      logger.error('Erreur lors de la suppression de la méthode de paiement:', error);
      throw error;
    }
  }

  async setDefaultPaymentMethod(id, clientId) {
    try {
      // Récupérer la méthode de paiement
      const paymentMethod = await paymentMethodModel.getPaymentMethod(id, clientId);
      
      if (!paymentMethod) {
        throw new Error('Méthode de paiement non trouvée');
      }
      
      // Définir comme méthode par défaut dans notre base de données
      await paymentMethodModel.setDefaultPaymentMethod(id, clientId);
      
      // Mettre à jour dans Stripe
      await stripeService.updateDefaultPaymentMethod(
        paymentMethod.stripe_customer_id,
        paymentMethod.stripe_payment_method_id,
      );
      
      return { success: true };
    } catch (error) {
      logger.error('Erreur lors de la définition de la méthode de paiement par défaut:', error);
      throw error;
    }
  }
}

module.exports = new PaymentMethodService();