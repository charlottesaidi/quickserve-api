const env = require('./env');

// Configuration des services avec leurs URLs et chemins
module.exports = {
  users: {
    url: env.USERS_SERVICE_URL,
    path: '/api/users'
  },
  geolocation: {
    url: env.GEOLOCATION_SERVICE_URL,
    path: '/api/geolocation'
  },
  services: {
    url: env.SERVICES_SERVICE_URL,
    path: '/api/services'
  },
  payments: {
    url: env.PAYMENT_SERVICE_URL,
    path: '/api/payments'
  }
};