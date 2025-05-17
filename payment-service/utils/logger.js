const { NODE_ENV } = require('../config/env');

class Logger {
  static info(message) {
    if (NODE_ENV !== 'test') {
      console.log(`[INFO] ${new Date().toISOString()} - ${message}`);
    }
  }
  
  static error(message, error) {
    if (NODE_ENV !== 'test') {
      console.error(`[ERROR] ${new Date().toISOString()} - ${message}`);
      if (error) {
        console.error(error);
      }
    }
  }
  
  static warn(message) {
    if (NODE_ENV !== 'test') {
      console.warn(`[WARN] ${new Date().toISOString()} - ${message}`);
    }
  }
  
  static debug(message) {
    if (NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${new Date().toISOString()} - ${message}`);
    }
  }
}

module.exports = Logger;