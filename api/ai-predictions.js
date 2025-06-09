// api/ai-predictions.js - COMPLETE: Real-time APIs + Universal UK coverage
import {
  FreeRealTimeDataProvider,
  getEnhancedPropertyData,
} from "./real-time-data.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET")
    return res
      .status(405)
      .json({ success: false, error: "Method not allowed" });

  try {
    const { postcode } = req.query;

    if (!postcode) {
      return res
        .status(400)
        .json({ success: false, error: "Postcode is required" });
    }

    if (!isValidUKPostcode(postcode)) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid UK postcode format" });
    }

    console.log(
      `🤖 Generating UNIVERSAL REAL-TIME predictions for: ${postcode}`
    );

    // Get enhanced real-time data
    const enhancedData = await getEnhancedPropertyData(postcode);

    // Create universal predictor with real-time data
    const predictor = new UniversalRealTimePredictor(enhancedData);

    // Generate predictions using real data + comprehensive area coverage
    const predictions = await predictor.generatePredictions(postcode);
    const riskScore = predictor.calculateRisk(predictions, postcode);
    const recommendation = predictor.generateRecommendation(
      predictions,
      riskScore,
      postcode
    );

    res.status(200).json({
      success: true,
      postcode: postcode.toUpperCase(),
      predictions: predictions,
      riskScore: riskScore,
      recommendation: recommendation,
      areaInfo: predictor.getAreaInfo(postcode),
      realTimeData: {
        economic: enhancedData.economicData,
        recentSales: enhancedData.recentSales?.slice(0, 5),
        crimeData: enhancedData.crimeData,
        enhancedMetrics: enhancedData.enhancedMetrics,
      },
      dataQuality: enhancedData.dataQuality,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Universal real-time prediction error:", error);

    // Fallback to basic universal predictor
    try {
      console.log("🔄 Falling back to universal predictor...");
      const fallbackPredictor = new UniversalUKPredictor();
      const predictions = await fallbackPredictor.generatePredictions(postcode);
      const riskScore = fallbackPredictor.calculateRisk(predictions, postcode);
      const recommendation = fallbackPredictor.generateRecommendation(
        predictions,
        riskScore,
        postcode
      );

      res.status(200).json({
        success: true,
        postcode: postcode.toUpperCase(),
        predictions: predictions,
        riskScore: riskScore,
        recommendation: recommendation,
        areaInfo: fallbackPredictor.getAreaInfo(postcode),
        dataSource: "fallback",
        error: "Real-time data unavailable, using comprehensive estimates",
        generatedAt: new Date().toISOString(),
      });
    } catch (fallbackError) {
      res.status(500).json({
        success: false,
        error: fallbackError.message,
        postcode: req.query.postcode,
      });
    }
  }
}

class UniversalRealTimePredictor {
  constructor(enhancedData) {
    this.enhancedData = enhancedData;
    this.economicData = enhancedData.economicData;
    this.recentSales = enhancedData.recentSales || [];
    this.crimeData = enhancedData.crimeData;
    this.enhancedMetrics = enhancedData.enhancedMetrics || {};

    // Comprehensive UK area data for ANY postcode
    this.areaData = this.initializeComprehensiveUKAreaData();
  }

