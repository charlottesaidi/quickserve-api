const logger = require('../utils/logger');

function validatePaymentIntentRequest(req, res, next) {
  const { service_id } = req.body;
  
  if (!service_id) {
    return res.status(400).json({ message: 'ID de service manquant' });
  }
  
  if (isNaN(parseInt(service_id, 10))) {
    return res.status(400).json({ message: 'ID de service invalide' });
  }
  
  // Convertir en nombre et stocker dans l'objet req
  req.validatedData = {
    serviceId: parseInt(service_id, 10),
    paymentMethodId: req.body.payment_method_id ? parseInt(req.body.payment_method_id, 10) : null
  };
  
  next();
}

function validatePaymentConfirmation(req, res, next) {
  const { payment_intent_id } = req.body;
  
  if (!payment_intent_id) {
    return res.status(400).json({ message: 'ID d\'intention de paiement manquant' });
  }
  
  // Le payment_intent_id est une chaîne, pas besoin de conversion
  req.validatedData = {
    paymentIntentId: payment_intent_id
  };
  
  next();
}

function validatePaymentMethodCreate(req, res, next) {
  const { payment_method_id, set_default, auto_pay } = req.body;
  
  if (!payment_method_id) {
    return res.status(400).json({ message: 'ID de méthode de paiement manquant' });
  }
  
  req.validatedData = {
    paymentMethodId: payment_method_id,
    setDefault: set_default === true,
    autoPay: auto_pay === true
  };
  
  next();
}

module.exports = {
  validatePaymentIntentRequest,
  validatePaymentConfirmation,
  validatePaymentMethodCreate
};