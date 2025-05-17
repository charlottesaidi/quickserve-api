const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');
const providerController = require('../controllers/providerController');
const { authenticateToken } = require('../middleware/auth');
const { validateCoordinates, validateLocationUpdate } = require('../middleware/validation');

// Routes protégées - nécessitent une authentification
router.post('/location', authenticateToken, validateLocationUpdate, locationController.updateLocation);
router.get('/providers/:id/location', authenticateToken, locationController.getProviderLocation);
router.get('/providers/nearby', authenticateToken, validateCoordinates, providerController.findNearbyProviders);
router.get('/services/:id/location-history', authenticateToken, locationController.getLocationHistory);

// Route de santé
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

module.exports = router;