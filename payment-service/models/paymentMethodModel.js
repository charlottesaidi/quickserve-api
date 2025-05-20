const pool = require('../config/database');
const logger = require('../utils/logger');

class PaymentMethodModel {
  async initializeTable() {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS payment_methods (
          id SERIAL PRIMARY KEY,
          client_id INTEGER NOT NULL,
          type VARCHAR(20) NOT NULL,
          last_digits VARCHAR(4),
          expiry_month INTEGER,
          expiry_year INTEGER,
          card_brand VARCHAR(20),
          stripe_payment_method_id VARCHAR(100),
          stripe_customer_id VARCHAR(100),
          is_default BOOLEAN DEFAULT false,
          auto_pay BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE INDEX IF NOT EXISTS idx_payment_methods_client ON payment_methods (client_id);
      `);
      logger.info('Table payment_methods initialisée');
      return true;
    } catch (error) {
      logger.error('Erreur lors de l\'initialisation de la table payment_methods:', error);
      throw error;
    }
  }

  async addPaymentMethod(paymentMethodData) {
    try {
      const {
        client_id,
        type,
        last_digits,
        expiry_month,
        expiry_year,
        card_brand,
        stripe_payment_method_id,
        stripe_customer_id,
        is_default,
        auto_pay,
      } = paymentMethodData;
      
      const result = await pool.query(
        `INSERT INTO payment_methods 
         (client_id, type, last_digits, expiry_month, expiry_year, card_brand, stripe_payment_method_id, stripe_customer_id, is_default, auto_pay)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING id`,
        [
          client_id,
          type,
          last_digits,
          expiry_month,
          expiry_year,
          card_brand,
          stripe_payment_method_id,
          stripe_customer_id,
          is_default,
          auto_pay,
        ],
      );
      
      return result.rows[0];
    } catch (error) {
      logger.error('Erreur lors de l\'ajout de la méthode de paiement:', error);
      throw error;
    }
  }

  async getPaymentMethods(clientId) {
    try {
      const result = await pool.query(
        'SELECT id, type, last_digits, expiry_month, expiry_year, card_brand, is_default, auto_pay, created_at FROM payment_methods WHERE client_id = $1 ORDER BY is_default DESC, created_at DESC',
        [clientId],
      );
      
      return result.rows;
    } catch (error) {
      logger.error('Erreur lors de la récupération des méthodes de paiement:', error);
      throw error;
    }
  }

  async getPaymentMethod(id, clientId) {
    try {
      const result = await pool.query(
        'SELECT * FROM payment_methods WHERE id = $1 AND client_id = $2',
        [id, clientId],
      );
      
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Erreur lors de la récupération de la méthode de paiement:', error);
      throw error;
    }
  }

  async getDefaultPaymentMethod(clientId) {
    try {
      const result = await pool.query(
        'SELECT * FROM payment_methods WHERE client_id = $1 AND is_default = true LIMIT 1',
        [clientId],
      );
      
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Erreur lors de la récupération de la méthode de paiement par défaut:', error);
      throw error;
    }
  }

  async setDefaultPaymentMethod(id, clientId) {
    try {
      // D'abord, définir toutes les méthodes de paiement comme non par défaut
      await pool.query(
        'UPDATE payment_methods SET is_default = false WHERE client_id = $1',
        [clientId],
      );
      
      // Ensuite, définir la méthode spécifiée comme par défaut
      const result = await pool.query(
        'UPDATE payment_methods SET is_default = true WHERE id = $1 AND client_id = $2 RETURNING *',
        [id, clientId],
      );
      
      if (result.rows.length === 0) {
        throw new Error('Méthode de paiement non trouvée');
      }
      
      return result.rows[0];
    } catch (error) {
      logger.error('Erreur lors de la définition de la méthode de paiement par défaut:', error);
      throw error;
    }
  }

  async deletePaymentMethod(id, clientId) {
    try {
      const result = await pool.query(
        'DELETE FROM payment_methods WHERE id = $1 AND client_id = $2 RETURNING *',
        [id, clientId],
      );
      
      if (result.rows.length === 0) {
        throw new Error('Méthode de paiement non trouvée');
      }
      
      return result.rows[0];
    } catch (error) {
      logger.error('Erreur lors de la suppression de la méthode de paiement:', error);
      throw error;
    }
  }

  async getStripeCustomerId(clientId) {
    try {
      const result = await pool.query(
        'SELECT stripe_customer_id FROM payment_methods WHERE client_id = $1 LIMIT 1',
        [clientId],
      );
      
      return result.rows.length > 0 ? result.rows[0].stripe_customer_id : null;
    } catch (error) {
      logger.error('Erreur lors de la récupération du Stripe Customer ID:', error);
      throw error;
    }
  }
}

module.exports = new PaymentMethodModel();