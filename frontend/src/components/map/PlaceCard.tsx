import type { Place } from "../../types";
import { Heart, MapPin, X, Navigation2 } from "lucide-react";

type PlaceCardProps = {
  place: Place | null;
  onClose: () => void;
  onRoute: () => void;
  onSave: () => void;
};

const CATEGORY_EMOJIS: Record<string, string> = {
  hospital: "🏥", restaurant: "🍽", hotel: "🏨", cafe: "☕",
  atm: "🏧", fuel: "⛽", pharmacy: "💊", school: "🏫",
  university: "🎓", airport: "✈️", park: "🌳", supermarket: "🛒",
};

export default function PlaceCard({ place, onClose, onRoute, onSave }: PlaceCardProps) {
  if (!place) return null;

  const name = place.name || place.display_name.split(",")[0];
  const address = place.address || place.display_name;
  const emoji = place.category ? (CATEGORY_EMOJIS[place.category.toLowerCase()] ?? "📍") : "📍";

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[420px] bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-[1001]">
      
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 bg-white rounded-full p-1 z-10"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Category header strip */}
      <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-5 pt-5 pb-4 text-white">
        <div className="text-2xl mb-1">{emoji}</div>
        <h2 className="text-lg font-bold pr-8 leading-snug">{name}</h2>
        {place.category && (
          <span className="text-xs opacity-60 capitalize">{place.category}</span>
        )}
      </div>

      {/* Body */}
      <div className="px-5 py-4">
        {/* Address */}
        <div className="flex items-start gap-2 text-slate-600 text-sm mb-4">
          <MapPin className="w-4 h-4 mt-0.5 text-slate-400 flex-shrink-0" />
          <span className="line-clamp-2">{address}</span>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            onClick={onRoute}
            className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition flex items-center justify-center gap-2 text-sm"
          >
            <Navigation2 className="w-4 h-4" />
            Directions
          </button>
          <button
            onClick={onSave}
            className="px-5 bg-slate-100 text-slate-700 font-semibold py-3 rounded-xl hover:bg-red-50 hover:text-red-600 transition flex items-center justify-center gap-1 text-sm"
          >
            <Heart className="w-4 h-4" />
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
