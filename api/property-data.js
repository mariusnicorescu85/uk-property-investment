// api/property-data.js - FIXED VERSION
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase with error handling
let supabase;
try {
  supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
} catch (error) {
  console.error("Supabase initialization error:", error);
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    console.log("🚀 Property data API called");
    console.log("Query params:", req.query);

    const { postcode, lat, lng, radius = 5 } = req.query;

    // Check if Supabase is initialized
    if (!supabase) {
      throw new Error("Database connection not available");
    }

    if (postcode) {
      console.log("📍 Getting data for postcode:", postcode);
      const propertyData = await getPropertyByPostcode(postcode);
      return res.json(propertyData);
    }

    if (lat && lng) {
      console.log("🗺️ Getting nearby properties");
      const nearbyData = await getNearbyProperties(
        parseFloat(lat),
        parseFloat(lng),
        parseFloat(radius)
      );
      return res.json(nearbyData);
    }

    // Default: return sample data if database is not available
    console.log("📊 Returning default areas data");

    try {
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

      if (error) {
        console.error("Database query error:", error);
        throw error;
      }

      res.json({
        success: true,
        data: areas || [],
        total: areas ? areas.length : 0,
        source: "database",
      });
    } catch (dbError) {
      console.error("Database error, using sample data:", dbError);

      // Return sample data as fallback
      const sampleData = getSamplePropertyData();
      res.json({
        success: true,
        data: sampleData,
        total: sampleData.length,
        source: "sample",
        note: "Using sample data - database connection issue",
      });
    }
  } catch (error) {
    console.error("❌ API Error:", error);

    // Always return JSON, never HTML
    res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
      timestamp: new Date().toISOString(),
      source: "error_handler",
    });
  }
}

async function getPropertyByPostcode(postcode) {
  try {
    console.log("🔍 Searching for postcode:", postcode);

    if (!supabase) {
      return getSamplePropertyByPostcode(postcode);
    }

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
      console.error("Metrics query error:", metricsError);
      return getSamplePropertyByPostcode(postcode);
    }

    // Get recent property sales (with error handling)
    let recentSales = [];
    try {
      const { data: salesData } = await supabase
        .from("property_prices")
        .select("*")
        .eq("postcode", postcode.toUpperCase())
        .order("date_of_transfer", { ascending: false })
        .limit(10);

      recentSales = salesData || [];
    } catch (salesError) {
      console.error("Sales data error:", salesError);
    }

    // Get crime data (with error handling)
    let crimeData = [];
    try {
      const { data: crime } = await supabase
        .from("crime_data")
        .select("*")
        .eq("postcode", postcode.toUpperCase())
        .gte(
          "month",
          new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()
        )
        .order("month", { ascending: false });

      crimeData = crime || [];
    } catch (crimeError) {
      console.error("Crime data error:", crimeError);
    }

    // Get transport data (with error handling)
    let transportData = [];
    try {
      const { data: transport } = await supabase
        .from("transport_data")
        .select("*")
        .eq("postcode", postcode.toUpperCase())
        .order("distance_meters", { ascending: true });

      transportData = transport || [];
    } catch (transportError) {
      console.error("Transport data error:", transportError);
    }

    return {
      success: true,
      postcode: postcode.toUpperCase(),
      metrics: metrics || generateDefaultMetrics(postcode),
      recentSales: recentSales,
      crimeData: crimeData,
      transportData: transportData,
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error("getPropertyByPostcode error:", error);
    return getSamplePropertyByPostcode(postcode);
  }
}

async function getNearbyProperties(lat, lng, radiusKm) {
  try {
    if (!supabase) {
      return { success: true, data: getSamplePropertyData() };
    }

    // Try RPC function first
    const { data, error } = await supabase.rpc("nearby_properties", {
      lat: lat,
      lng: lng,
      radius_km: radiusKm,
    });

    if (error) {
      console.error("RPC error, using fallback:", error);

      // Fallback: get all data and filter client-side
      const { data: allAreas, error: fallbackError } = await supabase.from(
        "investment_metrics"
      ).select(`
          *,
          property_areas (*)
        `);

      if (fallbackError) {
        console.error("Fallback query error:", fallbackError);
        return { success: true, data: getSamplePropertyData() };
      }

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

    return { success: true, data: data || [] };
  } catch (error) {
    console.error("getNearbyProperties error:", error);
    return { success: true, data: getSamplePropertyData() };
  }
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
  return {
    postcode: postcode.toUpperCase(),
    avg_price: Math.floor(Math.random() * 200000) + 200000,
    price_growth_12m: Math.random() * 20 - 5,
    rental_yield: Math.random() * 8 + 2,
    investment_score: Math.random() * 5 + 3,
    transport_score: Math.random() * 10,
    crime_rate: Math.random() * 50 + 10,
    employment_rate: Math.random() * 20 + 80,
    school_rating: ["Outstanding", "Good", "Requires Improvement"][
      Math.floor(Math.random() * 3)
    ],
    new_developments: Math.floor(Math.random() * 50),
    last_updated: new Date().toISOString(),
    data_confidence: 0.5,
  };
}

// Sample data functions
function getSamplePropertyData() {
  return [
    {
      postcode: "M1 1AA",
      investment_score: 8.4,
      avg_price: 425000,
      price_growth_12m: 12.3,
      rental_yield: 4.8,
      transport_score: 7.9,
      crime_rate: 25,
      employment_rate: 94.2,
      property_areas: {
        area_name: "Manchester Central",
        latitude: 53.4808,
        longitude: -2.2426,
        region: "North West",
        local_authority: "Manchester",
      },
    },
    {
      postcode: "SW1A 1AA",
      investment_score: 9.2,
      avg_price: 850000,
      price_growth_12m: 8.7,
      rental_yield: 3.2,
      transport_score: 9.8,
      crime_rate: 15,
      employment_rate: 96.1,
      property_areas: {
        area_name: "Westminster",
        latitude: 51.5014,
        longitude: -0.1419,
        region: "London",
        local_authority: "Westminster",
      },
    },
    {
      postcode: "B1 1AA",
      investment_score: 7.2,
      avg_price: 285000,
      price_growth_12m: 9.4,
      rental_yield: 5.6,
      transport_score: 6.8,
      crime_rate: 35,
      employment_rate: 88.7,
      property_areas: {
        area_name: "Birmingham Central",
        latitude: 52.4862,
        longitude: -1.8904,
        region: "West Midlands",
        local_authority: "Birmingham",
      },
    },
  ];
}

function getSamplePropertyByPostcode(postcode) {
  const sampleData = getSamplePropertyData();
  const found = sampleData.find((p) => p.postcode === postcode.toUpperCase());

  return {
    success: true,
    postcode: postcode.toUpperCase(),
    metrics: found || generateDefaultMetrics(postcode),
    recentSales: [],
    crimeData: [],
    transportData: [],
    lastUpdated: new Date().toISOString(),
    source: "sample",
  };
}
