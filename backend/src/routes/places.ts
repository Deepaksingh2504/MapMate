import { Router, Request, Response, RequestHandler } from "express";
import pool from "../db";

const router = Router();

// ── Search places from our database ─────────────────────────────────────────

const searchHandler: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { q, lat, lon, radius = 5000 } = req.query;

  if (!lat || !lon) {
    res.status(400).json({
      error: "lat and lon are required for radius search",
    });
    return;
  }

  try {
    let query = `
      SELECT id, name, category, address, 
             ST_Y(location::geometry) as lat,
             ST_X(location::geometry) as lon,
             ST_Distance(
               location::geography,
               ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
             ) as distance
      FROM places
      WHERE ST_DWithin(
        location::geography,
        ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
        $3
      )
    `;

    const queryParams: any[] = [lon, lat, radius];

    if (q) {
      query += ` AND (name ILIKE $4 OR category ILIKE $4)`;
      queryParams.push(`%${q}%`);
    }

    query += ` ORDER BY distance ASC LIMIT 50`;

    const result = await pool.query(query, queryParams);

    res.json(result.rows);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({
      error: "Failed to search places",
    });
  }
};

router.get("/search", searchHandler);

// ── Nearby places from OpenStreetMap Overpass ───────────────────────────────

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
  park: "leisure=park",
};

const nearbyHandler: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { category, lat, lon, radius = 5000 } = req.query;

  if (!category || !lat || !lon) {
    res.status(400).json({
      error: "category, lat and lon are required",
    });
    return;
  }

  try {
    const tag =
      OSM_TAGS[String(category).toLowerCase()] ||
      `amenity=${String(category).toLowerCase()}`;

    const [tagKey, tagValue] = tag.split("=");

    const query = `
      [out:json][timeout:25];
      (
        node["${tagKey}"="${tagValue}"](around:${radius},${lat},${lon});
        way["${tagKey}"="${tagValue}"](around:${radius},${lat},${lon});
        relation["${tagKey}"="${tagValue}"](around:${radius},${lat},${lon});
      );
      out center;
    `;

    const response = await fetch(
      "https://overpass-api.de/api/interpreter",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
          "User-Agent": "MapMate/1.0",
        },
        body: `data=${encodeURIComponent(query)}`,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();

      console.error(
        "Overpass error:",
        response.status,
        errorText
      );

      res.status(502).json({
        error: "Overpass API request failed",
      });
      return;
    }

    const data = await response.json();

    const places = data.elements
      .map((el: any) => {
        const elLat = el.lat ?? el.center?.lat;
        const elLon = el.lon ?? el.center?.lon;

        return {
          id: el.id,
          lat: elLat,
          lon: elLon,
          display_name:
            el.tags?.name || `${category} (Unknown Name)`,
          name: el.tags?.name || `${category}`,
          category: String(category),
          address:
            [
              el.tags?.["addr:street"],
              el.tags?.["addr:city"],
            ]
              .filter(Boolean)
              .join(", ") || "No address provided",
        };
      })
      .filter((place: any) => place.lat != null && place.lon != null);

    res.json(places);
  } catch (error) {
    console.error("Overpass request error:", error);

    res.status(500).json({
      error: "Failed to fetch nearby places",
    });
  }
};

router.get("/nearby", nearbyHandler);

export default router;