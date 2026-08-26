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
    const categoryName = String(category).toLowerCase();

    const tag =
      OSM_TAGS[categoryName] || `amenity=${categoryName}`;

    const [tagKey, tagValue] = tag.split("=");

    const latitude = Number(lat);
    const longitude = Number(lon);
    const searchRadius = Number(radius);

    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      !Number.isFinite(searchRadius)
    ) {
      res.status(400).json({
        error: "Invalid latitude, longitude or radius",
      });
      return;
    }

    const query = `
      [out:json][timeout:25];
      (
        node["${tagKey}"="${tagValue}"](around:${searchRadius},${latitude},${longitude});
        way["${tagKey}"="${tagValue}"](around:${searchRadius},${latitude},${longitude});
        relation["${tagKey}"="${tagValue}"](around:${searchRadius},${latitude},${longitude});
      );
      out center;
    `;

    const encodedQuery = encodeURIComponent(query);

    // Try the main Overpass server first.
    // If it fails, try a second public Overpass server.
    const overpassServers = [
      `https://overpass-api.de/api/interpreter?data=${encodedQuery}`,
      `https://overpass.kumi.systems/api/interpreter?data=${encodedQuery}`,
    ];

    let data: any = null;
    let lastError = "";

    for (const url of overpassServers) {
      try {
        console.log(`Trying Overpass server: ${url.split("?")[0]}`);

        const response = await fetch(url, {
          method: "GET",
          headers: {
            Accept: "application/json",
            "User-Agent": "MapMate/1.0",
          },
        });

        if (!response.ok) {
          const errorText = await response.text();

          console.error(
            `Overpass server returned ${response.status}:`,
            errorText.slice(0, 500)
          );

          lastError = `Overpass returned ${response.status}`;
          continue;
        }

        data = await response.json();

        console.log(
          `Overpass success: ${data.elements?.length || 0} elements`
        );

        break;
      } catch (error) {
        console.error("Overpass server request failed:", error);
        lastError = "Overpass request failed";
      }
    }

    if (!data) {
      res.status(502).json({
        error: "Unable to contact OpenStreetMap nearby places service",
        details: lastError,
      });
      return;
    }

    const places = (data.elements || [])
      .map((el: any) => {
        const elLat = el.lat ?? el.center?.lat;
        const elLon = el.lon ?? el.center?.lon;

        return {
          id: el.id,
          lat: elLat,
          lon: elLon,
          display_name:
            el.tags?.name || `${category} (Unknown Name)`,
          name:
            el.tags?.name || `${category}`,
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
      .filter(
        (place: any) =>
          place.lat != null &&
          place.lon != null
      );

    res.json(places);
  } catch (error) {
    console.error("Nearby places error:", error);

    res.status(500).json({
      error: "Failed to fetch nearby places",
    });
  }
};

router.get("/nearby", nearbyHandler);

export default router;