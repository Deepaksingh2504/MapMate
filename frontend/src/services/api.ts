const API_BASE = "https://mapmate-knjo.onrender.com";

// ── Places ──────────────────────────────────────────────────────────────────

export async function fetchCustomPlaces(query: string, lat: number, lon: number, radius = 5000) {
  try {
    const url = new URL(`${API_BASE}/api/places/search`);
    if (query) url.searchParams.append("q", query);
    url.searchParams.append("lat", lat.toString());
    url.searchParams.append("lon", lon.toString());
    url.searchParams.append("radius", radius.toString());

    const response = await fetch(url.toString());
    if (!response.ok) throw new Error("Failed to fetch custom places");
    return await response.json();
  } catch (err) {
    console.error(err);
    return [];
  }
}

const OSM_TAGS: Record<string, string> = {
  hotel: "tourism=hotel",
  restaurant: "amenity=restaurant",
  cafe: "amenity=cafe",
  hospital: "amenity=hospital",
  atm: "amenity=atm",
  fuel: "amenity=fuel",
  pharmacy: "amenity=pharmacy",
  school: "amenity=school",
  university: "amenity=university",
  supermarket: "shop=supermarket",
  park: "leisure=park"
};

export async function getNearbyPlacesFromOverpass(
  category: string,
  lat: number,
  lon: number,
  radius = 5000
) {
  try {
    const url = new URL(`${API_BASE}/api/places/nearby`);

    url.searchParams.append("category", category);
    url.searchParams.append("lat", lat.toString());
    url.searchParams.append("lon", lon.toString());
    url.searchParams.append("radius", radius.toString());

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error("Failed to fetch nearby places");
    }

    return await response.json();
  } catch (err) {
    console.error("Nearby places API Error:", err);
    return [];
  }
}

/** Search Nominatim for global places. Returns Place-shaped results. */
export async function searchNominatim(query: string, limit = 10) {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=${limit}`;
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    const data = await res.json();
    return data.map((r: any, idx: number) => ({
      id: -idx - 1,
      lat: r.lat,
      lon: r.lon,
      display_name: r.display_name,
      name: r.display_name.split(",")[0],
      address: r.display_name,
    }));
  } catch (err) {
    console.error(err);
    return [];
  }
}

// ── Routing ─────────────────────────────────────────────────────────────────

export type RouteResult = {
  coordinates: [number, number][];
  distance: number;
  duration: number;
} | null;

export type RouteResponse = {
  route: RouteResult;
  error: string | null;
};

export async function calculateRoute(
  start: { lat: number; lon: number },
  end: { lat: number; lon: number }
): Promise<RouteResponse> {
  try {
    const url = new URL(`${API_BASE}/api/route`);
    url.searchParams.append("start_lat", start.lat.toString());
    url.searchParams.append("start_lon", start.lon.toString());
    url.searchParams.append("end_lat", end.lat.toString());
    url.searchParams.append("end_lon", end.lon.toString());

    const response = await fetch(url.toString());
    const data = await response.json();

    if (!response.ok || data.error) {
      const errorMsg = data.error === "Failed to calculate route"
        ? "MapMate couldn't find a drivable route between these locations."
        : (data.error || "Failed to calculate route");
      return { route: null, error: errorMsg };
    }

    if (!data.coordinates || data.coordinates.length === 0) {
      return { route: null, error: "No drivable route found between these locations." };
    }

    return { route: data, error: null };
  } catch (err) {
    console.error(err);
    return { route: null, error: "MapMate couldn't connect to the routing service. Please try again." };
  }
}

// ── Favourites ──────────────────────────────────────────────────────────────

export async function saveFavourite(placeId: number, token: string) {
  try {
    const response = await fetch(`${API_BASE}/api/favourites`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ place_id: placeId }),
    });
    return await response.json();
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function fetchFavourites(token: string) {
  try {
    const response = await fetch(`${API_BASE}/api/favourites`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return await response.json();
  } catch (err) {
    console.error(err);
    return [];
  }
}

// ── Auth ────────────────────────────────────────────────────────────────────

export async function loginUser(credentials: any) {
  const response = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  return await response.json();
}

export async function registerUser(credentials: any) {
  const response = await fetch(`${API_BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  return await response.json();
}

export async function getMe(token: string) {
  const response = await fetch(`${API_BASE}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return await response.json();
}
