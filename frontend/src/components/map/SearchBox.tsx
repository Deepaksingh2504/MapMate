import { useState, useEffect, useRef } from "react";
import { Search, Menu, MapPin, History, Coffee, Utensils, Hotel, Hospital, Navigation, Fuel, X } from "lucide-react";
import type { Place } from "../../types";

type Props = {
  places: Place[];
  history: Place[];
  onPlaceSelected: (place: Place) => void;
  onSearch: (query: string) => Promise<void>;
  onAddToHistory: (place: Place) => void;
  onMenuClick?: () => void;
  focusTrigger?: boolean;
  onFocusConsumed?: () => void;
};

const CATEGORIES = [
  { name: "Hotels", icon: <Hotel className="w-5 h-5" />, query: "Hotels near me" },
  { name: "Restaurants", icon: <Utensils className="w-5 h-5" />, query: "Restaurants near me" },
  { name: "Cafes", icon: <Coffee className="w-5 h-5" />, query: "Cafes near me" },
  { name: "Hospitals", icon: <Hospital className="w-5 h-5" />, query: "Hospitals near me" },
  { name: "ATMs", icon: <Navigation className="w-5 h-5" />, query: "ATMs near me" },
  { name: "Gas Stations", icon: <Fuel className="w-5 h-5" />, query: "Gas stations near me" }
];

export default function SearchBox({ places, history, onPlaceSelected, onSearch, onAddToHistory, onMenuClick, focusTrigger, onFocusConsumed }: Props) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (focusTrigger && inputRef.current) {
      inputRef.current.focus();
      setIsFocused(true);
      onFocusConsumed?.();
    }
  }, [focusTrigger, onFocusConsumed]);

  const handleSelect = (place: Place) => {
    onPlaceSelected(place);
    setQuery(place.display_name.split(",")[0]);
    setIsFocused(false);
    onAddToHistory(place);
    // Clear results so they don't pop up again unless user types
    onSearch(""); 
  };

  async function handleSearch(e?: React.FormEvent, directQuery?: string) {
    if (e) e.preventDefault();
    const q = directQuery ?? query;
    if (!q.trim()) return;
    setQuery(q);
    setIsFocused(true);
    await onSearch(q);
  }

  const handleClear = () => {
    setQuery("");
    onSearch("");
    setIsFocused(true);
  };

  return (
    <div ref={containerRef} className="absolute left-4 top-4 z-[1010] w-[400px] max-w-[calc(100vw-32px)]">
      <form 
        onSubmit={handleSearch}
        className="flex items-center rounded-2xl bg-white px-4 py-3 shadow-md border border-slate-100"
      >
        <button type="button" onClick={onMenuClick}>
          <Menu className="mr-3 h-6 w-6 cursor-pointer text-slate-500 hover:text-slate-800 transition-colors" />
        </button>
        <input
          ref={inputRef}
          value={query}
          onFocus={() => setIsFocused(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            if (e.target.value === "") {
              onSearch("");
            } else {
              onSearch(e.target.value);
            }
          }}
          placeholder="Search MapMate"
          className="flex-1 bg-transparent text-slate-800 outline-none placeholder:text-slate-500 text-base font-medium"
        />
        {query && (
          <button type="button" onClick={handleClear} className="p-1 mr-1 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        )}
        <div className="h-6 w-px bg-slate-200 mx-1"></div>
        <button type="submit" className="ml-2 rounded-full p-2 hover:bg-slate-100 transition-colors">
          <Search className="h-5 w-5 text-blue-600" />
        </button>
      </form>

      {isFocused && (
        <div className="mt-2 overflow-hidden rounded-2xl bg-white shadow-xl border border-slate-100 max-h-[60vh] overflow-y-auto">
          
          {/* Default State: History and Categories */}
          {!query && places.length === 0 && (
            <div className="py-2">
              {history.length > 0 && (
                <div className="mb-4">
                  <div className="px-5 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Recent Searches</div>
                  {history.map((place, idx) => (
                    <div 
                      key={idx}
                      onClick={() => handleSelect(place)}
                      className="flex cursor-pointer items-center gap-4 px-5 py-3 hover:bg-slate-50 transition"
                    >
                      <History className="h-5 w-5 text-slate-400" />
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-slate-700">{place.name || place.display_name.split(",")[0]}</span>
                        <span className="text-xs text-slate-500 line-clamp-1">{place.address || place.display_name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div>
                <div className="px-5 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Explore Nearby</div>
                <div className="grid grid-cols-3 gap-2 px-4 pb-4 pt-2">
                  {CATEGORIES.map((cat) => (
                    <button 
                      key={cat.name}
                      onClick={() => handleSearch(undefined, cat.query)}
                      className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-100 hover:bg-blue-50 hover:border-blue-100 hover:text-blue-600 text-slate-600 transition group"
                    >
                      <div className="mb-1 text-slate-500 group-hover:text-blue-600">{cat.icon}</div>
                      <span className="text-[11px] font-semibold text-center leading-tight">{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Search Results */}
          {places.length > 0 && (
            <div>
              {places.map((place)=>(
                <div
                  key={place.id || place.lat}
                  onClick={() => handleSelect(place)}
                  className="flex cursor-pointer items-center gap-4 border-b border-slate-50 px-5 py-3 last:border-b-0 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 flex-shrink-0">
                    <MapPin className="h-4 w-4 text-slate-500" />
                  </div>
                  <div className="flex flex-col">
                    <span className="line-clamp-1 flex-1 text-sm font-semibold text-slate-800 leading-tight">
                      {place.name || place.display_name.split(",")[0]}
                    </span>
                    <span className="line-clamp-1 flex-1 text-xs text-slate-500 leading-tight mt-1">
                      {place.address || place.display_name}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}