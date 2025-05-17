class GeoUtils {
  /**
   * Calcule la distance en kilomètres entre deux points sur la Terre
   * en utilisant la formule haversine
   * @param {number} lat1 - Latitude du premier point
   * @param {number} lon1 - Longitude du premier point
   * @param {number} lat2 - Latitude du deuxième point
   * @param {number} lon2 - Longitude du deuxième point
   * @returns {number} - Distance en kilomètres
   */
  static calculateDistance(lat1, lon1, lat2, lon2) {
    if ([lat1, lon1, lat2, lon2].some(coord => typeof coord !== 'number')) {
      throw new Error('Tous les paramètres doivent être des nombres');
    }
    
    const R = 6371; // Rayon de la Terre en km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    return distance;
  }

 /**
   * Convertit des degrés en radians
   * @param {number} degrees - Angle en degrés
   * @returns {number} - Angle en radians
   */
  static toRad(degrees) {
    return degrees * Math.PI / 180;
  }

  /**
   * Vérifie si des coordonnées sont valides
   * @param {number} latitude - Latitude à vérifier
   * @param {number} longitude - Longitude à vérifier
   * @returns {boolean} - true si les coordonnées sont valides, false sinon
   */
  static isValidCoordinates(latitude, longitude) {
    return !isNaN(latitude) && !isNaN(longitude) && 
           latitude >= -90 && latitude <= 90 && 
           longitude >= -180 && longitude <= 180;
  }

  /**
   * Calcule un point à une certaine distance d'un point de référence
   * Utile pour des tests ou pour définir des zones
   * @param {number} latitude - Latitude du point de référence
   * @param {number} longitude - Longitude du point de référence
   * @param {number} distance - Distance en km
   * @param {number} bearing - Direction en degrés (0 = Nord, 90 = Est, etc.)
   * @returns {Object} - Objet contenant la latitude et longitude du nouveau point
   */
  static calculatePointAtDistance(latitude, longitude, distance, bearing) {
    const R = 6371; // Rayon de la Terre en km
    const brng = this.toRad(bearing);
    const lat1 = this.toRad(latitude);
    const lon1 = this.toRad(longitude);
    
    const lat2 = Math.asin(
      Math.sin(lat1) * Math.cos(distance/R) + 
      Math.cos(lat1) * Math.sin(distance/R) * Math.cos(brng)
    );
    
    const lon2 = lon1 + Math.atan2(
      Math.sin(brng) * Math.sin(distance/R) * Math.cos(lat1),
      Math.cos(distance/R) - Math.sin(lat1) * Math.sin(lat2)
    );
    
    // Convertir en degrés
    const latDeg = lat2 * 180 / Math.PI;
    const lonDeg = lon2 * 180 / Math.PI;
    
    return { latitude: latDeg, longitude: lonDeg };
  }
}

module.exports = GeoUtils;