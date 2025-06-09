// api/ai-predictions.js - Minimal AI predictor using only free data
import { createClient } from "@supabase/supabase-js";
// Add this import at the top of ai-predictions.js
import {
  getBankOfEnglandData,
  getPoliceData,
  getONSData,
} from "./free-data-sources.js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

class MinimalPredictionEngine {
  // Get free economic data (mock for now, will use real APIs later)
  async getFreeEconomicData(postcode) {
    const boeData = await getBankOfEnglandData();
    const crimeData = await getPoliceData(postcode);
    const onsData = await getONSData(postcode);

    return {
      ...boeData,
      ...crimeData,
      ...onsData,
    };
  }

  // Simple linear regression for trend analysis
  calculateTrend(prices) {
    if (prices.length < 2) return 0;

    const n = prices.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const y = prices.map((p) => p.price);

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((total, xi, i) => total + xi * y[i], 0);
    const sumX2 = x.reduce((total, xi) => total + xi * xi, 0);

    return (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  }

  // Generate predictions using simple math (no external AI costs)
  async generatePredictions(postcode, currentData) {
    // Get historical data
    const { data: historicalPrices } = await supabase
      .from("historical_prices")
      .select("price, date")
      .eq("postcode", postcode)
      .order("date", { ascending: true });

    // Get free economic indicators
    const economicData = await this.getFreeEconomicData(postcode);

    // Calculate base trend
    const baseTrend = this.calculateTrend(historicalPrices || []);

    // Economic adjustments (simple formula)
    const rateAdjustment = (6 - economicData.baseRate) / 10; // Lower rates = higher growth
    const inflationAdjustment = (5 - economicData.inflation) / 10;

    const predictions = [];
    let currentPrice = currentData.avg_price || 350000;
    let currentYield = currentData.rental_yield || 4.5;

    for (let year = 1; year <= 5; year++) {
      // Calculate growth with diminishing returns
      const yearlyGrowth =
        (baseTrend + rateAdjustment + inflationAdjustment) *
        Math.pow(0.9, year - 1);
      const priceChangePercent = yearlyGrowth * 100;

      currentPrice *= 1 + yearlyGrowth;

      // Yield typically moves inverse to prices
      const yieldChange = -priceChangePercent * 0.05;
      currentYield += yieldChange;

      // Confidence decreases over time
      const confidence = Math.max(0.6, 0.9 - year * 0.05);

      predictions.push({
        year: new Date().getFullYear() + year,
        predictedPrice: Math.round(currentPrice),
        priceChangePercent: Math.round(priceChangePercent * 100) / 100,
        predictedYield: Math.round(currentYield * 100) / 100,
        confidence: Math.round(confidence * 100) / 100,
      });
    }

    return predictions;
  }

  // Simple risk scoring
  calculateRisk(predictions) {
    const avgGrowth =
      predictions.reduce((sum, p) => sum + p.priceChangePercent, 0) /
      predictions.length;
    const volatility = this.calculateVolatility(
      predictions.map((p) => p.priceChangePercent)
    );

    let risk = 5; // Base risk
    if (avgGrowth < 0) risk += 2;
    if (volatility > 3) risk += 1;
    if (avgGrowth > 8) risk += 1; // High growth = higher risk

    return Math.min(Math.max(risk, 1), 10);
  }

  calculateVolatility(values) {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map((val) => Math.pow(val - mean, 2));
    return Math.sqrt(
      squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length
    );
  }

  // Generate investment recommendation
  generateRecommendation(predictions, riskScore) {
    const avgGrowth =
      predictions.reduce((sum, p) => sum + p.priceChangePercent, 0) /
      predictions.length;
    const avgYield =
      predictions.reduce((sum, p) => sum + p.predictedYield, 0) /
      predictions.length;

    let score = 5;
    let reasoning = [];

    if (avgGrowth > 4) {
      score += 2;
      reasoning.push("Strong predicted growth");
    } else if (avgGrowth < 1) {
      score -= 2;
      reasoning.push("Slow growth predicted");
    }

    if (avgYield > 5) {
      score += 1;
      reasoning.push("Good rental yield");
    } else if (avgYield < 3) {
      score -= 1;
      reasoning.push("Low rental yield");
    }

    if (riskScore < 4) {
      score += 1;
      reasoning.push("Low risk investment");
    } else if (riskScore > 7) {
      score -= 2;
      reasoning.push("High risk investment");
    }

    let recommendation = "HOLD";
    if (score >= 7) recommendation = "STRONG BUY";
    else if (score >= 6) recommendation = "BUY";
    else if (score <= 3) recommendation = "SELL";
    else if (score <= 4) recommendation = "WEAK SELL";

    return {
      recommendation,
      score,
      reasoning,
      confidence: Math.round((10 - riskScore) * 8), // Convert risk to confidence %
    };
  }
}

// API Handler
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    const { postcode } = req.query;
    if (!postcode) return res.status(400).json({ error: "Postcode required" });

    console.log(`🤖 Generating predictions for ${postcode}...`);

    const engine = new MinimalPredictionEngine();

    // Get current property data
    const { data: currentProperty } = await supabase
      .from("investment_metrics")
      .select("*")
      .eq("postcode", postcode.toUpperCase())
      .single();

    const currentData = currentProperty || {
      postcode: postcode.toUpperCase(),
      avg_price: 350000,
      rental_yield: 4.5,
    };

    // Generate predictions
    const predictions = await engine.generatePredictions(postcode, currentData);
    const riskScore = engine.calculateRisk(predictions);
    const recommendation = engine.generateRecommendation(
      predictions,
      riskScore
    );

    // Store in database for caching
    await supabase.from("ai_predictions").insert({
      postcode: postcode.toUpperCase(),
      predictions,
      risk_score: riskScore,
      recommendation,
      generated_at: new Date().toISOString(),
    });

    res.json({
      success: true,
      postcode: postcode.toUpperCase(),
      predictions,
      riskScore,
      recommendation,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Prediction error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}