  initializeComprehensiveUKAreaData() {
    return {
      // London areas - COMPLETE COVERAGE
      E: {
        region: "London East",
        basePrice: 520000,
        growthRate: 4.2,
        yield: 3.8,
        riskFactor: 1.1,
      },
      EC: {
        region: "London City",
        basePrice: 780000,
        growthRate: 3.8,
        yield: 3.2,
        riskFactor: 0.9,
      },
      N: {
        region: "London North",
        basePrice: 610000,
        growthRate: 4.0,
        yield: 3.5,
        riskFactor: 1.0,
      },
      NW: {
        region: "London Northwest",
        basePrice: 690000,
        growthRate: 3.9,
        yield: 3.4,
        riskFactor: 0.95,
      },
      SE: {
        region: "London Southeast",
        basePrice: 480000,
        growthRate: 4.3,
        yield: 4.1,
        riskFactor: 1.05,
      },
      SW: {
        region: "London Southwest",
        basePrice: 750000,
        growthRate: 3.7,
        yield: 3.1,
        riskFactor: 0.9,
      },
      W: {
        region: "London West",
        basePrice: 820000,
        growthRate: 3.5,
        yield: 2.9,
        riskFactor: 0.85,
      },
      WC: {
        region: "London West Central",
        basePrice: 950000,
        growthRate: 3.2,
        yield: 2.8,
        riskFactor: 0.8,
      },

      // Major English cities
      M: {
        region: "Manchester",
        basePrice: 280000,
        growthRate: 5.2,
        yield: 5.8,
        riskFactor: 1.3,
      },
      B: {
        region: "Birmingham",
        basePrice: 240000,
        growthRate: 4.8,
        yield: 6.2,
        riskFactor: 1.4,
      },
      L: {
        region: "Liverpool",
        basePrice: 180000,
        growthRate: 5.5,
        yield: 7.1,
        riskFactor: 1.6,
      },
      LS: {
        region: "Leeds",
        basePrice: 220000,
        growthRate: 4.9,
        yield: 6.0,
        riskFactor: 1.3,
      },
      S: {
        region: "Sheffield",
        basePrice: 195000,
        growthRate: 4.7,
        yield: 6.8,
        riskFactor: 1.4,
      },
      NG: {
        region: "Nottingham",
        basePrice: 210000,
        growthRate: 4.5,
        yield: 6.3,
        riskFactor: 1.35,
      },
      LE: {
        region: "Leicester",
        basePrice: 200000,
        growthRate: 4.6,
        yield: 6.5,
        riskFactor: 1.4,
      },
      CV: {
        region: "Coventry",
        basePrice: 240000,
        growthRate: 4.5,
        yield: 6.0,
        riskFactor: 1.3,
      },
      WV: {
        region: "Wolverhampton",
        basePrice: 190000,
        growthRate: 4.7,
        yield: 6.7,
        riskFactor: 1.45,
      },
      WS: {
        region: "Walsall",
        basePrice: 185000,
        growthRate: 4.6,
        yield: 6.9,
        riskFactor: 1.5,
      },

      // Scotland - COMPLETE COVERAGE
      G: {
        region: "Glasgow",
        basePrice: 170000,
        growthRate: 3.8,
        yield: 7.2,
        riskFactor: 1.5,
      },
      EH: {
        region: "Edinburgh",
        basePrice: 350000,
        growthRate: 4.1,
        yield: 5.1,
        riskFactor: 1.1,
      },
      AB: {
        region: "Aberdeen",
        basePrice: 280000,
        growthRate: 2.9,
        yield: 5.8,
        riskFactor: 1.8,
      },
      DD: {
        region: "Dundee",
        basePrice: 160000,
        growthRate: 3.5,
        yield: 7.5,
        riskFactor: 1.6,
      },
      FK: {
        region: "Falkirk",
        basePrice: 145000,
        growthRate: 3.2,
        yield: 7.8,
        riskFactor: 1.7,
      },
      KY: {
        region: "Kirkcaldy",
        basePrice: 140000,
        growthRate: 3.0,
        yield: 8.0,
        riskFactor: 1.8,
      },
      PA: {
        region: "Paisley",
        basePrice: 155000,
        growthRate: 3.4,
        yield: 7.6,
        riskFactor: 1.6,
      },
      PH: {
        region: "Perth",
        basePrice: 185000,
        growthRate: 3.6,
        yield: 6.9,
        riskFactor: 1.4,
      },

      // Wales - COMPLETE COVERAGE
      CF: {
        region: "Cardiff",
        basePrice: 280000,
        growthRate: 4.2,
        yield: 5.5,
        riskFactor: 1.2,
      },
      SA: {
        region: "Swansea",
        basePrice: 180000,
        growthRate: 3.8,
        yield: 6.8,
        riskFactor: 1.5,
      },
      NP: {
        region: "Newport",
        basePrice: 220000,
        growthRate: 4.0,
        yield: 6.1,
        riskFactor: 1.3,
      },
      LL: {
        region: "Llandudno",
        basePrice: 200000,
        growthRate: 3.5,
        yield: 6.5,
        riskFactor: 1.4,
      },
      SY: {
        region: "Shrewsbury",
        basePrice: 240000,
        growthRate: 3.7,
        yield: 5.9,
        riskFactor: 1.2,
      },

      // Northern England
      NE: {
        region: "Newcastle",
        basePrice: 190000,
        growthRate: 4.3,
        yield: 6.9,
        riskFactor: 1.4,
      },
      SR: {
        region: "Sunderland",
        basePrice: 150000,
        growthRate: 4.1,
        yield: 7.8,
        riskFactor: 1.7,
      },
      DL: {
        region: "Darlington",
        basePrice: 165000,
        growthRate: 3.9,
        yield: 7.2,
        riskFactor: 1.5,
      },
      TS: {
        region: "Cleveland",
        basePrice: 145000,
        growthRate: 4.0,
        yield: 8.1,
        riskFactor: 1.8,
      },
      DH: {
        region: "Durham",
        basePrice: 175000,
        growthRate: 4.2,
        yield: 7.0,
        riskFactor: 1.4,
      },

      // Southwest England
      BS: {
        region: "Bristol",
        basePrice: 380000,
        growthRate: 4.4,
        yield: 4.8,
        riskFactor: 1.1,
      },
      BA: {
        region: "Bath",
        basePrice: 520000,
        growthRate: 3.6,
        yield: 3.9,
        riskFactor: 0.95,
      },
      EX: {
        region: "Exeter",
        basePrice: 320000,
        growthRate: 4.0,
        yield: 5.2,
        riskFactor: 1.15,
      },
      PL: {
        region: "Plymouth",
        basePrice: 220000,
        growthRate: 3.8,
        yield: 6.1,
        riskFactor: 1.3,
      },
      TR: {
        region: "Truro",
        basePrice: 280000,
        growthRate: 3.5,
        yield: 5.8,
        riskFactor: 1.2,
      },
      TQ: {
        region: "Torquay",
        basePrice: 250000,
        growthRate: 3.6,
        yield: 5.9,
        riskFactor: 1.25,
      },

      // Southeast England
      BN: {
        region: "Brighton",
        basePrice: 480000,
        growthRate: 3.9,
        yield: 4.2,
        riskFactor: 1.05,
      },
      GU: {
        region: "Guildford",
        basePrice: 620000,
        growthRate: 3.4,
        yield: 3.6,
        riskFactor: 0.9,
      },
      RG: {
        region: "Reading",
        basePrice: 450000,
        growthRate: 3.7,
        yield: 4.1,
        riskFactor: 1.0,
      },
      SL: {
        region: "Slough",
        basePrice: 420000,
        growthRate: 3.8,
        yield: 4.3,
        riskFactor: 1.05,
      },
      OX: {
        region: "Oxford",
        basePrice: 580000,
        growthRate: 3.5,
        yield: 3.8,
        riskFactor: 0.95,
      },
      HP: {
        region: "High Wycombe",
        basePrice: 480000,
        growthRate: 3.6,
        yield: 4.0,
        riskFactor: 1.0,
      },
      MK: {
        region: "Milton Keynes",
        basePrice: 360000,
        growthRate: 4.1,
        yield: 4.8,
        riskFactor: 1.15,
      },

      // East England
      CB: {
        region: "Cambridge",
        basePrice: 580000,
        growthRate: 3.5,
        yield: 3.8,
        riskFactor: 0.9,
      },
      NR: {
        region: "Norwich",
        basePrice: 260000,
        growthRate: 4.0,
        yield: 5.7,
        riskFactor: 1.2,
      },
      IP: {
        region: "Ipswich",
        basePrice: 240000,
        growthRate: 3.8,
        yield: 5.9,
        riskFactor: 1.25,
      },
      PE: {
        region: "Peterborough",
        basePrice: 210000,
        growthRate: 4.2,
        yield: 6.3,
        riskFactor: 1.3,
      },
      LU: {
        region: "Luton",
        basePrice: 320000,
        growthRate: 4.0,
        yield: 5.1,
        riskFactor: 1.2,
      },

      // East Midlands
      DE: {
        region: "Derby",
        basePrice: 195000,
        growthRate: 4.4,
        yield: 6.6,
        riskFactor: 1.35,
      },
      NN: {
        region: "Northampton",
        basePrice: 250000,
        growthRate: 4.1,
        yield: 5.8,
        riskFactor: 1.25,
      },

      // West Midlands
      DY: {
        region: "Dudley",
        basePrice: 200000,
        growthRate: 4.6,
        yield: 6.5,
        riskFactor: 1.4,
      },
      WR: {
        region: "Worcester",
        basePrice: 230000,
        growthRate: 4.2,
        yield: 6.0,
        riskFactor: 1.3,
      },

      // Yorkshire
      HU: {
        region: "Hull",
        basePrice: 140000,
        growthRate: 4.8,
        yield: 8.2,
        riskFactor: 1.7,
      },
      YO: {
        region: "York",
        basePrice: 290000,
        growthRate: 4.0,
        yield: 5.5,
        riskFactor: 1.2,
      },
      HX: {
        region: "Halifax",
        basePrice: 165000,
        growthRate: 4.5,
        yield: 7.1,
        riskFactor: 1.5,
      },
      BD: {
        region: "Bradford",
        basePrice: 155000,
        growthRate: 4.7,
        yield: 7.5,
        riskFactor: 1.6,
      },
      HD: {
        region: "Huddersfield",
        basePrice: 170000,
        growthRate: 4.4,
        yield: 7.0,
        riskFactor: 1.5,
      },

      // Lancashire
      PR: {
        region: "Preston",
        basePrice: 165000,
        growthRate: 4.6,
        yield: 7.2,
        riskFactor: 1.5,
      },
      BB: {
        region: "Blackburn",
        basePrice: 140000,
        growthRate: 4.8,
        yield: 8.0,
        riskFactor: 1.7,
      },
      BL: {
        region: "Bolton",
        basePrice: 185000,
        growthRate: 4.7,
        yield: 6.8,
        riskFactor: 1.4,
      },
      FY: {
        region: "Blackpool",
        basePrice: 130000,
        growthRate: 4.3,
        yield: 8.5,
        riskFactor: 1.9,
      },

      // Northern Ireland
      BT: {
        region: "Belfast",
        basePrice: 160000,
        growthRate: 4.2,
        yield: 7.3,
        riskFactor: 1.6,
      },

      // Default for any unmatched postcodes
      DEFAULT: {
        region: "UK Average",
        basePrice: 280000,
        growthRate: 4.0,
        yield: 5.5,
        riskFactor: 1.2,
      },
    };
  }

