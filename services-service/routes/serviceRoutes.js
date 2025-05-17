const express = require('express');
const { authenticateToken, checkRole } = require('../middleware/auth');
const { validateCreateService, validateRating } = require('../middleware/validation');
const serviceController = require('../controllers/serviceController');
const categoryController = require('../controllers/categoryController');
const ratingController = require('../controllers/ratingController');

const router = express.Router();

// Routes pour les catégories de services
router.get('/categories', categoryController.getAllCategories);

// Routes pour les prestations
// Créer une nouvelle prestation (nécessite authentification)
router.post('/', authenticateToken, validateCreateService, serviceController.createService);

// Récupérer les prestations d'un client
router.get('/clients/services', authenticateToken, serviceController.getClientServices);

// Récupérer les prestations d'un prestataire
router.get('/providers/services', authenticateToken, checkRole('provider'), serviceController.getProviderServices);

// Récupérer les prestations disponibles (pour les prestataires)
router.get('/available', authenticateToken, checkRole('provider'), serviceController.getAvailableServices);

// Obtenir les détails d'une prestation
router.get('/:id', authenticateToken, serviceController.getServiceDetails);

// Accepter une prestation (pour un prestataire)
router.post('/:id/accept', authenticateToken, checkRole('provider'), serviceController.acceptService);

// Démarrer une prestation
router.post('/:id/start', authenticateToken, checkRole('provider'), serviceController.startService);

// Terminer une prestation
router.post('/:id/complete', authenticateToken, checkRole('provider'), serviceController.completeService);

// Évaluer une prestation
router.post('/:id/rate', authenticateToken, validateRating, ratingController.rateService);

// Annuler une prestation
router.post('/:id/cancel', authenticateToken, serviceController.cancelService);

module.exports = router;