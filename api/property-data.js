// api/property-data.js
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const { postcode, lat, lng, radius = 5 } = req.query;

    if (postcode) {
      // Get data for specific postcode
      const propertyData = await getPropertyByPostcode(postcode);
      return res.json(propertyData);
    }

    if (lat && lng) {
      // Get data for areas near coordinates
      const nearbyData = await getNearbyProperties(
        parseFloat(lat),
        parseFloat(lng),
        parseFloat(radius)
      );
      return res.json(nearbyData);
    }

    // Default: return all areas with investment scores
    const { data: areas, error } = await supabase
      .from("investment_metrics")
      .select(
        `
        postcode,
        avg_price,
        price_growth_12m,
        rental_yield,
        investment_score,
        transport_score,
        crime_rate,
        employment_rate,
        school_rating,
        new_developments,
        last_updated,
        property_areas (
          area_name,
          latitude,
          longitude,
          region,
          local_authority
        )
      `
      )
      .order("investment_score", { ascending: false })
      .limit(100);

    if (error) throw error;

    res.json({
      success: true,
      data: areas,
      total: areas.length,
    });
  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

async function getPropertyByPostcode(postcode) {
  const { data: metrics, error: metricsError } = await supabase
    .from("investment_metrics")
    .select(
      `
      *,
      property_areas (*)
    `
    )
    .eq("postcode", postcode.toUpperCase())
    .single();

  if (metricsError && metricsError.code !== "PGRST116") {
    throw metricsError;
  }

  // Get recent property sales
  const { data: recentSales, error: salesError } = await supabase
    .from("property_prices")
    .select("*")
    .eq("postcode", postcode.toUpperCase())
    .order("date_of_transfer", { ascending: false })
    .limit(10);

  // Get crime data
  const { data: crimeData, error: crimeError } = await supabase
    .from("crime_data")
    .select("*")
    .eq("postcode", postcode.toUpperCase())
    .gte(
      "month",
      new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()
    )
    .order("month", { ascending: false });

  // Get transport data
  const { data: transportData, error: transportError } = await supabase
    .from("transport_data")
    .select("*")
    .eq("postcode", postcode.toUpperCase())
    .order("distance_meters", { ascending: true });

  return {
    success: true,
    postcode: postcode.toUpperCase(),
    metrics: metrics || generateDefaultMetrics(postcode),
    recentSales: recentSales || [],
    crimeData: crimeData || [],
    transportData: transportData || [],
    lastUpdated: new Date().toISOString(),
  };
}

async function getNearbyProperties(lat, lng, radiusKm) {
  // Simple distance calculation using SQL
  const { data, error } = await supabase.rpc("nearby_properties", {
    lat: lat,
    lng: lng,
    radius_km: radiusKm,
  });

  if (error) {
    // Fallback: get all data and filter client-side
    const { data: allAreas, error: fallbackError } = await supabase.from(
      "investment_metrics"
    ).select(`
        *,
        property_areas (*)
      `);

    if (fallbackError) throw fallbackError;

    // Filter by distance client-side
    const filtered = allAreas.filter((area) => {
      if (!area.property_areas) return false;
      const distance = calculateDistance(
        lat,
        lng,
        area.property_areas.latitude,
        area.property_areas.longitude
      );
      return distance <= radiusKm;
    });

    return { success: true, data: filtered };
  }

  return { success: true, data };
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function generateDefaultMetrics(postcode) {
  // Generate reasonable default metrics for new postcodes
  return {
    postcode: postcode.toUpperCase(),
    avg_price: Math.floor(Math.random() * 200000) + 200000, // £200k-£400k
    price_growth_12m: Math.random() * 20 - 5, // -5% to +15%
    rental_yield: Math.random() * 8 + 2, // 2% to 10%
    investment_score: Math.random() * 5 + 3, // 3 to 8
    transport_score: Math.random() * 10, // 0 to 10
    crime_rate: Math.random() * 50 + 10, // 10 to 60 per 1000
    employment_rate: Math.random() * 20 + 80, // 80% to 100%
    school_rating: ["Outstanding", "Good", "Requires Improvement"][
      Math.floor(Math.random() * 3)
    ],
    new_developments: Math.floor(Math.random() * 50),
    last_updated: new Date().toISOString(),
    data_confidence: 0.5, // Lower confidence for generated data
  };
}
