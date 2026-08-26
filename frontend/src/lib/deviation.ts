export function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLon = (lon2 - lon1) * rad;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * rad) * Math.cos(lat2 * rad) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function checkDeviation(
  currentPos: { lat: number, lon: number }, 
  routeLine: [number, number][], 
  thresholdMeters = 50
): boolean {
  if (!routeLine || routeLine.length === 0) return false;
  
  let minDistance = Infinity;
  
  for (let i = 0; i < routeLine.length; i++) {
    const dist = getDistance(currentPos.lat, currentPos.lon, routeLine[i][0], routeLine[i][1]);
    if (dist < minDistance) {
      minDistance = dist;
    }
  }
  
  return minDistance > thresholdMeters;
}