  getAreaInfo(postcode) {
    const areaCode = this.extractAreaCode(postcode);
    const areaData = this.areaData[areaCode] || this.areaData["DEFAULT"];

    return {
      areaCode: areaCode,
      region: areaData.region,
      coverage: areaCode === "DEFAULT" ? "estimated" : "detailed",
      dataQuality: this.getDataQualityScore(),
    };
  }

  extractAreaCode(postcode) {
    const cleaned = postcode.replace(/\s+/g, "").toUpperCase();

    // Try 2-letter codes first (like SW, NW, etc.)
    const twoLetter = cleaned.substring(0, 2);
    if (this.areaData[twoLetter] && /^[A-Z]{2}/.test(twoLetter)) {
      return twoLetter;
    }

    // Try 1-letter codes (like M, B, L, etc.)
    const oneLetter = cleaned.substring(0, 1);
    if (this.areaData[oneLetter] && /^[A-Z]/.test(oneLetter)) {
      return oneLetter;
    }

    return "DEFAULT";
  }

  async generatePredictions(postcode) {
    console.log("📊 Generating UNIVERSAL predictions with REAL-TIME data...");

    const areaCode = this.extractAreaCode(postcode);
    const areaData = this.areaData[areaCode] || this.areaData["DEFAULT"];

    // Use real data when available, fallback to comprehensive area estimates
    const basePrice = this.enhancedMetrics.averagePrice || areaData.basePrice;
    const currentYield = this.calculateCurrentYield(basePrice, areaCode);

    const predictions = [];
    let currentPrice = basePrice;

    console.log(
      `🏘️ Area: ${
        areaData.region
      }, Base Price: £${basePrice.toLocaleString()}, Coverage: ${
        areaCode === "DEFAULT" ? "estimated" : "detailed"
      }`
    );

    for (let year = 1; year <= 5; year++) {
      // Enhanced growth calculation with real economic data + comprehensive area data
      const baseGrowth = this.calculateUniversalGrowth(areaCode, year);
      const economicAdjustment = this.calculateRealEconomicAdjustment(year);
      const marketConditionsAdjustment = this.calculateMarketConditions(year);
      const localFactorsAdjustment = this.calculateLocalFactors(postcode, year);

      const totalGrowth =
        (baseGrowth +
          economicAdjustment +
          marketConditionsAdjustment +
          localFactorsAdjustment) *
        Math.pow(0.94, year - 1);

      currentPrice *= 1 + totalGrowth / 100;

      // Enhanced yield calculation
      const yieldChange = this.calculateYieldChange(totalGrowth, year);
      const predictedYield = Math.max(currentYield + yieldChange, 1.5);

      // Enhanced confidence based on data quality + area coverage
      const confidence = this.calculateUniversalConfidence(year, areaCode);

      predictions.push({
        year: new Date().getFullYear() + year,
        predictedPrice: Math.round(currentPrice),
        priceChangePercent: Math.round(totalGrowth * 100) / 100,
        predictedYield: Math.round(predictedYield * 100) / 100,
        confidence: Math.round(confidence * 100) / 100,
        dataQuality: this.getDataQualityScore(),
        areaCoverage: areaCode === "DEFAULT" ? "estimated" : "detailed",
      });
    }

    return predictions;
  }

