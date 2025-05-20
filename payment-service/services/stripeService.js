const { stripe } = require('../config/stripe');
const logger = require('../utils/logger');

class StripeService {
  async createCustomer(email, clientId) {
    try {
      const customer = await stripe.customers.create({
        email,
        metadata: {
          client_id: clientId.toString(),
        },
      });
      
      return customer.id;
    } catch (error) {
      logger.error('Erreur lors de la création du client Stripe:', error);
      throw error;
    }
  }

  async createPaymentIntent(amount, customerId, description) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: 'eur',
        customer: customerId,
        setup_future_usage: 'off_session',
        confirm: false,
        description,
      });
      
      return paymentIntent;
    } catch (error) {
      logger.error('Erreur lors de la création de l\'intention de paiement:', error);
      throw error;
    }
  }

  async createPaymentIntentWithSavedMethod(amount, customerId, paymentMethodId, description) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: 'eur',
        customer: customerId,
        payment_method: paymentMethodId,
        setup_future_usage: 'off_session',
        confirm: false,
        description,
      });
      
      return paymentIntent;
    } catch (error) {
      logger.error('Erreur lors de la création de l\'intention de paiement avec méthode enregistrée:', error);
      throw error;
    }
  }

  async createAndConfirmPaymentIntent(amount, customerId, paymentMethodId, description) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: 'eur',
        customer: customerId,
        payment_method: paymentMethodId,
        confirm: true,
        off_session: true,
        description,
      });
      
      return paymentIntent;
    } catch (error) {
      logger.error('Erreur lors de la création et confirmation de l\'intention de paiement:', error);
      throw error;
    }
  }

  async retrievePaymentIntent(paymentIntentId) {
    try {
      return await stripe.paymentIntents.retrieve(paymentIntentId);
    } catch (error) {
      logger.error('Erreur lors de la récupération de l\'intention de paiement:', error);
      throw error;
    }
  }

  async attachPaymentMethodToCustomer(paymentMethodId, customerId) {
    try {
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });
      
      return true;
    } catch (error) {
      logger.error('Erreur lors de l\'attachement de la méthode de paiement au client:', error);
      throw error;
    }
  }

  async detachPaymentMethod(paymentMethodId) {
    try {
      await stripe.paymentMethods.detach(paymentMethodId);
      return true;
    } catch (error) {
      logger.error('Erreur lors du détachement de la méthode de paiement:', error);
      throw error;
    }
  }

  async retrievePaymentMethod(paymentMethodId) {
    try {
      return await stripe.paymentMethods.retrieve(paymentMethodId);
    } catch (error) {
      logger.error('Erreur lors de la récupération de la méthode de paiement:', error);
      throw error;
    }
  }

  async updateDefaultPaymentMethod(customerId, paymentMethodId) {
    try {
      await stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });
      
      return true;
    } catch (error) {
      logger.error('Erreur lors de la mise à jour de la méthode de paiement par défaut:', error);
      throw error;
    }
  }

  async constructWebhookEvent(payload, signature, webhookSecret) {
    try {
      return stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret,
      );
    } catch (error) {
      logger.error('Erreur lors de la construction de l\'événement webhook:', error);
      throw error;
    }
  }
}

module.exports = new StripeService();