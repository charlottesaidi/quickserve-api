require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 3002,
  JWT_SECRET: process.env.JWT_SECRET || 'your_jwt_secret',
  NODE_ENV: process.env.NODE_ENV || 'development',
  DB_CONFIG: {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'quickserve_geolocation',
    password: process.env.DB_PASSWORD || 'postgres',
    port: process.env.DB_PORT || 5432,
  },
  RABBITMQ_URL: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
  SOCKET_CORS: {
    origin: "*",
    methods: ["GET", "POST"]
  }
};