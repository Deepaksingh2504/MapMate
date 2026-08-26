import { X, MapPin } from "lucide-react";
import type { Place } from "../../types";

type Props = {
  categoryName: string;
  results: Place[];
  selectedPlace: Place | null;
  onSelect: (place: Place) => void;
  onClear: () => void;
};

function formatDistance(meters: number | undefined): string {
  if (!meters) return "";
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

export default function CategoryResultsPanel({ categoryName, results, selectedPlace, onSelect, onClear }: Props) {
  if (results.length === 0) return null;

  return (
    <div className="absolute top-[72px] left-4 z-[1008] w-[340px] max-w-[calc(100vw-32px)] max-h-[50vh] bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 flex-shrink-0">
        <div>
          <p className="text-sm font-bold text-slate-800 capitalize">{categoryName} nearby</p>
          <p className="text-[11px] text-slate-500">{results.length} result{results.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={onClear}
          className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
          title="Clear results"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Results list */}
      <div className="overflow-y-auto flex-1">
        {results.map((place, i) => {
          const isSelected = selectedPlace?.lat === place.lat && selectedPlace?.lon === place.lon;
          return (
            <button
              key={place.id || `cat-${i}`}
              onClick={() => onSelect(place)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition border-b border-slate-50 last:border-b-0
                ${isSelected ? "bg-blue-50" : "hover:bg-slate-50"}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                isSelected ? "bg-blue-100" : "bg-slate-100"
              }`}>
                <MapPin className={`w-4 h-4 ${isSelected ? "text-blue-600" : "text-slate-500"}`} />
              </div>
              <div className="min-w-0 flex-1">
                <p className={`text-[13px] font-medium truncate ${isSelected ? "text-blue-700" : "text-slate-700"}`}>
                  {place.name || place.display_name.split(",")[0]}
                </p>
                <p className="text-[11px] text-slate-500 truncate">
                  {place.address || place.display_name}
                  {(place as any).distance ? ` · ${formatDistance((place as any).distance)}` : ""}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