  calculateUniversalGrowth(areaCode, year) {
    // Use real price growth from recent sales if available
    if (this.enhancedMetrics.priceGrowth !== undefined) {
      console.log(
        `📈 Using REAL price growth: ${this.enhancedMetrics.priceGrowth.toFixed(
          1
        )}%`
      );
      return this.enhancedMetrics.priceGrowth * Math.pow(0.9, year - 1);
    }

    // Use comprehensive area-specific estimates
    const areaData = this.areaData[areaCode] || this.areaData["DEFAULT"];
    console.log(
      `📊 Using area-specific growth rate: ${areaData.growthRate}% for ${areaData.region}`
    );
    return areaData.growthRate;
  }

  calculateRealEconomicAdjustment(year) {
    if (!this.economicData) return 0;

    console.log("📊 Applying REAL economic factors:", this.economicData);

    // Real interest rate impact (live BoE data)
    const rateImpact = (6 - this.economicData.baseRate) * 0.4;

    // Real inflation impact (live ONS data)
    const inflationImpact = (this.economicData.inflation - 2.5) * 0.25;

    // Real GDP growth impact (live ONS data)
    const gdpImpact = this.economicData.gdpGrowth * 0.6;

    // Real unemployment impact (live ONS data)
    const unemploymentImpact = (5 - this.economicData.unemploymentRate) * 0.2;

    // Time decay for economic effects
    const decay = Math.pow(0.85, year - 1);

    const totalAdjustment =
      (rateImpact - inflationImpact + gdpImpact + unemploymentImpact) * decay;

    console.log(
      `📊 Economic adjustment for year ${year}: ${totalAdjustment.toFixed(2)}%`
    );
    return totalAdjustment;
  }

