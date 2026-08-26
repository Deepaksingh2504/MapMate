import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
  ZoomControl,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import LocateButton from "./LocateButton";
import { useEffect, useState } from "react";
import LocationMarker from "./LocationMarker";
import type { Place, RouteData } from "../../types";

// Red marker for search results
const searchMarkerIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Green marker for selected destination
const destMarkerIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [30, 46],
  iconAnchor: [15, 46],
  popupAnchor: [1, -38],
});

// ── MapController: handles auto-pan / follow behaviour ───────────────────────
function MapController({
  selectedPlace,
  isNavigating,
  userPos,
  isFollowing,
  onDrag,
  routeData,
}: {
  selectedPlace: Place | null;
  isNavigating: boolean;
  userPos: { lat: number; lon: number } | null;
  isFollowing: boolean;
  onDrag: () => void;
  routeData: RouteData | null;
}) {
  const map = useMap();

  useMapEvents({ dragstart: onDrag });

  useEffect(() => {
    if (isNavigating && userPos && isFollowing) {
      map.flyTo([userPos.lat, userPos.lon], 16, { animate: true, duration: 0.8 });
    }
  }, [userPos, isNavigating, isFollowing]);

  useEffect(() => {
    if (selectedPlace && !isNavigating && !routeData) {
      map.flyTo([Number(selectedPlace.lat), Number(selectedPlace.lon)], 14, {
        animate: true,
        duration: 1,
      });
    }
  }, [selectedPlace, isNavigating, routeData]);

  useEffect(() => {
    if (routeData && routeData.coordinates && routeData.coordinates.length > 0 && !isNavigating) {
      try {
        const bounds = L.latLngBounds(routeData.coordinates);
        if (bounds.isValid()) {
          map.flyToBounds(bounds, {
            padding: [50, 50],
            animate: true,
            duration: 1,
          });
        }
      } catch (err: any) {
        console.error("Error fitting bounds to route:", err.message);
      }
    }
  }, [routeData, isNavigating, map]);

  return null;
}

// ── Types ─────────────────────────────────────────────────────────────────────
type MapViewProps = {
  places: Place[];
  selectedPlace: Place | null;
  onSelectPlace: (p: Place) => void;
  onRoute: (p: Place) => void;
  onSave: (p: Place) => void;
  routeData: RouteData | null;
  isNavigating: boolean;
  userPos: { lat: number; lon: number } | null;
};

// ── Component ─────────────────────────────────────────────────────────────────
export default function MapView({
  places,
  selectedPlace,
  onSelectPlace,
  onRoute,
  onSave,
  routeData,
  isNavigating,
  userPos,
}: MapViewProps) {
  const [isFollowing, setIsFollowing] = useState(true);

  // When navigation starts, re-enable following
  useEffect(() => {
    if (isNavigating) setIsFollowing(true);
  }, [isNavigating]);

  return (
    <MapContainer
      center={[20.2961, 85.8245]}
      zoom={13}
      zoomControl={false}
      className="h-full w-full z-0"
    >
      <ZoomControl position="bottomright" />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapController
        selectedPlace={selectedPlace}
        isNavigating={isNavigating}
        userPos={userPos}
        isFollowing={isFollowing}
        onDrag={() => setIsFollowing(false)}
        routeData={routeData}
      />

      {/* User's live location marker */}
      <LocationMarker />

      {/* Search result / destination markers */}
      {places.map((place, idx) => {
        const isDestination =
          selectedPlace?.lat === place.lat && selectedPlace?.lon === place.lon;
        // Use place.id if available, otherwise fall back to a composite key
        const key = place.id && place.id > 0
          ? `db-${place.id}`
          : `nom-${place.lat}-${place.lon}-${idx}`;
        return (
          <Marker
            key={key}
            position={[Number(place.lat), Number(place.lon)]}
            icon={isDestination ? destMarkerIcon : searchMarkerIcon}
            eventHandlers={{ click: () => onSelectPlace(place) }}
          >
            <Popup>
              <div className="p-1 min-w-[180px]">
                <h3 className="font-semibold text-base mb-1">
                  {place.name || place.display_name.split(",")[0]}
                </h3>
                <p className="text-xs text-slate-500 mb-3 line-clamp-2">
                  {place.address || place.display_name}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => onRoute(place)}
                    className="flex-1 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-blue-700 transition"
                  >
                    Directions
                  </button>
                  <button
                    onClick={() => onSave(place)}
                    className="border border-slate-300 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-slate-50 transition"
                  >
                    Save
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}

      {/* Route polyline */}
      {routeData && (
        <Polyline
          positions={routeData.coordinates}
          pathOptions={{ color: "#1a73e8", weight: 6, opacity: 0.85, lineCap: "round", lineJoin: "round" }}
        />
      )}

      {/* Re-center button when user pans during navigation */}
      {isNavigating && !isFollowing && (
        <div
          style={{
            position: "absolute",
            top: "70px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1000,
          }}
        >
          <button
            onClick={() => setIsFollowing(true)}
            className="bg-white px-5 py-2 rounded-full shadow-lg font-semibold text-blue-600 border border-slate-200 hover:bg-slate-50 transition text-sm flex items-center gap-2"
          >
            ⊙ Re-center
          </button>
        </div>
      )}

      <LocateButton userPos={userPos} />
    </MapContainer>
  );
}