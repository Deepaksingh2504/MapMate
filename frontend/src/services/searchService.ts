export async function searchPlaces(query: string) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    query
  )}`;

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
  });

  return response.json();
}