  calculateMarketConditions(year) {
    // Real crime impact
    let crimeAdjustment = 0;
    if (this.crimeData && this.crimeData.source !== "fallback") {
      const safetyScore = this.enhancedMetrics.crimeImpact?.safetyScore || 5;
      crimeAdjustment = (safetyScore - 5) * 0.2;
      console.log(
        `🚔 REAL crime safety adjustment: ${crimeAdjustment.toFixed(2)}%`
      );
    }

    // Market activity from real sales
    let activityAdjustment = 0;
    if (this.recentSales.length > 0) {
      activityAdjustment = Math.min(this.recentSales.length / 10, 0.5);
      console.log(
        `🏠 REAL market activity adjustment: ${activityAdjustment.toFixed(2)}%`
      );
    }

    return crimeAdjustment + activityAdjustment;
  }

  calculateLocalFactors(postcode, year) {
    const areaCode = this.extractAreaCode(postcode);
    const areaData = this.areaData[areaCode] || this.areaData["DEFAULT"];

    // Property type mix from real sales data
    let propertyMixAdjustment = 0;
    if (this.enhancedMetrics.propertyTypes) {
      const types = this.enhancedMetrics.propertyTypes;

      if (
        types["F"] >
        (types["D"] || 0) + (types["S"] || 0) + (types["T"] || 0)
      ) {
        propertyMixAdjustment -= 0.3;
      }

      if (types["D"] > 0) {
        propertyMixAdjustment += 0.2;
      }

      console.log(
        `🏘️ REAL property mix adjustment: ${propertyMixAdjustment.toFixed(2)}%`
      );
    }

    // Area-specific factors based on comprehensive data
    let areaSpecificAdjustment = 0;

    // London premium/constraint
    const isLondon = ["E", "EC", "N", "NW", "SE", "SW", "W", "WC"].includes(
      areaCode
    );
    if (isLondon) {
      areaSpecificAdjustment += 0.5; // Supply constraint premium
    }

    // High-growth northern cities
    const highGrowthNorth = ["M", "L", "LS", "S", "NE"];
    if (highGrowthNorth.includes(areaCode)) {
      areaSpecificAdjustment += 0.4; // Northern powerhouse effect
    }

    // Scottish cities adjustment
    const scotland = ["G", "EH", "AB", "DD"];
    if (scotland.includes(areaCode)) {
      areaSpecificAdjustment += 0.2; // Scottish market dynamics
    }

    // Welsh cities adjustment
    const wales = ["CF", "SA", "NP"];
    if (wales.includes(areaCode)) {
      areaSpecificAdjustment += 0.3; // Welsh market growth
    }

    console.log(
      `🏴󠁧󠁢󠁥󠁮󠁧󠁿 Area-specific adjustment for ${
        areaData.region
      }: ${areaSpecificAdjustment.toFixed(2)}%`
    );

    return (
      propertyMixAdjustment +
      areaSpecificAdjustment +
      (Math.random() - 0.5) * 0.3
    );
  }

