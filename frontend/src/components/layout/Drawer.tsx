import { useState, useEffect, useRef } from "react";
import {
  X, Heart, History as HistoryIcon, Home, Navigation2, Map, LogOut,
  User as UserIcon, Hotel, Utensils, Coffee, Hospital, Fuel,
  ChevronRight, RefreshCw, Landmark, ShoppingCart, TreePine,
  GraduationCap, School, Pill
} from "lucide-react";
import { useAuth } from "../../lib/AuthContext";
import { useNavigate } from "react-router-dom";
import type { Place } from "../../types";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  favorites: Place[];
  onSelectPlace: (place: Place) => void;
  onCategorySearch?: (category: string) => void;
  onOpenDirections?: () => void;
  onOpenRecentSearches?: () => void;
};

const EXPLORE_CATEGORIES = [
  { name: "Hotels", icon: Hotel, query: "hotel" },
  { name: "Restaurants", icon: Utensils, query: "restaurant" },
  { name: "Cafes", icon: Coffee, query: "cafe" },
  { name: "Hospitals", icon: Hospital, query: "hospital" },
  { name: "ATMs", icon: Landmark, query: "atm" },
  { name: "Gas Stations", icon: Fuel, query: "fuel" },
  { name: "Pharmacies", icon: Pill, query: "pharmacy" },
  { name: "Schools", icon: School, query: "school" },
  { name: "Universities", icon: GraduationCap, query: "university" },
  { name: "Supermarkets", icon: ShoppingCart, query: "supermarket" },
  { name: "Parks", icon: TreePine, query: "park" },
];

export default function Drawer({ isOpen, onClose, favorites, onSelectPlace, onCategorySearch, onOpenDirections, onOpenRecentSearches }: Props) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  // Close account menu on click outside
  useEffect(() => {
    if (!showAccountMenu) return;
    const handler = (e: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target as Node)) {
        setShowAccountMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showAccountMenu]);

  // Close account menu when drawer closes
  useEffect(() => {
    if (!isOpen) setShowAccountMenu(false);
  }, [isOpen]);

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  const displayName = user?.username
    ? user.username.split("@")[0].split(".").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
    : "MapMate User";

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-[1020] transition-opacity"
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div
        className={`fixed top-0 left-0 h-full w-[340px] max-w-[85vw] bg-white z-[1030] shadow-2xl flex flex-col transform transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Map className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-800">MapMate</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 -mr-1 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Scrollable content ── */}
        <div className="flex-1 overflow-y-auto">

          {/* Account section */}
          <div className="px-4 pt-4 pb-2">
            {user ? (
              <div className="relative" ref={accountMenuRef}>
                <button
                  onClick={() => setShowAccountMenu(!showAccountMenu)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-bold text-sm">
                      {displayName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{displayName}</p>
                    <p className="text-xs text-slate-500">Signed in</p>
                  </div>
                  <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${showAccountMenu ? "rotate-90" : ""}`} />
                </button>

                {/* Account dropdown */}
                {showAccountMenu && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-slate-100 z-10 overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-sm font-semibold text-slate-800">{displayName}</p>
                      <p className="text-xs text-slate-500 truncate">{user.username}</p>
                    </div>
                    <button
                      onClick={() => { setShowAccountMenu(false); navigate("/login"); onClose(); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition"
                    >
                      <RefreshCw className="w-4 h-4 text-slate-400" />
                      Switch account
                    </button>
                    <button
                      onClick={() => { logout(); setShowAccountMenu(false); onClose(); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => { onClose(); navigate("/login"); }}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 transition"
              >
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <UserIcon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Sign in</p>
                  <p className="text-xs opacity-70">To save places & sync</p>
                </div>
              </button>
            )}
          </div>

          {/* ── Your Places ── */}
          <div className="mt-2">
            <p className="px-5 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Your Places</p>

            {/* Favorites */}
            {favorites.length > 0 ? (
              favorites.slice(0, 5).map((fav, i) => (
                <button
                  key={i}
                  onClick={() => { onSelectPlace(fav); onClose(); }}
                  className="w-full flex items-center gap-4 px-5 py-2.5 hover:bg-slate-50 transition text-left"
                >
                  <Heart className="w-[18px] h-[18px] text-red-400 flex-shrink-0" />
                  <span className="text-[13px] font-medium text-slate-700 line-clamp-1">
                    {fav.name || fav.display_name.split(",")[0]}
                  </span>
                </button>
              ))
            ) : (
              <div className="px-5 py-2.5 text-[13px] text-slate-400">
                {user ? "No saved places yet" : "Sign in to view favorites"}
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="h-px bg-slate-100 mx-4 my-2" />

          {/* ── Navigate ── */}
          <div>
            <p className="px-5 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Navigate</p>
            <button
              onClick={() => { onClose(); }}
              className="w-full flex items-center gap-4 px-5 py-2.5 hover:bg-slate-50 transition"
            >
              <Home className="w-[18px] h-[18px] text-slate-500" />
              <span className="text-[13px] font-medium text-slate-700">Home</span>
            </button>
            <button
              onClick={() => { onClose(); onOpenDirections?.(); }}
              className="w-full flex items-center gap-4 px-5 py-2.5 hover:bg-slate-50 transition"
            >
              <Navigation2 className="w-[18px] h-[18px] text-blue-600" />
              <span className="text-[13px] font-medium text-slate-700">Directions</span>
            </button>
            <button
              onClick={() => { onClose(); onOpenRecentSearches?.(); }}
              className="w-full flex items-center gap-4 px-5 py-2.5 hover:bg-slate-50 transition"
            >
              <HistoryIcon className="w-[18px] h-[18px] text-slate-500" />
              <span className="text-[13px] font-medium text-slate-700">Recent searches</span>
            </button>
          </div>

          {/* Divider */}
          <div className="h-px bg-slate-100 mx-4 my-2" />

          {/* ── Explore ── */}
          <div className="pb-4">
            <p className="px-5 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Explore Nearby</p>
            {EXPLORE_CATEGORIES.map((cat) => (
              <button
                key={cat.name}
                onClick={() => { onCategorySearch?.(cat.query); onClose(); }}
                className="w-full flex items-center gap-4 px-5 py-2.5 hover:bg-slate-50 transition"
              >
                <cat.icon className="w-[18px] h-[18px] text-slate-500" />
                <span className="text-[13px] font-medium text-slate-700">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Footer ── */}
        {user && (
          <div className="border-t border-slate-100 px-4 py-3">
            <button
              onClick={() => { logout(); onClose(); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-red-500 hover:bg-red-50 rounded-xl transition text-[13px] font-medium"
            >
              <LogOut className="w-[18px] h-[18px]" />
              Sign out
            </button>
          </div>
        )}
      </div>
    </>
  );
}
