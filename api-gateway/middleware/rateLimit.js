const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

// Configuration de rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limite chaque IP à 100 requêtes par fenêtre
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Trop de requêtes, veuillez réessayer plus tard' },
  handler: (req, res, next, options) => {
    logger.warn(`Rate limit dépassé pour l'IP: ${req.ip}`);
    res.status(429).json(options.message);
  },
});

module.exports = apiLimiter;