  calculateCurrentYield(basePrice, areaCode) {
    const areaData = this.areaData[areaCode] || this.areaData["DEFAULT"];

    // Use area-specific yield as base
    let baseYield = areaData.yield;

    // Price adjustment (higher prices = lower yields)
    const priceAdjustment =
      basePrice > 500000 ? -1.5 : basePrice < 200000 ? 1.5 : 0;

    return Math.max(baseYield + priceAdjustment, 2.0);
  }

  calculateYieldChange(priceGrowth, year) {
    const baseYieldChange = -priceGrowth * 0.1;
    const rentGrowthAdjustment = priceGrowth * 0.3;

    let rateImpact = 0;
    if (this.economicData) {
      rateImpact = (this.economicData.baseRate - 4) * 0.1;
    }

    return (baseYieldChange + rentGrowthAdjustment + rateImpact) / year;
  }

  calculateUniversalConfidence(year, areaCode) {
    let baseConfidence = 0.9;

    // Reduce confidence over time
    baseConfidence -= year * 0.05;

    // Data quality impact
    const dataQuality = this.getDataQualityScore();
    baseConfidence *= dataQuality;

    // Area coverage impact
    if (areaCode === "DEFAULT") {
      baseConfidence *= 0.75; // Lower confidence for unknown areas
    } else {
      baseConfidence *= 0.95; // High confidence for known areas
    }

    // Real data availability bonus
    if (this.recentSales.length > 5) {
      baseConfidence += 0.05;
    }

    if (
      this.economicData &&
      this.economicData.dataSources.bankRate === "live"
    ) {
      baseConfidence += 0.03;
    }

    return Math.max(Math.min(baseConfidence, 0.95), 0.5);
  }

  getDataQualityScore() {
    let score = 0.7; // Base score

    // Economic data quality
    if (this.economicData) {
      const liveDataSources = Object.values(
        this.economicData.dataSources
      ).filter((source) => source === "live").length;
      score += liveDataSources * 0.05;
    }

    // Recent sales data
    if (this.recentSales.length > 0) {
      score += Math.min(this.recentSales.length / 10, 0.15);
    }

    // Crime data
    if (this.crimeData && this.crimeData.source !== "fallback") {
      score += 0.05;
    }

    return Math.min(score, 1.0);
  }

  // Enhanced risk calculation
  calculateRisk(predictions, postcode) {
    const areaCode = this.extractAreaCode(postcode);
    const areaData = this.areaData[areaCode] || this.areaData["DEFAULT"];

    const avgGrowth =
      predictions.reduce((sum, p) => sum + p.priceChangePercent, 0) /
      predictions.length;
    const volatility = this.calculateVolatility(
      predictions.map((p) => p.priceChangePercent)
    );

    let risk = 5; // Base risk

    // Area-specific risk from comprehensive data
    risk += (areaData.riskFactor - 1) * 3;

    // Growth risk
    if (avgGrowth > 6) risk += 1.5;
    if (avgGrowth < 1) risk += 2;

    // Volatility risk
    risk += volatility * 0.5;

    // Real economic data risk adjustments
    if (this.economicData) {
      if (this.economicData.baseRate > 6) risk += 1;
      if (this.economicData.inflation > 5) risk += 0.5;
      if (this.economicData.unemploymentRate > 6) risk += 0.5;
    }

    // Crime risk from real data
    if (this.crimeData && this.crimeData.crimeRate > 500) {
      risk += 1;
    }

    // Data uncertainty risk
    const dataQuality = this.getDataQualityScore();
    risk += (1 - dataQuality) * 2;

    // Area coverage uncertainty
    if (areaCode === "DEFAULT") {
      risk += 0.5;
    }

    return Math.min(Math.max(Math.round(risk), 1), 10);
  }

