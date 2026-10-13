# 🛡️ RentGuard AI — AI-Based Rental Scam Detection System

An end-to-end full-stack application designed to protect prospective tenants from rental fraud, phantom listings, wire-transfer advance deposit schemes, and predatory landlords using **AI, Natural Language Processing (NLP), and Market Price Anomaly Regression**.

Built **without Python** — powered entirely by **Node.js, Express, Modern JavaScript, and Tailwind CSS**.

---

## 🚀 Key Features

- **🧠 Multi-Modal AI & Machine Learning Engine**:
  - **NLP Semantic Classifier**: Bayesian linguistic probability model trained on real-world rental scam narratives vs. legitimate listings.
  - **Market Price Anomaly Regression**: Automatically calculates the fair market rent range for cities (New York, San Francisco, Seattle, Boston, Chicago, Austin, Denver, Miami, Los Angeles, etc.) and flags severe "Too Good To Be True" discounts.
  - **Behavioral Fraud Miner**: Identifies high-risk payment patterns (Western Union, MoneyGram, Zelle, Bitcoin, Apple Gift Cards) and absentee landlord excuses ("missionary in West Africa", "keys will be mailed", "military deployment", "look through the window").
- **⚡ Interactive Web Frontend**:
  - **Real-time Circular Risk Gauge** (0% to 100% Risk Score).
  - **Visual Diagnostic Sub-Scores** (NLP Score, Behavioral Pattern Score, Market Anomaly Score).
  - **Explainable AI (XAI) Cards**: Pinpoints the exact suspicious phrases and terms detected in the text with severity ratings.
  - **Market Benchmark Deviation Bar**: Compares listed rent to fair market average.
  - **Tenant Protection Action Checklist**: Dynamic safety checklist tailored to listing risk.
  - **One-Click Demo Presets**: Test real scam scenarios and verified listings with a single click.
  - **Community Scam Reporting Modal**: Integrated reporting mechanism for known fraudulent listings.

---

## 📁 Project Structure

```
ai based rental scam detection/
├── backend/
│   ├── ai/
│   │   ├── nlpClassifier.js        # Bayesian NLP Semantic Classifier
│   │   ├── patternDetector.js      # Behavioral & payment red flag miner
│   │   ├── marketBenchmark.js      # Fair market baseline regression & anomaly engine
│   │   └── scamDetector.js         # Multi-vector ensemble aggregator
│   ├── server.js                   # Express REST API & static server
│   └── package.json                # Backend dependencies (Express, Cors)
├── frontend/
│   ├── index.html                  # Responsive modern dark-mode dashboard
│   ├── style.css                   # Glassmorphism, animations, gauges
│   └── app.js                      # Client logic, API integration, visualization
├── package.json                    # Root package configuration
├── run_project.bat                 # One-click Windows launcher
└── README.md                       # Documentation
```

---

## 🛠️ Quick Start & How to Run

### Prerequisites
- **Node.js** (v18 or higher — already verified on your system)

### Run with 1 Command:

From the project root folder:

```bash
node backend/server.js
```

Or on Windows, simply double-click:
```
run_project.bat
```

### Access the Application:
Open your web browser and go to:
👉 **[http://localhost:5000](http://localhost:5000)**

---

## 📡 REST API Documentation

### 1. Analyze Listing for Scam Risk
- **Endpoint**: `POST /api/predict`
- **Request Body**:
```json
{
  "title": "Stunning 2 Bedroom Luxury Apartment In City Center",
  "description": "Rent is $650/mo. I am currently out of the country on a missionary work in Africa. Wire deposit via Western Union and I will FedEx the keys.",
  "rent": 650,
  "deposit": 650,
  "city": "New York",
  "bedrooms": 2,
  "bathrooms": 2,
  "sqft": 1100,
  "contact_email": "rev.missionary@gmail.com"
}
```
- **Response**:
```json
{
  "overall_risk_score": 73.0,
  "risk_level": "HIGH RISK",
  "verdict": "PROBABLE SCAM",
  "recommendation": "DO NOT SEND MONEY OR PERSONAL DETAILS...",
  "scores_breakdown": {
    "nlp_model_score": 92.5,
    "pattern_flag_score": 70.0,
    "price_anomaly_score": 95.0
  },
  "market_benchmark": {
    "city": "New York",
    "listed_rent": 650,
    "fair_avg": 4200,
    "diff_percent": -84.5,
    "status": "EXTREMELY_LOW"
  },
  "red_flags": [...],
  "trust_signals": [],
  "safety_checklist": [...]
}
```

### 2. Service Health
- **Endpoint**: `GET /api/health`
- **Response**:
```json
{
  "status": "online",
  "runtime": "Node.js",
  "version": "v24.18.0",
  "service": "AI Rental Scam Detection Engine"
}
```

### 3. Preset Test Samples
- **Endpoint**: `GET /api/samples`

### 4. City Benchmarks
- **Endpoint**: `GET /api/benchmarks`

### 5. Report Scam Listing
- **Endpoint**: `POST /api/report-scam`

---

## 🧪 Included Test Presets

Try these built-in test buttons inside the UI:
1. **🚨 Wire Scam**: Foreign landlord, Western Union wire transfer, mail keys, 80% discount.
2. **🚨 Penthouse Bait**: Luxury penthouse at $800, crypto/Zelle upfront, no interior tours.
3. **✅ Verified Legit Listing**: Market rate, standard lease, TransUnion background check, in-person tour.
4. **⚠️ Sublease**: Short term sublet with mild cautions.
