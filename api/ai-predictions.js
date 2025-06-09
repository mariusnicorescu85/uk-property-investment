// api/ai-predictions.js - Simple working version
export default async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed",
    });
  }

  try {
    const { postcode } = req.query;

    console.log("🤖 AI Predictions called for:", postcode);

    if (!postcode) {
      return res.status(400).json({
        success: false,
        error: "Postcode is required",
      });
    }

    // Generate predictions (no external dependencies)
    const predictions = generatePredictions(postcode);
    const riskScore = calculateRisk(predictions);
    const recommendation = generateRecommendation(predictions, riskScore);

    console.log("✅ Predictions generated successfully");

    res.status(200).json({
      success: true,
      postcode: postcode.toUpperCase(),
      predictions: predictions,
      riskScore: riskScore,
      recommendation: recommendation,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ AI Prediction Error:", error);

    res.status(500).json({
      success: false,
      error: error.message || "Prediction failed",
      postcode: req.query.postcode,
      timestamp: new Date().toISOString(),
    });
  }
}

function generatePredictions(postcode) {
  // Simple but realistic prediction algorithm
  const baseGrowth = getAreaGrowthRate(postcode);
  const predictions = [];

  for (let year = 1; year <= 5; year++) {
    const yearlyGrowth = baseGrowth * Math.pow(0.92, year - 1); // Diminishing returns
    const volatility = (Math.random() - 0.5) * 1.5; // ±0.75% randomness
    const priceChange = yearlyGrowth + volatility;

    predictions.push({
      year: new Date().getFullYear() + year,
      predictedPrice: Math.round(
        getBasePrice(postcode) * Math.pow(1 + priceChange / 100, year)
      ),
      priceChangePercent: Math.round(priceChange * 100) / 100,
      predictedYield:
        Math.round(
          (getBaseYield(postcode) + year * 0.1 + Math.random() * 0.3) * 100
        ) / 100,
      confidence: Math.round((0.9 - year * 0.04) * 100) / 100,
    });
  }

  return predictions;
}

function getAreaGrowthRate(postcode) {
  // Simple area-based growth rates
  const area = postcode.substring(0, 2);
  const rates = {
    M1: 4.2, // Manchester
    SW: 3.8, // London SW
    B1: 3.5, // Birmingham
    L1: 3.2, // Liverpool
    LS: 3.0, // Leeds
  };
  return rates[area] || 3.5; // Default 3.5%
}

function getBasePrice(postcode) {
  const area = postcode.substring(0, 2);
  const prices = {
    M1: 425000,
    SW: 850000,
    B1: 285000,
    L1: 195000,
    LS: 220000,
  };
  return prices[area] || 350000;
}

function getBaseYield(postcode) {
  const area = postcode.substring(0, 2);
  const yields = {
    M1: 4.8,
    SW: 3.2,
    B1: 5.6,
    L1: 6.1,
    LS: 5.8,
  };
  return yields[area] || 4.5;
}

function calculateRisk(predictions) {
  const avgGrowth =
    predictions.reduce((sum, p) => sum + p.priceChangePercent, 0) /
    predictions.length;
  const volatility = calculateVolatility(
    predictions.map((p) => p.priceChangePercent)
  );

  let risk = 5; // Base risk
  if (avgGrowth > 6) risk += 2;
  if (avgGrowth < 2) risk += 1;
  if (volatility > 2) risk += 1;

  return Math.min(Math.max(Math.round(risk), 1), 10);
}

function calculateVolatility(values) {
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squaredDiffs = values.map((val) => Math.pow(val - mean, 2));
  return Math.sqrt(
    squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length
  );
}

function generateRecommendation(predictions, riskScore) {
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
    reasoning.push("Strong growth potential");
  } else if (avgGrowth < 2) {
    score -= 1;
    reasoning.push("Limited growth expected");
  } else {
    reasoning.push("Moderate growth expected");
  }

  if (avgYield > 5) {
    score += 1;
    reasoning.push("Excellent rental yield");
  } else if (avgYield > 4) {
    reasoning.push("Good rental yield");
  } else {
    score -= 1;
    reasoning.push("Lower rental yield");
  }

  if (riskScore < 4) {
    reasoning.push("Low risk investment");
  } else if (riskScore > 7) {
    score -= 2;
    reasoning.push("Higher risk investment");
  } else {
    reasoning.push("Moderate risk level");
  }

  let recommendation = "HOLD";
  if (score >= 7) recommendation = "BUY";
  else if (score >= 8) recommendation = "STRONG BUY";
  else if (score <= 3) recommendation = "SELL";
  else if (score <= 2) recommendation = "STRONG SELL";

  return {
    recommendation: recommendation,
    score: score,
    reasoning: reasoning,
    confidence: Math.round((10 - riskScore) * 9), // Convert risk to confidence %
  };
}
