const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const providerController = require('../controllers/providerController');
const clientController = require('../controllers/clientController');
const { authenticateToken, checkRole } = require('../middleware/auth');
const { validateRegister, validateLogin, validateProfileUpdate } = require('../middleware/validation');

// Routes publiques
router.post('/register', validateRegister, userController.register);
router.post('/login', validateLogin, userController.login);

// Routes protégées
router.get('/', authenticateToken, userController.getAllUsers);
router.get('/profile', authenticateToken, userController.getProfile);
router.put('/profile', authenticateToken, validateProfileUpdate, userController.updateProfile);
router.get('/providers', authenticateToken, checkRole('client'), providerController.getAllProviders);
router.get('/clients', authenticateToken, checkRole('provider'), clientController.getAllClients);

// Route de santé
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

module.exports = router;