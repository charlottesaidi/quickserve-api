class PaymentUtils {
  /**
   * Formatte un montant en centimes pour l'affichage
   * @param {number} amountInCents - Montant en centimes
   * @returns {string} - Montant formaté (ex: "10,50 €")
   */
  static formatAmountFromCents(amountInCents) {
    const amount = amountInCents / 100;
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
  }

  /**
   * Convertit un montant en euros en centimes
   * @param {number} amountInEuros - Montant en euros
   * @returns {number} - Montant en centimes
   */
  static convertEurosToCents(amountInEuros) {
    return Math.round(amountInEuros * 100);
  }

  /**
   * Vérifie si une chaîne est un ID Stripe valide
   * @param {string} id - ID à vérifier
   * @param {string} prefix - Préfixe attendu (ex: 'pi_' pour PaymentIntent)
   * @returns {boolean} - true si l'ID est valide
   */
  static isValidStripeId(id, prefix) {
    if (!id || typeof id !== 'string') {
      return false;
    }
    
    return id.startsWith(prefix) && id.length > prefix.length + 10;
  }

  /**
   * Retourne une description lisible pour un statut de paiement
   * @param {string} status - Statut de paiement
   * @returns {string} - Description du statut
   */
  static getPaymentStatusDescription(status) {
    const statusDescriptions = {
      'pending': 'En attente',
      'completed': 'Payé',
      'failed': 'Échoué',
      'cancelled': 'Annulé'
    };
    
    return statusDescriptions[status] || status;
  }
}

module.exports = PaymentUtils;