// Fair Market Price Benchmarks & Anomaly Detection

const MARKET_BENCHMARKS = {
  "new york": { base_1br: 3100, per_sqft: 3.8, add_per_bed: 1100 },
  "san francisco": { base_1br: 2900, per_sqft: 3.6, add_per_bed: 1000 },
  "boston": { base_1br: 2600, per_sqft: 3.2, add_per_bed: 900 },
  "seattle": { base_1br: 2200, per_sqft: 2.7, add_per_bed: 800 },
  "miami": { base_1br: 2400, per_sqft: 2.9, add_per_bed: 850 },
  "chicago": { base_1br: 1950, per_sqft: 2.3, add_per_bed: 750 },
  "denver": { base_1br: 1850, per_sqft: 2.2, add_per_bed: 700 },
  "austin": { base_1br: 1750, per_sqft: 2.1, add_per_bed: 650 },
  "los angeles": { base_1br: 2500, per_sqft: 3.1, add_per_bed: 950 },
  "default": { base_1br: 1800, per_sqft: 2.0, add_per_bed: 650 }
};

class MarketBenchmarkEngine {
  getBenchmark(city, bedrooms, sqft) {
    const cityKey = (city || 'default').toLowerCase().trim();
    const bench = MARKET_BENCHMARKS[cityKey] || MARKET_BENCHMARKS.default;

    const beds = Math.max(0, parseInt(bedrooms, 10) || 1);
    const sq = Math.max(200, parseFloat(sqft) || 750);

    let estBase;
    if (beds === 0) {
      estBase = bench.base_1br * 0.82; // Studio
    } else if (beds === 1) {
      estBase = bench.base_1br;
    } else {
      estBase = bench.base_1br + ((beds - 1) * bench.add_per_bed);
    }

    const sqftEst = sq * bench.per_sqft;
    const fairAvg = (estBase * 0.6) + (sqftEst * 0.4);

    const fairMin = Math.round((fairAvg * 0.80) / 10) * 10;
    const fairRoundAvg = Math.round(fairAvg / 10) * 10;
    const fairMax = Math.round((fairAvg * 1.25) / 10) * 10;

    return {
      city: city ? (city.charAt(0).toUpperCase() + city.slice(1)) : 'General Market',
      fair_min: fairMin,
      fair_avg: fairRoundAvg,
      fair_max: fairMax
    };
  }

  analyzePrice(rent, deposit, benchmark) {
    const listedRent = parseFloat(rent) || 0;
    const listedDeposit = parseFloat(deposit) || 0;
    const fairAvg = benchmark.fair_avg;
    const fairMin = benchmark.fair_min;

    let anomalyScore = 0.05;
    let status = "NORMAL";
    let diffPercent = 0.0;
    const flags = [];

    if (listedRent > 0 && fairAvg > 0) {
      diffPercent = Math.round(((listedRent - fairAvg) / fairAvg) * 1000) / 10;

      // Extreme discount = "Too Good to be True" bait
      if (listedRent < fairMin * 0.55) {
        anomalyScore = 0.95;
        status = "EXTREMELY_LOW";
        flags.push({
          category: "Price Anomaly: Too Good To Be True",
          explanation: `Listed rent ($${listedRent.toLocaleString()}) is ${Math.abs(diffPercent)}% below the fair market average ($${fairAvg.toLocaleString()}) for ${benchmark.city}. Scammers deliberately use unrealistically low rents to attract desperate renters.`,
          snippet: `Expected: $${benchmark.fair_min.toLocaleString()} - $${benchmark.fair_max.toLocaleString()}/mo | Listed: $${listedRent.toLocaleString()}/mo`,
          severity: "CRITICAL"
        });
      } else if (listedRent < fairMin * 0.75) {
        anomalyScore = 0.60;
        status = "UNUSUALLY_LOW";
        flags.push({
          category: "Price Anomaly: Below Market",
          explanation: `Listed rent ($${listedRent.toLocaleString()}) is significantly below typical rates in this market.`,
          snippet: `Listed: $${listedRent.toLocaleString()}/mo vs Fair Avg: $${fairAvg.toLocaleString()}/mo`,
          severity: "WARNING"
        });
      } else if (listedRent > benchmark.fair_max * 1.4) {
        status = "HIGH";
        anomalyScore = 0.15;
      } else {
        status = "FAIR_MARKET";
        anomalyScore = 0.05;
      }
    }

    // Security deposit check
    if (listedRent > 0 && listedDeposit > 0) {
      const ratio = listedDeposit / listedRent;
      if (ratio > 2.5) {
        flags.push({
          category: "Abnormal Deposit Requested",
          explanation: `Deposit requested ($${listedDeposit.toLocaleString()}) is ${ratio.toFixed(1)}x the monthly rent. Excess upfront deposits are often demanded by scammers.`,
          snippet: `Deposit: $${listedDeposit.toLocaleString()} (${ratio.toFixed(1)}x Rent)`,
          severity: "WARNING"
        });
      }
    }

    return {
      anomalyScore,
      status,
      diffPercent,
      flags
    };
  }
}

module.exports = {
  marketEngine: new MarketBenchmarkEngine(),
  MARKET_BENCHMARKS
};
