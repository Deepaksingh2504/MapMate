import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { initDb } from "./db";

import placeRoutes from "./routes/places";
import routeRoutes from "./routes/routing";
import favouriteRoutes from "./routes/favourites";
import authRoutes from "./routes/auth";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/places", placeRoutes);
app.use("/api/route", routeRoutes);
app.use("/api/favourites", favouriteRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, async () => {
  await initDb();
  console.log(`Server is running on port ${PORT}`);
});
