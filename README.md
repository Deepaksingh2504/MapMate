# MapMate

MapMate is a modern, full-stack navigation web application that provides real-time location tracking, geolocation search, and dynamic road routing. 

# MapMate Live :
map-mate-6e24-git-main-deepaksingh2504.vercel.app

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
