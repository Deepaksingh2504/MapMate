# MapMate

MapMate is a modern, full-stack navigation web application that provides real-time location tracking, geolocation search, and dynamic road routing. 

## Features

- **Live Location Tracking**: Automatically detects and follows your current location using the HTML5 Geolocation API.
- **Search System**: Search for specific places or nearby categories (e.g. "Hospitals near me") using an integrated PostGIS spatial database.
- **Road Routing**: Calculates actual road paths (via OpenRouteService) and estimates travel time and distance.
- **Deviation Detection & Recalculation**: Continuously monitors your GPS position against the active route. If you deviate more than 50 meters, MapMate automatically recalculates the route.
- **Favorites & Authentication**: Secure user authentication (JWT + Bcrypt) allowing you to save favorite locations to your personal account.
- **Dijkstra's Algorithm Demo**: Includes an educational implementation of shortest-path graph routing in the backend (`src/routing/dijkstra.ts`).

## Architecture & Technology Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Leaflet (`react-leaflet`), React Router.
- **Backend**: Node.js, Express, TypeScript.
- **Database**: PostgreSQL with **PostGIS** extension for geospatial queries.

### Deviation Detection Logic
MapMate uses Haversine distance formulas to compare the user's current GPS coordinates with the nearest segment of the route polyline. A spatial threshold (50 meters) determines if the user is "off-route", triggering an automatic re-fetch of the path to the destination.

---

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- PostgreSQL (with PostGIS extension installed and enabled)

### Environment Variables
Create a `.env` file in the `backend/` directory based on `.env.example`:
```env
PORT=3001
DATABASE_URL=postgresql://localhost:5432/mapmate
JWT_SECRET=your_super_secret_jwt_key_here
OPENROUTESERVICE_API_KEY=your_ors_key_here
FRONTEND_URL=http://localhost:5173
```

### Database Setup
1. Ensure PostgreSQL is running.
2. Create the database: `createdb mapmate`
3. Enable PostGIS: `psql -d mapmate -c "CREATE EXTENSION postgis;"`

### Installation & Execution

#### 1. Backend
```bash
cd backend
npm install
# Seed the database with sample locations
npm run seed
# Start the backend server
npm run dev
```

#### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173` to start navigating!
