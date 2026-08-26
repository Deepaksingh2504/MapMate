import { Router, Request, Response, RequestHandler } from "express";
import axios from "axios";

const router = Router();

const routingHandler: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  const { start_lat, start_lon, end_lat, end_lon } = req.query;

  if (!start_lat || !start_lon || !end_lat || !end_lon) {
    res.status(400).json({ error: "Missing origin or destination coordinates" });
    return;
  }

  const ORS_API_KEY = process.env.ORS_API_KEY;

  try {
    if (ORS_API_KEY) {
      // Use OpenRouteService
      const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${ORS_API_KEY}&start=${start_lon},${start_lat}&end=${end_lon},${end_lat}`;
      const response = await axios.get(url);
      const data = response.data.features[0];
      
      const coordinates = data.geometry.coordinates.map((coord: number[]) => [coord[1], coord[0]]); // Swap to [lat, lon] for leaflet
      const distance = data.properties.segments[0].distance; // in meters
      const duration = data.properties.segments[0].duration; // in seconds

      res.json({ coordinates, distance, duration });
    } else {
      // Fallback to OSRM public API if no ORS key provided
      console.log("No ORS_API_KEY found. Falling back to public OSRM API.");
      const url = `http://router.project-osrm.org/route/v1/driving/${start_lon},${start_lat};${end_lon},${end_lat}?overview=full&geometries=geojson`;
      const response = await axios.get(url);
      const route = response.data.routes[0];
      
      const coordinates = route.geometry.coordinates.map((coord: number[]) => [coord[1], coord[0]]);
      const distance = route.distance;
      const duration = route.duration;

      res.json({ coordinates, distance, duration });
    }
  } catch (error) {
    console.error("Routing error:", error);
    res.status(500).json({ error: "Failed to calculate route" });
  }
};

router.get("/", routingHandler);

export default router;