  // Enhanced recommendation
  generateRecommendation(predictions, riskScore, postcode) {
    const areaCode = this.extractAreaCode(postcode);
    const areaData = this.areaData[areaCode] || this.areaData["DEFAULT"];

    const avgGrowth =
      predictions.reduce((sum, p) => sum + p.priceChangePercent, 0) /
      predictions.length;
    const avgYield =
      predictions.reduce((sum, p) => sum + p.predictedYield, 0) /
      predictions.length;

    let score = 5;
    let reasoning = [];

    // Growth analysis
    if (avgGrowth > 5) {
      score += 2;
      reasoning.push("Strong growth potential identified");
    } else if (avgGrowth > 3) {
      score += 1;
      reasoning.push("Moderate growth expected");
    } else if (avgGrowth < 1) {
      score -= 2;
      reasoning.push("Limited growth potential");
    }

    // Yield analysis
    if (avgYield > 6) {
      score += 2;
      reasoning.push("Excellent rental yield opportunity");
    } else if (avgYield > 4.5) {
      score += 1;
      reasoning.push("Good rental yield potential");
    } else if (avgYield < 3) {
      score -= 1;
      reasoning.push("Lower rental yield expected");
    }

    // Risk analysis
    if (riskScore < 4) {
      score += 1;
      reasoning.push("Low risk investment");
    } else if (riskScore > 7) {
      score -= 2;
      reasoning.push("Higher risk investment");
    } else {
      reasoning.push("Moderate risk level");
    }

    // Real economic factors
    if (this.economicData) {
      if (this.economicData.baseRate < 4) {
        score += 0.5;
        reasoning.push("Favorable interest rate environment");
      } else if (this.economicData.baseRate > 6) {
        score -= 0.5;
        reasoning.push("High interest rate headwind");
      }

      if (this.economicData.inflation < 3) {
        reasoning.push("Stable inflation environment");
      } else if (this.economicData.inflation > 5) {
        score -= 0.5;
        reasoning.push("High inflation concern");
      }
    }

    // Area-specific insights
    if (areaData.region.includes("London")) {
      reasoning.push("London market premium");
    }

    if (["M", "L", "LS", "S"].includes(areaCode)) {
      reasoning.push("Northern powerhouse growth area");
    }

    if (["G", "EH"].includes(areaCode)) {
      reasoning.push("Major Scottish city market");
    }

    if (["CF", "SA"].includes(areaCode)) {
      reasoning.push("Welsh capital region");
    }

    // Real market activity
    if (this.recentSales.length > 10) {
      reasoning.push("Active local market with real sales data");
      score += 0.3;
    } else if (this.recentSales.length < 3) {
      reasoning.push("Limited recent market activity");
      score -= 0.2;
    }

    // Crime impact
    if (this.crimeData && this.crimeData.source !== "fallback") {
      const safetyScore = this.enhancedMetrics.crimeImpact?.safetyScore || 5;
      if (safetyScore > 7) {
        reasoning.push("Low crime area advantage");
      } else if (safetyScore < 3) {
        reasoning.push("Higher crime area concern");
        score -= 0.5;
      }
    }

    // Data quality
    const dataQuality = this.getDataQualityScore();
    if (dataQuality > 0.8) {
      reasoning.push("Based on comprehensive real-time analysis");
    } else if (areaCode === "DEFAULT") {
      reasoning.push("Estimate based on UK averages");
    } else {
      reasoning.push("Based on detailed area analysis");
    }

    // Generate recommendation
    let recommendation = "HOLD";
    if (score >= 7.5) recommendation = "STRONG BUY";
    else if (score >= 6) recommendation = "BUY";
    else if (score <= 3) recommendation = "SELL";
    else if (score <= 2) recommendation = "STRONG SELL";

    return {
      recommendation: recommendation,
      score: Math.round(score * 10) / 10,
      reasoning: reasoning,
      confidence: Math.round((10 - riskScore) * 8 + dataQuality * 20),
      dataQuality: Math.round(dataQuality * 100),
      areaSpecific: areaData.region,
      areaCoverage: areaCode === "DEFAULT" ? "estimated" : "detailed",
      economicContext: this.economicData
        ? `Base rate: ${this.economicData.baseRate}%, Inflation: ${this.economicData.inflation}%`
        : "Economic data unavailable",
    };
  }

