const paymentService = require('../services/paymentService');
const logger = require('../utils/logger');
const ErrorHandler = require('../utils/errorHandler');

class PaymentController {
  async createPaymentIntent(req, res) {
    try {
      const { serviceId, paymentMethodId } = req.validatedData;
      const clientId = req.user.id;
      
      const paymentIntent = await paymentService.createPaymentIntent(
        serviceId,
        clientId,
        paymentMethodId
      );
      
      res.status(200).json(paymentIntent);
    } catch (error) {
      logger.error('Erreur lors de la création de l\'intention de paiement:', error);
      return ErrorHandler.handleError(res, error);
    }
  }

  async confirmPayment(req, res) {
    try {
      const { paymentIntentId } = req.validatedData;
      const clientId = req.user.id;
      
      const payment = await paymentService.confirmPayment(paymentIntentId, clientId);
      
      res.status(200).json({
        message: 'Paiement confirmé avec succès',
        payment_id: payment.id
      });
    } catch (error) {
      logger.error('Erreur lors de la confirmation du paiement:', error);
      return ErrorHandler.handleError(res, error);
    }
  }

  async getPaymentHistory(req, res) {
    try {
      const clientId = req.user.id;
      
      const payments = await paymentService.getPaymentHistory(clientId);
      
      res.status(200).json({ payments });
    } catch (error) {
      logger.error('Erreur lors de la récupération de l\'historique des paiements:', error);
      return ErrorHandler.handleError(res, error);
    }
  }
}

module.exports = new PaymentController();