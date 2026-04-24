/**
 * Calcula la distancia en metros entre dos coordenadas.
 * @param {Object} pos1 {lat, lng}
 * @param {Object} pos2 {lat, lng}
 * @returns {number} Distancia en metros
 */
export function calculateDistance(pos1, pos2) {
  if (!pos1 || !pos2) return Infinity;
  
  const R = 6371e3; // Radio de la Tierra en metros
  const φ1 = (pos1.lat * Math.PI) / 180;
  const φ2 = (pos2.lat * Math.PI) / 180;
  const Δφ = ((pos2.lat - pos1.lat) * Math.PI) / 180;
  const Δλ = ((pos2.lng - pos1.lng) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export const COMPLETION_THRESHOLD_METERS = 100; // 100 metros de margen
