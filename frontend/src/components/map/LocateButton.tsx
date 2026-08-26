import { useMap } from "react-leaflet";
import { LocateFixed } from "lucide-react";

export default function LocateButton({ userPos }: { userPos: { lat: number; lon: number } | null }) {
  const map = useMap();

  function locateUser() {
    if (userPos) {
      map.flyTo([userPos.lat, userPos.lon], 16, { duration: 1 });
    } else {
      // Fallback
      navigator.geolocation.getCurrentPosition(
        (position) => {
          map.flyTo([position.coords.latitude, position.coords.longitude], 16, { duration: 1.5 });
        },
        (error) => console.error(error),
        { enableHighAccuracy: true }
      );
    }
  }

  return (

    <button
      onClick={locateUser}
      className="
      absolute
      bottom-32
      right-6
      z-[1000]
      h-12
      w-12
      rounded-full
      bg-white
      shadow-lg
      flex
      items-center
      justify-center
      hover:bg-slate-100
      "
    >
      <LocateFixed size={22} />
    </button>

  );

}