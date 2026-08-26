import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://localhost:5432/mapmate",
});

export const initDb = async () => {
  try {
    await pool.query(`CREATE EXTENSION IF NOT EXISTS postgis;`);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS places (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100),
        address TEXT,
        location GEOMETRY(Point, 4326) NOT NULL
      );
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS places_gix
      ON places USING GIST (location);
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS favourites (
        id SERIAL PRIMARY KEY,
        place_id INTEGER REFERENCES places(id),
        user_id INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("Database initialized successfully with PostGIS");
  } catch (err) {
    console.error("Error initializing database:", err);
  }
};

export default pool;
