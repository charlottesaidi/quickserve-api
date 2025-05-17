const logger = require('../utils/logger');

function validateCoordinates(req, res, next) {
  const { latitude, longitude } = req.query;
  
  if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
    return res.status(400).json({ message: 'Coordonnées invalides' });
  }
  
  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);
  
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return res.status(400).json({ message: 'Coordonnées hors limites' });
  }
  
  // Convertir en nombres et stocker dans l'objet req
  req.coordinates = {
    latitude: lat,
    longitude: lng
  };
  
  next();
}

function validateLocationUpdate(req, res, next) {
  const { latitude, longitude, accuracy } = req.body;
  
  if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
    return res.status(400).json({ message: 'Coordonnées invalides' });
  }
  
  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);
  
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return res.status(400).json({ message: 'Coordonnées hors limites' });
  }
  
  // Convertir en nombres et stocker dans l'objet req
  req.locationData = {
    latitude: lat,
    longitude: lng,
    accuracy: accuracy ? parseFloat(accuracy) : null,
    service_id: req.body.service_id ? parseInt(req.body.service_id, 10) : null
  };
  
  next();
}

module.exports = {
  validateCoordinates,
  validateLocationUpdate
};