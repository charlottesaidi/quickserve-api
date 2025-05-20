require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 3004,
  JWT_SECRET: process.env.JWT_SECRET || 'your_jwt_secret',
  NODE_ENV: process.env.NODE_ENV || 'development',
  DB_CONFIG: {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'quickserve_payments',
    password: process.env.DB_PASSWORD || 'postgres',
    port: process.env.DB_PORT || 5432,
  },
  RABBITMQ_URL: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
  STRIPE: {
    SECRET_KEY: process.env.STRIPE_SECRET_KEY || 'sk_test_your_stripe_key',
    WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || 'whsec_your_webhook_secret',
    API_VERSION: '2022-11-15',
  },
};