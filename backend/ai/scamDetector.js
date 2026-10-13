// Core Multi-Modal AI Rental Scam Detector Engine (Node.js)

const nlpClassifier = require('./nlpClassifier');
const patternDetector = require('./patternDetector');
const { marketEngine, MARKET_BENCHMARKS } = require('./marketBenchmark');

class ScamDetector {
  analyzeListing(data) {
    const title = (data.title || '').trim();
    const description = (data.description || '').trim();
    const city = data.city || 'New York';
    const rent = parseFloat(data.rent) || 0;
    const deposit = parseFloat(data.deposit) || 0;
    const bedrooms = parseInt(data.bedrooms, 10) || 1;
    const bathrooms = parseFloat(data.bathrooms) || 1.0;
    const sqft = parseFloat(data.sqft) || 750;
    const contactEmail = (data.contact_email || '').trim();

    const fullText = `${title} ${description}`;

    // 1. NLP Semantic Classification
    const nlpScore = nlpClassifier.predictScamProbability(fullText);

    // 2. Behavioral Patterns & Red Flags
    const patternAnalysis = patternDetector.analyze(fullText, contactEmail);

    // 3. Fair Market Price Benchmark & Anomaly
    const benchmark = marketEngine.getBenchmark(city, bedrooms, sqft);
    const priceAnalysis = marketEngine.analyzePrice(rent, deposit, benchmark);

    // Combine red flags from pattern miner + price anomaly
    const allFlags = [...patternAnalysis.flags, ...priceAnalysis.flags];

    // Combine trust signals
    const trustSignals = [...patternAnalysis.trustSignals];
    if (priceAnalysis.status === 'FAIR_MARKET') {
      trustSignals.push(`Rent is within fair market range ($${benchmark.fair_min.toLocaleString()} - $${benchmark.fair_max.toLocaleString()}/mo)`);
    }

    // 4. Multi-Vector Ensemble Scoring
    // Weights: NLP Classifier 35%, Red Flag Penalties 35%, Price Anomaly 30%
    let rawScore = (
      (nlpScore * 0.35) +
      (patternAnalysis.penaltyScore * 0.35) +
      (priceAnalysis.anomalyScore * 0.30)
    );

    // If critical red flags exist (wire transfer, refusal of tour, 50% discount), enforce high-risk floor
    const hasCriticalFlag = allFlags.some(f => f.severity === 'CRITICAL');
    if (hasCriticalFlag) {
      rawScore = Math.max(0.72, rawScore);
    }

    // If zero flags and verified trust signals exist, reduce risk
    if (allFlags.length === 0 && trustSignals.length > 0) {
      rawScore = Math.max(0.04, rawScore * 0.35);
    }

    const overallRiskScore = Math.round(Math.min(99.0, Math.max(1.0, rawScore * 100)) * 10) / 10;

    // 5. Risk Categorization
    let riskLevel = 'LOW RISK';
    let verdict = 'LIKELY LEGITIMATE';
    let verdictBadge = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
    let recommendation = 'This listing matches standard legitimate rental patterns. Always follow general safety practices when signing leases.';

    if (overallRiskScore >= 65.0) {
      riskLevel = 'HIGH RISK';
      verdict = 'PROBABLE SCAM';
      verdictBadge = 'bg-rose-500/20 text-rose-400 border-rose-500/40';
      recommendation = 'DO NOT SEND MONEY OR PERSONAL DETAILS. This listing exhibits multiple confirmed characteristics of rental fraud.';
    } else if (overallRiskScore >= 35.0) {
      riskLevel = 'MODERATE RISK';
      verdict = 'SUSPICIOUS - PROCEED WITH CAUTION';
      verdictBadge = 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      recommendation = 'Caution required. Demand a verified in-person tour and never wire funds before reviewing an official lease agreement.';
    }

    // Tenant Safety Checklist
    const hasPaymentFlag = allFlags.some(f => f.category.toLowerCase().includes('payment'));
    const hasTourFlag = allFlags.some(f => f.category.toLowerCase().includes('viewing'));

    const checklist = [
      {
        item: "Never wire money or pay with gift cards, Zelle, or crypto.",
        status: hasPaymentFlag ? 'danger' : 'standard'
      },
      {
        item: "Never rent without touring the interior in person or via live video call with agent inside.",
        status: hasTourFlag ? 'danger' : 'standard'
      },
      {
        item: "Cross-check property ownership on the county tax assessor/cadastre records.",
        status: 'standard'
      },
      {
        item: "Reverse image search property photos to check for duplicate listings in other cities.",
        status: 'recommended'
      },
      {
        item: "Insist on a formal written lease agreement before paying any holding deposit.",
        status: 'standard'
      }
    ];

    return {
      overall_risk_score: overallRiskScore,
      risk_level: riskLevel,
      verdict,
      verdict_badge: verdictBadge,
      recommendation,
      scores_breakdown: {
        nlp_model_score: Math.round(nlpScore * 1000) / 10,
        pattern_flag_score: Math.round(patternAnalysis.penaltyScore * 1000) / 10,
        price_anomaly_score: Math.round(priceAnalysis.anomalyScore * 1000) / 10
      },
      market_benchmark: {
        city: benchmark.city,
        listed_rent: rent,
        fair_min: benchmark.fair_min,
        fair_avg: benchmark.fair_avg,
        fair_max: benchmark.fair_max,
        diff_percent: priceAnalysis.diffPercent,
        status: priceAnalysis.status
      },
      red_flags: allFlags,
      trust_signals: trustSignals,
      safety_checklist: checklist
    };
  }
}

module.exports = {
  scamDetector: new ScamDetector(),
  MARKET_BENCHMARKS
};
