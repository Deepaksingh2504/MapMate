export type Place = {
  id?: number;
  lat: string | number;
  lon: string | number;
  display_name: string;
  name?: string;
  category?: string;
  address?: string;
};

export type RouteData = {
  coordinates: [number, number][];
  distance: number;
  duration: number;
};
