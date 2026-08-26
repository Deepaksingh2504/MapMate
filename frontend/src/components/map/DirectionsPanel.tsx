import { useState, useRef, useEffect } from "react";
import { ArrowLeft, ArrowDownUp, Navigation2, Search, MapPin, X, AlertTriangle } from "lucide-react";
import type { Place, RouteData } from "../../types";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  sourcePlace: Place | null;
  destinationPlace: Place | null;
  routeData: RouteData | null;
  routeError: string | null;
  isNavigating: boolean;
  onSetSource: (place: Place | null) => void;
  onSetDestination: (place: Place | null) => void;
  onSwap: () => void;
  onCalculateRoute: () => void;
  onStartNav: () => void;
  onStopNav: () => void;
  onSearchPlace: (query: string) => Promise<Place[]>;
};

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);
  if (hours > 0) return `${hours} hr ${minutes} min`;
  return `${minutes} min`;
}

function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

type FieldMode = "source" | "destination" | null;

export default function DirectionsPanel({
  isOpen, onClose, sourcePlace, destinationPlace, routeData, routeError,
  isNavigating, onSetSource, onSetDestination, onSwap,
  onCalculateRoute, onStartNav, onStopNav, onSearchPlace,
}: Props) {
  const [activeField, setActiveField] = useState<FieldMode>(null);
  const [fieldQuery, setFieldQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Place[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (activeField && inputRef.current) {
      inputRef.current.focus();
    }
  }, [activeField]);

  // Debounced search
  useEffect(() => {
    if (!fieldQuery.trim()) {
      setSuggestions([]);
      return;
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      const results = await onSearchPlace(fieldQuery);
      setSuggestions(results);
      setIsSearching(false);
    }, 350);
    return () => clearTimeout(debounceRef.current);
  }, [fieldQuery]);

  const handleSelectSuggestion = (place: Place) => {
    if (activeField === "source") {
      onSetSource(place);
    } else {
      onSetDestination(place);
    }
    setActiveField(null);
    setFieldQuery("");
    setSuggestions([]);
  };

  const sourceName = sourcePlace?.name || sourcePlace?.display_name?.split(",")[0] || "Your location";
  const destName = destinationPlace?.name || destinationPlace?.display_name?.split(",")[0] || "";

  if (!isOpen) return null;

  return (
    <div className="absolute top-0 left-0 z-[1015] w-[400px] max-w-[calc(100vw-16px)] h-auto max-h-[calc(100vh-24px)]">
      <div className="m-4 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">

        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-100 transition text-slate-500">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-bold text-slate-800">Directions</span>
        </div>

        {/* Source / Destination fields */}
        <div className="px-4 py-3">
          <div className="flex items-stretch gap-2">
            {/* Dots column */}
            <div className="flex flex-col items-center pt-3 pb-3 w-5 flex-shrink-0">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <div className="flex-1 w-px bg-slate-300 my-1" />
              <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
            </div>

            {/* Fields column */}
            <div className="flex-1 flex flex-col gap-2">
              {/* Source field */}
              {activeField === "source" ? (
                <div className="flex items-center gap-2 bg-blue-50 rounded-xl px-3 py-2.5 border border-blue-200">
                  <Search className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  <input
                    ref={inputRef}
                    value={fieldQuery}
                    onChange={(e) => setFieldQuery(e.target.value)}
                    placeholder="Search starting point..."
                    className="flex-1 bg-transparent text-sm outline-none text-slate-800 placeholder:text-slate-400"
                  />
                  <button onClick={() => { setActiveField(null); setFieldQuery(""); setSuggestions([]); }}>
                    <X className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { setActiveField("source"); setFieldQuery(""); }}
                  className="text-left bg-slate-50 rounded-xl px-3 py-2.5 hover:bg-slate-100 transition"
                >
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">From</p>
                  <p className="text-sm font-medium text-slate-700 truncate">{sourceName}</p>
                </button>
              )}

              {/* Destination field */}
              {activeField === "destination" ? (
                <div className="flex items-center gap-2 bg-red-50 rounded-xl px-3 py-2.5 border border-red-200">
                  <Search className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <input
                    ref={inputRef}
                    value={fieldQuery}
                    onChange={(e) => setFieldQuery(e.target.value)}
                    placeholder="Search destination..."
                    className="flex-1 bg-transparent text-sm outline-none text-slate-800 placeholder:text-slate-400"
                  />
                  <button onClick={() => { setActiveField(null); setFieldQuery(""); setSuggestions([]); }}>
                    <X className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { setActiveField("destination"); setFieldQuery(""); }}
                  className="text-left bg-slate-50 rounded-xl px-3 py-2.5 hover:bg-slate-100 transition"
                >
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">To</p>
                  <p className={`text-sm font-medium truncate ${destName ? "text-slate-700" : "text-slate-400"}`}>
                    {destName || "Choose destination"}
                  </p>
                </button>
              )}
            </div>

            {/* Swap button */}
            <div className="flex items-center">
              <button
                onClick={() => { onSwap(); setActiveField(null); }}
                className="p-2 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-blue-600 transition"
                title="Swap source and destination"
              >
                <ArrowDownUp className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Suggestions dropdown */}
        {activeField && suggestions.length > 0 && (
          <div className="border-t border-slate-100 max-h-[250px] overflow-y-auto">
            {suggestions.map((place, i) => (
              <button
                key={place.id || `${place.lat}-${place.lon}-${i}`}
                onClick={() => handleSelectSuggestion(place)}
                className="w-full flex items-center gap-3 px-5 py-2.5 hover:bg-slate-50 transition text-left"
              >
                <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">{place.name || place.display_name.split(",")[0]}</p>
                  <p className="text-xs text-slate-500 truncate">{place.address || place.display_name}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Searching indicator */}
        {activeField && isSearching && (
          <div className="px-5 py-3 text-xs text-slate-500 border-t border-slate-100">Searching...</div>
        )}

        {/* Route error */}
        {routeError && (
          <div className="mx-4 mb-3 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-amber-800">{routeError}</p>
          </div>
        )}

        {/* Route result */}
        {routeData && !activeField && (
          <div className="px-4 pb-3 border-t border-slate-100 pt-3">
            <div className="flex items-baseline gap-3 mb-3">
              <span className="text-2xl font-bold text-slate-800">{formatDuration(routeData.duration)}</span>
              <span className="text-sm text-slate-500">{formatDistance(routeData.distance)}</span>
            </div>
            <p className="text-xs text-slate-500 mb-3">Fastest route via road</p>
          </div>
        )}

        {/* Action button */}
        {!activeField && (
          <div className="px-4 pb-4">
            {isNavigating ? (
              <button
                onClick={onStopNav}
                className="w-full rounded-xl bg-red-500 py-3 text-sm font-bold text-white hover:bg-red-600 transition"
              >
                Exit Navigation
              </button>
            ) : routeData ? (
              <button
                onClick={onStartNav}
                className="w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white hover:bg-blue-700 transition flex items-center justify-center gap-2"
              >
                <Navigation2 className="w-4 h-4" />
                Start Navigation
              </button>
            ) : (
              <button
                onClick={onCalculateRoute}
                disabled={!destinationPlace}
                className="w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white hover:bg-blue-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Get Directions
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
