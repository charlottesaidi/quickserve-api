const { pool } = require('../config/database');
const { publishEvent } = require('../config/rabbitmq');
const logger = require('../utils/logger');

// Modèle pour les prestations de services
class ServiceModel {
  // Créer une nouvelle prestation
  async createService(serviceData) {
    try {
      const { 
        client_id, 
        category_id, 
        title, 
        address,
        payment_status,
        scheduled_at,
      } = serviceData;
      
      const result = await pool.query(
        `INSERT INTO services 
         (client_id, category_id, title, address, status, payment_status, scheduled_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          client_id,
          category_id,
          title,
          address,
          'pending',
          payment_status,
          scheduled_at ? new Date(scheduled_at) : null,
        ],
      );
      
      const service = result.rows[0];
      
      // Publier l'événement service créé
      publishEvent('service-events', {
        type: 'SERVICE_CREATED',
        data: { 
          service_id: service.id,
          client_id: service.client_id,
          category_id: service.category_id,
        },
      });
      
      return service;
    } catch (error) {
      logger.error('Erreur lors de la création de la prestation:', error);
      throw error;
    }
  }

  // Récupérer les prestations d'un client avec filtrage optionnel par statut
  async getClientServices(clientId, status = null) {
    try {
      let query = `
        SELECT s.*, c.name as category_name
        FROM services s
        JOIN service_categories c ON s.category_id = c.id
        WHERE s.client_id = $1
      `;
      
      const queryParams = [clientId];
      
      if (status) {
        query += ' AND s.status = $2';
        queryParams.push(status);
      }
      
      query += ' ORDER BY s.created_at DESC';
      
      const result = await pool.query(query, queryParams);
      return result.rows;
    } catch (error) {
      logger.error(`Erreur lors de la récupération des prestations du client #${clientId}:`, error);
      throw error;
    }
  }

  // Récupérer les prestations d'un prestataire avec filtrage optionnel par statut
  async getProviderServices(providerId, status = null) {
    try {
      let query = `
        SELECT s.*, c.name as category_name
        FROM services s
        JOIN service_categories c ON s.category_id = c.id
        WHERE s.provider_id = $1
      `;
      
      const queryParams = [providerId];
      
      if (status) {
        query += ' AND s.status = $2';
        queryParams.push(status);
      }
      
      query += ' ORDER BY s.created_at DESC';
      
      const result = await pool.query(query, queryParams);
      return result.rows;
    } catch (error) {
      logger.error(`Erreur lors de la récupération des prestations du prestataire #${providerId}:`, error);
      throw error;
    }
  }

  // Récupérer les prestations disponibles
  async getAvailableServices() {
    try {
      const result = await pool.query(`
        SELECT s.*, c.name as category_name
        FROM services s
        JOIN service_categories c ON s.category_id = c.id
        WHERE s.status = 'pending' AND s.provider_id IS NULL
        ORDER BY s.created_at DESC
      `);
      return result.rows;
    } catch (error) {
      logger.error('Erreur lors de la récupération des prestations disponibles:', error);
      throw error;
    }
  }

  // Récupérer le détail d'une prestation par son ID
  async getServiceById(serviceId) {
    try {
      const result = await pool.query(`
        SELECT s.*, c.name as category_name, c.description as category_description
        FROM services s
        JOIN service_categories c ON s.category_id = c.id
        WHERE s.id = $1
      `, [serviceId]);
      
      return result.rows[0];
    } catch (error) {
      logger.error(`Erreur lors de la récupération de la prestation #${serviceId}:`, error);
      throw error;
    }
  }

  // Accepter une prestation (prestataire)
  async acceptService(serviceId, providerId) {
    try {
      // Vérifier si la prestation est disponible
      const checkResult = await pool.query(
        'SELECT * FROM services WHERE id = $1 AND status = $2 AND provider_id IS NULL',
        [serviceId, 'pending'],
      );
      
      if (checkResult.rows.length === 0) {
        throw new Error('Prestation non disponible');
      }
      
      // Affecter la prestation au prestataire
      const updateResult = await pool.query(
        'UPDATE services SET provider_id = $1, status = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
        [providerId, 'assigned', serviceId],
      );
      
      const service = updateResult.rows[0];
      
      // Publier l'événement prestation affectée
      publishEvent('service-events', {
        type: 'SERVICE_ASSIGNED',
        data: { 
          service_id: service.id,
          client_id: service.client_id,
          provider_id: service.provider_id,
        },
      });
      
      return service;
    } catch (error) {
      logger.error(`Erreur lors de l'acceptation de la prestation #${serviceId}:`, error);
      throw error;
    }
  }

  // Démarrer une prestation
  async startService(serviceId, providerId) {
    try {
      // Vérifier que l'utilisateur est le prestataire affecté
      const checkResult = await pool.query(
        'SELECT * FROM services WHERE id = $1 AND provider_id = $2 AND status = $3',
        [serviceId, providerId, 'assigned'],
      );
      
      if (checkResult.rows.length === 0) {
        throw new Error('Accès non autorisé ou prestation non assignée');
      }
      
      // Mettre à jour le statut de la prestation
      const updateResult = await pool.query(
        'UPDATE services SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
        ['in_progress', serviceId],
      );
      
      const service = updateResult.rows[0];
      
      // Publier l'événement prestation démarrée
      publishEvent('service-events', {
        type: 'SERVICE_STARTED',
        data: { 
          service_id: service.id,
          client_id: service.client_id,
          provider_id: service.provider_id,
        },
      });
      
      return service;
    } catch (error) {
      logger.error(`Erreur lors du démarrage de la prestation #${serviceId}:`, error);
      throw error;
    }
  }

  // Terminer une prestation
  async completeService(serviceId, providerId) {
    try {
      // Vérifier que l'utilisateur est le prestataire affecté
      const checkResult = await pool.query(
        'SELECT * FROM services WHERE id = $1 AND provider_id = $2 AND status = $3',
        [serviceId, providerId, 'in_progress'],
      );
      
      if (checkResult.rows.length === 0) {
        throw new Error('Accès non autorisé ou prestation pas en cours');
      }
      
      // Mettre à jour le statut de la prestation
      const updateResult = await pool.query(
        'UPDATE services SET status = $1, completed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
        ['completed', serviceId],
      );
      
      const service = updateResult.rows[0];
      
      // Publier l'événement prestation terminée
      publishEvent('service-events', {
        type: 'SERVICE_COMPLETED',
        data: { 
          service_id: service.id,
          client_id: service.client_id,
          provider_id: service.provider_id,
          amount: service.payment_amount,
        },
      });
      
      return service;
    } catch (error) {
      logger.error(`Erreur lors de la finalisation de la prestation #${serviceId}:`, error);
      throw error;
    }
  }

  // Annuler une prestation
  async cancelService(serviceId, userId, reason) {
    try {
      // Vérifier que l'utilisateur est le client ou le prestataire
      const checkResult = await pool.query(
        'SELECT * FROM services WHERE id = $1 AND (client_id = $2 OR provider_id = $2)',
        [serviceId, userId],
      );
      
      if (checkResult.rows.length === 0) {
        throw new Error('Accès non autorisé');
      }
      
      const service = checkResult.rows[0];
      
      // Vérifier si la prestation peut être annulée
      if (service.status === 'completed' || service.status === 'cancelled') {
        throw new Error('Cette prestation ne peut pas être annulée');
      }
      
      // Mettre à jour le statut de la prestation
      const updateResult = await pool.query(
        'UPDATE services SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
        ['cancelled', serviceId],
      );
      
      const updatedService = updateResult.rows[0];
      
      // Publier l'événement prestation annulée
      publishEvent('service-events', {
        type: 'SERVICE_CANCELLED',
        data: { 
          service_id: updatedService.id,
          client_id: updatedService.client_id,
          provider_id: updatedService.provider_id,
          cancelled_by: userId,
          reason,
        },
      });
      
      return updatedService;
    } catch (error) {
      logger.error(`Erreur lors de l'annulation de la prestation #${serviceId}:`, error);
      throw error;
    }
  }

  // Mettre à jour le statut de paiement
  async updatePaymentStatus(serviceId, status) {
    try {
      const result = await pool.query(
        'UPDATE services SET payment_status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
        [status, serviceId],
      );
      return result.rows[0];
    } catch (error) {
      logger.error(`Erreur lors de la mise à jour du statut de paiement pour la prestation #${serviceId}:`, error);
      throw error;
    }
  }
}

module.exports = new ServiceModel();