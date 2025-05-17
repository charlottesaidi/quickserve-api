const pool = require('../config/database');
const logger = require('../utils/logger');

class PaymentModel {
  async initializeTable() {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS payments (
          id SERIAL PRIMARY KEY,
          service_id INTEGER NOT NULL,
          client_id INTEGER NOT NULL,
          amount DECIMAL(10, 2) NOT NULL,
          status VARCHAR(20) NOT NULL,
          payment_method VARCHAR(50),
          payment_intent_id VARCHAR(100),
          error_message TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          processed_at TIMESTAMP
        );
        
        CREATE INDEX IF NOT EXISTS idx_payments_service ON payments (service_id);
        CREATE INDEX IF NOT EXISTS idx_payments_client ON payments (client_id);
      `);
      logger.info('Table payments initialisée');
      return true;
    } catch (error) {
      logger.error('Erreur lors de l\'initialisation de la table payments:', error);
      throw error;
    }
  }

  async createPayment(serviceId, clientId, amount, status = 'pending') {
    try {
      const result = await pool.query(
        `INSERT INTO payments (service_id, client_id, amount, status)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [serviceId, clientId, amount, status]
      );
      
      return result.rows[0];
    } catch (error) {
      logger.error('Erreur lors de la création du paiement:', error);
      throw error;
    }
  }

  async updatePaymentIntent(paymentId, paymentIntentId) {
    try {
      const result = await pool.query(
        'UPDATE payments SET payment_intent_id = $1 WHERE id = $2 RETURNING *',
        [paymentIntentId, paymentId]
      );
      
      if (result.rows.length === 0) {
        throw new Error('Paiement non trouvé');
      }
      
      return result.rows[0];
    } catch (error) {
      logger.error('Erreur lors de la mise à jour de l\'intention de paiement:', error);
      throw error;
    }
  }

  async updatePaymentStatus(paymentId, status, errorMessage = null) {
    try {
      let query, params;
      
      if (status === 'completed') {
        query = 'UPDATE payments SET status = $1, processed_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *';
        params = [status, paymentId];
      } else if (status === 'failed') {
        query = 'UPDATE payments SET status = $1, error_message = $2 WHERE id = $3 RETURNING *';
        params = [status, errorMessage, paymentId];
      } else {
        query = 'UPDATE payments SET status = $1 WHERE id = $2 RETURNING *';
        params = [status, paymentId];
      }
      
      const result = await pool.query(query, params);
      
      if (result.rows.length === 0) {
        throw new Error('Paiement non trouvé');
      }
      
      return result.rows[0];
    } catch (error) {
      logger.error('Erreur lors de la mise à jour du statut du paiement:', error);
      throw error;
    }
  }

  async findByPaymentIntentId(paymentIntentId) {
    try {
      const result = await pool.query(
        'SELECT * FROM payments WHERE payment_intent_id = $1',
        [paymentIntentId]
      );
      
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Erreur lors de la recherche du paiement par paymentIntentId:', error);
      throw error;
    }
  }

  async findByServiceId(serviceId) {
    try {
      const result = await pool.query(
        'SELECT * FROM payments WHERE service_id = $1',
        [serviceId]
      );
      
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Erreur lors de la recherche du paiement par serviceId:', error);
      throw error;
    }
  }

  async getPaymentHistory(clientId) {
    try {
      const result = await pool.query(`
        SELECT p.*
        FROM payments p
        WHERE p.client_id = $1
        ORDER BY p.created_at DESC
      `, [clientId]);
      
      return result.rows;
    } catch (error) {
      logger.error('Erreur lors de la récupération de l\'historique des paiements:', error);
      throw error;
    }
  }
}

module.exports = new PaymentModel();