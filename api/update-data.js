// api/update-data.js - Serverless function for data updates
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

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    console.log("🚀 Starting data update process...");

    // Simple test update
    const { error } = await supabase
      .from("investment_metrics")
      .update({
        last_updated: new Date().toISOString(),
        data_confidence: 0.9,
      })
      .eq("postcode", "M1 1AA");

    if (error) throw error;

    console.log("✅ Data update completed successfully");

    res.json({
      success: true,
      message: "Data updated successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Data update failed:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
}
