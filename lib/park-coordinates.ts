export type ParkCoordinates = {
  latitude: number;
  longitude: number;
};

const PARK_COORDINATES: Record<string, ParkCoordinates> = {
  yellowstonenationalpark: { latitude: 44.428, longitude: -110.5885 },
  yosemitenationalpark: { latitude: 37.8651, longitude: -119.5383 },
  grandcanyonnationalpark: { latitude: 36.1069, longitude: -112.1129 },
  zionnationalpark: { latitude: 37.2982, longitude: -113.0263 },
  joshuatreenationalpark: { latitude: 33.8734, longitude: -115.901 },
  badlandsnationalpark: { latitude: 43.8554, longitude: -102.3397 },
  glaciernationalpark: { latitude: 48.6967, longitude: -113.7183 },
  grandtetonnationalpark: { latitude: 43.7904, longitude: -110.6818 },
  brycecanyonnationalpark: { latitude: 37.593, longitude: -112.1871 },
  rockymountainnationalpark: { latitude: 40.3428, longitude: -105.6836 },
  sequoianationalpark: { latitude: 36.4864, longitude: -118.5658 },
  acadianationalpark: { latitude: 44.3386, longitude: -68.2733 },
};

const normalize = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]/g, "");

export function getParkCoordinates(parkName: string): ParkCoordinates | null {
  const normalized = normalize(parkName);

  if (!normalized) return null;

  const exact = PARK_COORDINATES[normalized];
  if (exact) return exact;

  for (const [key, coordinates] of Object.entries(PARK_COORDINATES)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return coordinates;
    }
  }

  return null;
}