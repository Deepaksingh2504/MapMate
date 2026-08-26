import { Router, Response, RequestHandler } from "express";
import pool from "../db";
import { authenticateToken, AuthRequest } from "../middleware/auth";

const router = Router();

const getFavouritesHandler: RequestHandler = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const query = `
      SELECT f.id as fav_id, p.id, p.name, p.category, p.address,
             ST_Y(p.location::geometry) as lat, ST_X(p.location::geometry) as lon
      FROM favourites f
      JOIN places p ON f.place_id = p.id
      WHERE f.user_id = $1
      ORDER BY f.created_at DESC
    `;
    const result = await pool.query(query, [req.user?.id]);
    res.json(result.rows);
  } catch (error) {
    console.error("Fetch favourites error:", error);
    res.status(500).json({ error: "Failed to fetch favourites" });
  }
};

const saveFavouriteHandler: RequestHandler = async (req: AuthRequest, res: Response): Promise<void> => {
  const { place_id } = req.body;
  
  if (!place_id) {
    res.status(400).json({ error: "place_id is required" });
    return;
  }
  
  try {
    const checkQuery = `SELECT id FROM favourites WHERE place_id = $1 AND user_id = $2`;
    const checkResult = await pool.query(checkQuery, [place_id, req.user?.id]);
    
    if (checkResult.rows.length > 0) {
      res.json({ success: true, message: "Already in favourites", fav_id: checkResult.rows[0].id });
      return;
    }
    
    const query = `
      INSERT INTO favourites (place_id, user_id)
      VALUES ($1, $2)
      RETURNING id
    `;
    const result = await pool.query(query, [place_id, req.user?.id]);
    res.json({ success: true, fav_id: result.rows[0].id });
  } catch (error) {
    console.error("Save favourite error:", error);
    res.status(500).json({ error: "Failed to save favourite" });
  }
};

router.use(authenticateToken); // Protect all favourites routes
router.get("/", getFavouritesHandler);
router.post("/", saveFavouriteHandler);

export default router;
