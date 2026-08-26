import { ArrowDownUp, Navigation2 } from "lucide-react";
import type { Place, RouteData } from "../../types";

type Props = {
  source?: Place;
  destination: Place;
  routeData: RouteData;
  isNavigating: boolean;
  onStartNav: () => void;
  onStopNav: () => void;
  onSwap?: () => void;
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

export default function RoutePanel({ source, destination, routeData, isNavigating, onStartNav, onStopNav, onSwap }: Props) {
  const destName = destination.name || destination.display_name.split(",")[0];
  const sourceName = source?.name || source?.display_name?.split(",")[0] || "Your Location";

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] w-[90%] max-w-[400px] rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden">
      
      {/* Header */}
      <div className="bg-blue-600 px-5 pt-4 pb-3 text-white">
        <div className="flex items-center gap-2 mb-1">
          <Navigation2 className="w-4 h-4" />
          <span className="text-xs font-semibold uppercase tracking-wide opacity-80">
            {isNavigating ? "Navigating" : "Route Preview"}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-2xl font-bold">{formatDuration(routeData.duration)}</span>
          <span className="text-sm opacity-80">({formatDistance(routeData.distance)})</span>
        </div>
      </div>

      {/* Route details */}
      <div className="px-5 py-4">
        {/* From → To */}
        <div className="flex items-stretch gap-3 mb-4 bg-slate-50 rounded-xl p-3 border border-slate-100 relative">
          <div className="flex flex-col items-center py-1">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500 mt-0.5"></div>
            <div className="flex-1 w-px bg-slate-300 my-1"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 mb-0.5"></div>
          </div>
          <div className="flex flex-col gap-3 flex-1 min-w-0">
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">From</p>
              <p className="text-sm font-semibold text-slate-800 line-clamp-1">{sourceName}</p>
            </div>
            <div className="h-px bg-slate-200 -mx-0"></div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">To</p>
              <p className="text-sm font-semibold text-slate-800 line-clamp-1">{destName}</p>
            </div>
          </div>
          {onSwap && !isNavigating && (
            <button
              onClick={onSwap}
              title="Swap source and destination"
              className="self-center ml-1 bg-white p-2 rounded-full shadow border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200 transition flex-shrink-0"
            >
              <ArrowDownUp className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Status message during navigation */}
        {isNavigating && (
          <div className="flex items-center gap-2 mb-3 text-green-600 text-sm font-medium">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            Live Navigation Active
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2">
          {isNavigating ? (
            <button
              onClick={onStopNav}
              className="flex-1 rounded-xl bg-red-500 py-3 font-semibold text-white hover:bg-red-600 transition text-sm"
            >
              Exit Navigation
            </button>
          ) : (
            <button
              onClick={onStartNav}
              className="flex-1 rounded-xl bg-blue-600 py-3 font-bold text-white hover:bg-blue-700 transition flex items-center justify-center gap-2 text-sm"
            >
              <Navigation2 className="w-4 h-4" />
              Start Navigation
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
