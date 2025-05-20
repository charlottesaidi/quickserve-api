const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const paymentMethodController = require('../controllers/paymentMethodController');
const { authenticateToken } = require('../middleware/auth');
const { 
  validatePaymentIntentRequest, 
  validatePaymentConfirmation,
  validatePaymentMethodCreate,
} = require('../middleware/validation');
const stripeWebhook = require('../webhooks/stripeWebhook');

// Routes de paiement
router.post(
  '/payment-intents',
  authenticateToken,
  validatePaymentIntentRequest,
  paymentController.createPaymentIntent,
);

router.post(
  '/confirm',
  authenticateToken,
  validatePaymentConfirmation,
  paymentController.confirmPayment,
);

router.get(
  '/history',
  authenticateToken,
  paymentController.getPaymentHistory,
);

// Routes de méthodes de paiement
router.post(
  '/payment-methods',
  authenticateToken,
  validatePaymentMethodCreate,
  paymentMethodController.addPaymentMethod,
);

router.get(
  '/payment-methods',
  authenticateToken,
  paymentMethodController.getPaymentMethods,
);

router.delete(
  '/payment-methods/:id',
  authenticateToken,
  paymentMethodController.deletePaymentMethod,
);

router.post(
  '/payment-methods/:id/set-default',
  authenticateToken,
  paymentMethodController.setDefaultPaymentMethod,
);

// Webhook Stripe
router.post('/stripe-webhook', express.raw({ type: 'application/json' }), stripeWebhook.handleWebhook);

// Route de santé
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

module.exports = router;