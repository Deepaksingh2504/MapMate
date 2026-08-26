import { useState, useEffect } from "react";
import MainLayout from "../components/layout/MainLayout";
import MapView from "../components/map/MapView";
import SearchBox from "../components/map/SearchBox";
import { calculateRoute, saveFavourite, fetchCustomPlaces, fetchFavourites, searchNominatim, getNearbyPlacesFromOverpass } from "../services/api";
import DirectionsPanel from "../components/map/DirectionsPanel";
import CategoryResultsPanel from "../components/map/CategoryResultsPanel";
import PlaceCard from "../components/map/PlaceCard";
import Drawer from "../components/layout/Drawer";
import { checkDeviation } from "../lib/deviation";
import type { Place, RouteData } from "../types";
import { useAuth } from "../lib/AuthContext";
import { useUserLocation } from "../hooks/useUserLocation";
import { useNavigate } from "react-router-dom";

export type { Place, RouteData };

export default function Home() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const { location: userPos } = useUserLocation();

  // Core UI state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDirectionsOpen, setIsDirectionsOpen] = useState(false);
  const [focusSearchHistory, setFocusSearchHistory] = useState(false); // Trigger searchbox history

  // Map markers state
  const [places, setPlaces] = useState<Place[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  
  // Category search state
  const [categoryName, setCategoryName] = useState<string | null>(null);

  // Route state
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [sourcePlace, setSourcePlace] = useState<Place | null>(null);
  const [destinationPlace, setDestinationPlace] = useState<Place | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  // Favorites & History state
  const [favorites, setFavorites] = useState<Place[]>([]);
  const [history, setHistory] = useState<Place[]>([]);
  
  // Rerouting cooldown
  const [lastReroute, setLastReroute] = useState<number>(0);

  // Load favorites & history on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem("mapmate_history");
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
    
    if (token) {
      fetchFavourites(token).then(data => {
        if (data && !data.error && Array.isArray(data)) {
          setFavorites(data.map((f: any) => ({
            id: f.id,
            lat: f.lat,
            lon: f.lon,
            name: f.name,
            display_name: f.name,
            address: f.address,
            category: f.category
          })));
        }
      });
    } else {
      setFavorites([]);
    }
  }, [token]);

  const addToHistory = (place: Place) => {
    setHistory(prev => {
      const newHistory = [place, ...prev.filter(h => h.display_name !== place.display_name)].slice(0, 15); // store up to 15
      localStorage.setItem("mapmate_history", JSON.stringify(newHistory));
      return newHistory;
    });
  };

  // Deviation detection and arrival check during navigation
  useEffect(() => {
    if (!isNavigating || !userPos || !routeData) return;

    const now = Date.now();
    const coords = routeData.coordinates;

    // Arrival Detection: check distance to last coordinate
    const destCoord = coords[coords.length - 1];
    const atDest = !checkDeviation(userPos, [destCoord], 40);
    if (atDest) {
      alert("🎉 You've arrived at your destination!");
      handleStopNav();
      return;
    }

    // Route Deviation: only reroute once every 8 seconds
    const deviated = checkDeviation(userPos, coords, 50);
    if (deviated && destinationPlace && now - lastReroute > 8000) {
      setLastReroute(now);
      console.log("Off-route! Recalculating...");
      calculateRoute(
        { lat: userPos.lat, lon: userPos.lon },
        { lat: Number(destinationPlace.lat), lon: Number(destinationPlace.lon) }
      ).then(({ route }) => {
        if (route) setRouteData(route);
      });
    }
  }, [userPos]);

  async function handleCalculateRoute() {
    if (!destinationPlace) return;
    setRouteError(null);
    setRouteData(null);

    const from = sourcePlace;
    const originCoords = from
      ? { lat: Number(from.lat), lon: Number(from.lon) }
      : userPos
      ? { lat: userPos.lat, lon: userPos.lon }
      : null;

    if (!originCoords) {
      setRouteError("Current location not available. Please allow location access.");
      return;
    }

    const { route, error } = await calculateRoute(originCoords, {
      lat: Number(destinationPlace.lat),
      lon: Number(destinationPlace.lon),
    });

    if (error) {
      setRouteError(error);
    } else if (route) {
      setRouteData(route);
      setSelectedPlace(destinationPlace);
    }
  }

  function handleSwap() {
    if (!destinationPlace) return;
    const newSource = destinationPlace;
    const newDest = sourcePlace ?? (userPos ? {
      lat: userPos.lat,
      lon: userPos.lon,
      display_name: "Your Location",
      name: "Your Location"
    } : null);

    if (!newDest) return;

    setSourcePlace(newSource);
    setDestinationPlace(newDest as Place);
    
    // Automatically recalculate if both exist
    setTimeout(() => {
      // Need to use the new state values, so we trigger a recalculation after state update
    }, 0);
  }

  // Effect to automatically calculate route when source/dest change IF we were already showing a route
  useEffect(() => {
    if (isDirectionsOpen && destinationPlace && (sourcePlace !== null || userPos)) {
      // Only auto-calculate if there's no error from a previous attempt to avoid spam
      handleCalculateRoute();
    }
  }, [sourcePlace, destinationPlace]);


  async function handleSaveFav(place: Place) {
    if (!token) {
      if (confirm("Login to save favourites. Go to login page?")) {
        navigate("/login");
      }
      return;
    }
    if (place.id && place.id > 0) {
      const res = await saveFavourite(place.id, token);
      if (res && !res.error) {
        alert("✅ Saved to favourites!");
        // Refresh favorites
        fetchFavourites(token).then(data => {
          if (data && !data.error && Array.isArray(data)) {
            setFavorites(data.map((f: any) => ({
              id: f.id, lat: f.lat, lon: f.lon,
              name: f.name, display_name: f.name,
              address: f.address, category: f.category
            })));
          }
        });
      }
    } else {
      alert("This place can't be saved (no database entry). Try a nearby search result.");
    }
  }

  async function performSearch(query: string) {
    if (!query.trim()) return [];
    
    // Check if it's a category search like "hotels near me"
    const lowerQuery = query.toLowerCase();
    const categoryMatch = ["hotel", "restaurant", "cafe", "hospital", "atm", "fuel", "gas station", "pharmacy"].find(cat => lowerQuery.includes(cat));

    if (categoryMatch && userPos) {
       // Convert "gas station" to "fuel" for internal tag
       let category = categoryMatch === "gas station" ? "fuel" : categoryMatch;
       const results = await getNearbyPlacesFromOverpass(category, userPos.lat, userPos.lon, 10000);
       return results;
    }

    let results: Place[] = [];
    if (userPos) {
      const dbResults = await fetchCustomPlaces(query, userPos.lat, userPos.lon);
      if (dbResults.length > 0) {
        results = dbResults.map((r: any) => ({
          id: r.id,
          lat: r.lat,
          lon: r.lon,
          display_name: r.name,
          name: r.name,
          category: r.category,
          address: r.address,
        }));
      }
    }
    if (results.length === 0) {
      results = await searchNominatim(query);
    }
    return results;
  }

  async function handleSearch(query: string) {
    if (!query.trim()) {
      setPlaces([]);
      setCategoryName(null);
      return;
    }
    const results = await performSearch(query);
    setPlaces(results);
    setCategoryName(null);
  }

  async function handleCategorySearch(categoryQuery: string) {
    if (!userPos) {
      alert("Current location required to search nearby.");
      return;
    }
    
    // Convert generic queries like "Hotels near me" to just "hotel"
    let category = categoryQuery.toLowerCase().replace(/s?\s+near\s+me$/i, '');
    if (category.endsWith('s') && category !== 'gas station' && category !== 'atm') category = category.slice(0, -1);
    
    const results = await getNearbyPlacesFromOverpass(category, userPos.lat, userPos.lon, 10000);
    
    setPlaces(results);
    setCategoryName(categoryQuery);
    setSelectedPlace(null);
    setIsDirectionsOpen(false);
  }

  function handleStopNav() {
    setIsNavigating(false);
    setRouteData(null);
    setRouteError(null);
  }
  
  function handleCloseDirections() {
    setIsDirectionsOpen(false);
    handleStopNav();
  }

  return (
    <MainLayout>
      {/* Full-screen map */}
      <div className="absolute inset-0 h-full w-full">
        <MapView
          places={places}
          selectedPlace={selectedPlace}
          onSelectPlace={setSelectedPlace}
          onRoute={(place) => {
             setDestinationPlace(place);
             setIsDirectionsOpen(true);
          }}
          onSave={handleSaveFav}
          routeData={routeData}
          isNavigating={isNavigating}
          userPos={userPos}
        />
      </div>

      {/* Primary UI (hidden when directions are open) */}
      {!isDirectionsOpen && (
        <>
          <SearchBox
            places={places}
            history={history}
            onAddToHistory={addToHistory}
            focusTrigger={focusSearchHistory}
            onFocusConsumed={() => setFocusSearchHistory(false)}
            onSearch={handleSearch}
            onPlaceSelected={(place) => {
              setSelectedPlace(place);
              setPlaces([place]); // Keep only the selected place as a marker
              setCategoryName(null);
            }}
            onMenuClick={() => setIsDrawerOpen(true)}
          />
          
          <CategoryResultsPanel
            categoryName={categoryName || ""}
            results={categoryName ? places : []}
            selectedPlace={selectedPlace}
            onSelect={setSelectedPlace}
            onClear={() => {
              setPlaces([]);
              setCategoryName(null);
              setSelectedPlace(null);
            }}
          />
        </>
      )}

      {/* Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        favorites={favorites}
        onSelectPlace={(place) => {
          setSelectedPlace(place);
          setPlaces([place]);
          setCategoryName(null);
        }}
        onCategorySearch={handleCategorySearch}
        onOpenDirections={() => setIsDirectionsOpen(true)}
        onOpenRecentSearches={() => setFocusSearchHistory(true)}
      />

      {/* Directions Panel */}
      <DirectionsPanel
        isOpen={isDirectionsOpen}
        onClose={handleCloseDirections}
        sourcePlace={sourcePlace}
        destinationPlace={destinationPlace}
        routeData={routeData}
        routeError={routeError}
        isNavigating={isNavigating}
        onSetSource={(p) => { setSourcePlace(p); setRouteData(null); setRouteError(null); }}
        onSetDestination={(p) => { setDestinationPlace(p); setRouteData(null); setRouteError(null); }}
        onSwap={handleSwap}
        onCalculateRoute={handleCalculateRoute}
        onStartNav={() => setIsNavigating(true)}
        onStopNav={handleStopNav}
        onSearchPlace={performSearch}
      />

      {/* Place Card — only when place selected, not routing, not navigating */}
      {selectedPlace && !isDirectionsOpen && (
        <PlaceCard
          place={selectedPlace}
          onClose={() => setSelectedPlace(null)}
          onRoute={() => {
             setDestinationPlace(selectedPlace);
             setIsDirectionsOpen(true);
          }}
          onSave={() => handleSaveFav(selectedPlace)}
        />
      )}
    </MainLayout>
  );
}