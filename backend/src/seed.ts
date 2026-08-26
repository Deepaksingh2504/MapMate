import pool, { initDb } from "./db";

const seed = async () => {
  await initDb();
  
  const places = [
    { name: "City Hospital", category: "Hospital", address: "123 Health Ave", lat: 20.2961, lon: 85.8245 },
    { name: "Central Park", category: "Park", address: "456 Green St", lat: 20.3000, lon: 85.8200 },
    { name: "Pizza Palace", category: "Pizza", address: "789 Food Rd", lat: 20.2950, lon: 85.8250 },
  ];

  for (const place of places) {
    const query = `
      INSERT INTO places (name, category, address, location)
      VALUES ($1, $2, $3, ST_SetSRID(ST_MakePoint($4, $5), 4326))
    `;
    await pool.query(query, [place.name, place.category, place.address, place.lon, place.lat]);
  }

  console.log("Seeding completed");
  process.exit(0);
};

seed();
