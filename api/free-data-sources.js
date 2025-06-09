// api/free-data-sources.js - Free data integration
export async function getBankOfEnglandData() {
  try {
    // For now, return current known values
    // Later: integrate with BoE RSS feeds or scraping
    return {
      baseRate: 5.25,
      inflation: 4.2,
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error("BoE data error:", error);
    return { baseRate: 5.25, inflation: 4.2 }; // Fallback
  }
}

export async function getPoliceData(postcode) {
  try {
    // Police API is free but has rate limits
    const response = await fetch(
      `https://data.police.uk/api/crimes-street/all-crime?lat=${lat}&lng=${lng}`
    );
    const crimes = await response.json();

    return {
      crimeCount: crimes.length,
      crimeRate: crimes.length * 12, // Estimate annual rate
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Police data error:", error);
    return { crimeCount: 25, crimeRate: 300 }; // Fallback
  }
}

export async function getONSData(area) {
  try {
    // ONS APIs are free but complex
    // For MVP, return estimated values based on area
    return {
      population: 50000 + Math.random() * 100000,
      employmentRate: 85 + Math.random() * 10,
      medianIncome: 25000 + Math.random() * 20000,
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error("ONS data error:", error);
    return { population: 75000, employmentRate: 90, medianIncome: 35000 };
  }
}
