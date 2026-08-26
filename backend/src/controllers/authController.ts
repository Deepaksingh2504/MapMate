import { Request, Response, RequestHandler } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../db";
import { AuthRequest } from "../middleware/auth";

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-me";

// Register: accepts username + password, stores as name + email(unique) + hashed password
export const register: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ error: "Username and password are required" });
    return;
  }

  try {
    const checkUser = await pool.query("SELECT * FROM users WHERE email = $1", [username]);
    if (checkUser.rows.length > 0) {
      res.status(400).json({ error: "Username already taken" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email",
      [username, username, passwordHash]
    );

    const user = newUser.rows[0];
    const token = jwt.sign({ id: user.id, username: user.name }, JWT_SECRET, { expiresIn: "24h" });

    res.json({ token, user: { id: user.id, username: user.name } });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Server error during registration" });
  }
};

export const login: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ error: "Username and password are required" });
    return;
  }

  try {
    const userResult = await pool.query("SELECT * FROM users WHERE email = $1", [username]);
    if (userResult.rows.length === 0) {
      res.status(400).json({ error: "Invalid username or password" });
      return;
    }

    const user = userResult.rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      res.status(400).json({ error: "Invalid username or password" });
      return;
    }

    const token = jwt.sign({ id: user.id, username: user.name }, JWT_SECRET, { expiresIn: "24h" });
    res.json({ token, user: { id: user.id, username: user.name } });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error during login" });
  }
};

export const getMe: RequestHandler = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const userResult = await pool.query("SELECT id, name as username, created_at FROM users WHERE id = $1", [req.user.id]);
    if (userResult.rows.length === 0) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json(userResult.rows[0]);
  } catch (error) {
    console.error("GetMe error:", error);
    res.status(500).json({ error: "Server error" });
  }
};
