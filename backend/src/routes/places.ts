import { Router, Request, Response, RequestHandler } from "express";
import pool from "../db";

const router = Router();

const searchHandler: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  const { q, lat, lon, radius = 5000 } = req.query;
  
  if (!lat || !lon) {
    res.status(400).json({ error: "lat and lon are required for radius search" });
    return;
  }
  
  try {
    let query = `
      SELECT id, name, category, address, 
             ST_Y(location::geometry) as lat, ST_X(location::geometry) as lon,
             ST_Distance(location::geography, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography) as distance
      FROM places
      WHERE ST_DWithin(location::geography, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography, $3)
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
    res.status(500).json({ error: "Failed to search places" });
  }
};

router.get("/search", searchHandler);

export default router;
