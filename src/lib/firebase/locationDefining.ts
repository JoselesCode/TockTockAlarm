export type geoUbicacion = {
  id?: string;
  name?: string;
  latitude: number;
  longitude: number;
  radius: number; 
};

// Formula Haversine (distancia entre 2 puntos en la Tierra)
function getDistanceInMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // radio de la Tierra en metros
  const toRad = (value: number) => (value * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export function isInsideGeofence(
  userLat: number,
  userLon: number,
  geoubicacion: geoUbicacion
): boolean {
  const distance = getDistanceInMeters(
    userLat,
    userLon,
    geoubicacion.latitude,
    geoubicacion.longitude
  );

  return distance <= geoubicacion.radius;
}
