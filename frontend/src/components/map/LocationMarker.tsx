import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { useUserLocation } from "../../hooks/useUserLocation";

// Custom animated pulsing blue dot for user's location
const userIcon = new L.DivIcon({
  className: "",
  html: `
    <div style="position:relative; width:24px; height:24px;">
      <div style="position:absolute; inset:-8px; border-radius:50%; background:rgba(66,133,244,0.2); animation: ping 1.5s ease-in-out infinite;"></div>
      <div style="position:absolute; inset:-3px; border-radius:50%; background:rgba(66,133,244,0.15);"></div>
      <div style="position:relative; width:24px; height:24px; border-radius:50%; background:#4285F4; border:3px solid white; box-shadow:0 2px 8px rgba(66,133,244,0.6);"></div>
    </div>
    <style>@keyframes ping { 0%,100%{transform:scale(1);opacity:.8} 50%{transform:scale(1.4);opacity:.3} }</style>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

export default function LocationMarker() {
  // Reuse the existing cached watcher — no new GPS call
  const { location } = useUserLocation();

  if (!location) return null;

  return (
    <Marker position={[location.lat, location.lon]} icon={userIcon}>
      <Popup>
        <div className="text-sm font-medium">📍 You are here</div>
        {location.accuracy && (
          <div className="text-xs text-slate-500">Accuracy: ±{Math.round(location.accuracy)}m</div>
        )}
      </Popup>
    </Marker>
  );
}