import { useState, useEffect } from "react";

export type UserLocation = {
  lat: number;
  lon: number;
  accuracy: number;
  heading: number | null;
  speed: number | null;
  timestamp: number;
};

// We use a module-level variable to cache the location across re-renders
// so it's instantly available if the hook is re-mounted.
let cachedLocation: UserLocation | null = null;
let watcherId: number | null = null;
let activeListeners = 0;

export function useUserLocation() {
  const [location, setLocation] = useState<UserLocation | null>(cachedLocation);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(!cachedLocation);

  useEffect(() => {
    activeListeners++;
    
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setIsLoading(false);
      return;
    }

    if (watcherId === null) {
      watcherId = navigator.geolocation.watchPosition(
        (pos) => {
          const newLoc = {
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            heading: pos.coords.heading,
            speed: pos.coords.speed,
            timestamp: pos.timestamp,
          };
          cachedLocation = newLoc;
          setLocation(newLoc);
          setIsLoading(false);
          setError(null);
        },
        (err) => {
          setError(err.message);
          setIsLoading(false);
        },
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
      );
    } else if (cachedLocation) {
      // Instantly set if already cached
      setLocation(cachedLocation);
      setIsLoading(false);
    }

    return () => {
      activeListeners--;
      if (activeListeners === 0 && watcherId !== null) {
        navigator.geolocation.clearWatch(watcherId);
        watcherId = null;
      }
    };
  }, []);

  return { location, error, isLoading };
}