  calculateVolatility(values) {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map((val) => Math.pow(val - mean, 2));
    return Math.sqrt(
      squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length
    );
  }
}

// Fallback universal predictor (for when real-time fails)
class UniversalUKPredictor {
  constructor() {
    this.areaData = {
      M: {
        region: "Manchester",
        basePrice: 280000,
        growthRate: 5.2,
        yield: 5.8,
        riskFactor: 1.3,
      },
      SW: {
        region: "London Southwest",
        basePrice: 750000,
        growthRate: 3.7,
        yield: 3.1,
        riskFactor: 0.9,
      },
      B: {
        region: "Birmingham",
        basePrice: 240000,
        growthRate: 4.8,
        yield: 6.2,
        riskFactor: 1.4,
      },
      L: {
        region: "Liverpool",
        basePrice: 180000,
        growthRate: 5.5,
        yield: 7.1,
        riskFactor: 1.6,
      },
      G: {
        region: "Glasgow",
        basePrice: 170000,
        growthRate: 3.8,
        yield: 7.2,
        riskFactor: 1.5,
      },
      EH: {
        region: "Edinburgh",
        basePrice: 350000,
        growthRate: 4.1,
        yield: 5.1,
        riskFactor: 1.1,
      },
      CF: {
        region: "Cardiff",
        basePrice: 280000,
        growthRate: 4.2,
        yield: 5.5,
        riskFactor: 1.2,
      },
      BT: {
        region: "Belfast",
        basePrice: 160000,
        growthRate: 4.2,
        yield: 7.3,
        riskFactor: 1.6,
      },
      DEFAULT: {
        region: "UK Average",
        basePrice: 280000,
        growthRate: 4.0,
        yield: 5.5,
        riskFactor: 1.2,
      },
    };
  }

  getAreaInfo(postcode) {
    const areaCode = this.extractAreaCode(postcode);
    const areaData = this.areaData[areaCode] || this.areaData["DEFAULT"];

    return {
      areaCode: areaCode,
      region: areaData.region,
      coverage: "fallback",
    };
  }

  extractAreaCode(postcode) {
    const cleaned = postcode.replace(/\s+/g, "").toUpperCase();
    const twoLetter = cleaned.substring(0, 2);
    const oneLetter = cleaned.substring(0, 1);

    if (this.areaData[twoLetter]) return twoLetter;
    if (this.areaData[oneLetter]) return oneLetter;
    return "DEFAULT";
  }

  async generatePredictions(postcode) {
    const areaCode = this.extractAreaCode(postcode);
    const areaData = this.areaData[areaCode] || this.areaData["DEFAULT"];

    const predictions = [];
    for (let year = 1; year <= 5; year++) {
      predictions.push({
        year: new Date().getFullYear() + year,
        predictedPrice: areaData.basePrice + year * 15000,
        priceChangePercent: areaData.growthRate * Math.pow(0.9, year - 1),
        predictedYield: areaData.yield,
        confidence: 0.7,
      });
    }
    return predictions;
  }

  calculateRisk(predictions, postcode) {
    const areaCode = this.extractAreaCode(postcode);
    const areaData = this.areaData[areaCode] || this.areaData["DEFAULT"];
    return Math.round(areaData.riskFactor * 5);
  }

  generateRecommendation(predictions, riskScore, postcode) {
    const areaCode = this.extractAreaCode(postcode);
    const areaData = this.areaData[areaCode] || this.areaData["DEFAULT"];

    return {
      recommendation: "HOLD",
      score: 5,
      reasoning: ["Fallback estimates for " + areaData.region],
      confidence: 70,
      areaSpecific: areaData.region,
    };
  }
}

// UK postcode validation
function isValidUKPostcode(postcode) {
  const ukPostcodeRegex = /^[A-Z]{1,2}[0-9]{1,2}[A-Z]?\s?[0-9][A-Z]{2}$/i;
  const outwardOnly = /^[A-Z]{1,2}[0-9]{1,2}[A-Z]?$/i;

  const cleaned = postcode.replace(/\s+/g, "").toUpperCase();

  return ukPostcodeRegex.test(postcode) || outwardOnly.test(cleaned);
}
