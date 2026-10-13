// AI Rental Scam Detection Server (Node.js & Express)

const express = require('express');
const cors = require('cors');
const path = require('path');
const { scamDetector, MARKET_BENCHMARKS } = require('./ai/scamDetector');

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_DIR = path.join(__dirname, '..', 'frontend');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(FRONTEND_DIR));

// In-memory store for community scam reports
const communityReports = [];

// Sample listings for instant testing
const SAMPLE_LISTINGS = [
  {
    id: "sample-1",
    label: "🚨 Wire Scam (Missionary Abroad)",
    type: "scam",
    data: {
      title: "Stunning 2 Bedroom Luxury Apartment In City Center - Urgent Move In",
      description: "Beautiful 2 bed 2 bath apartment fully furnished. Rent is only $650 per month including all utilities, wifi and parking. I am currently out of the country on a missionary work in West Africa with my family so I cannot meet you in person. You cannot view the inside now because I have the keys with me. Just drive by to see the outside. If you are interested, send your deposit of $650 via Western Union or MoneyGram today and I will courier the keys via FedEx directly to you. First come first served, act fast!",
      city: "New York",
      bedrooms: 2,
      bathrooms: 2,
      sqft: 1100,
      rent: 650,
      deposit: 650,
      contact_email: "rev.david.missionary77@gmail.com"
    }
  },
  {
    id: "sample-2",
    label: "🚨 Too Good To Be True (Penthouse Bait)",
    type: "scam",
    data: {
      title: "3BHK Penthouse with Private Balcony - No Credit Check Required",
      description: "Luxurious penthouse in prime location. Price drastically reduced because previous tenant left suddenly. $800/month all inclusive. Do not call my phone, message me on WhatsApp only. I am currently deployed overseas with the military. If you want to secure this place before anyone else, wire $1600 upfront via Zelle or cryptocurrency (Bitcoin). Keys will be mailed as soon as payment is confirmed. Please look through the windows to check the interior.",
      city: "San Francisco",
      bedrooms: 3,
      bathrooms: 2.5,
      sqft: 1800,
      rent: 800,
      deposit: 1600,
      contact_email: "sergeant.johnson.military@fastmail.info"
    }
  },
  {
    id: "sample-3",
    label: "✅ Verified Legitimate Listing",
    type: "legit",
    data: {
      title: "Spacious 2 Bedroom Apartment in Upper East Side",
      description: "Well-maintained 2 bedroom 1 bathroom apartment in prime location. Rent is $3,200 per month. Features hardwood floors, updated kitchen with stainless steel appliances, and ample natural light. In-person showings available Monday through Saturday by appointment. Standard lease agreement, credit check and proof of income required. Security deposit equivalent to one month rent upon lease signing.",
      city: "New York",
      bedrooms: 2,
      bathrooms: 1,
      sqft: 950,
      rent: 3200,
      deposit: 3200,
      contact_email: "leasing@uesapartments-ny.com"
    }
  },
  {
    id: "sample-4",
    label: "⚠️ Sublease with Minor Flags",
    type: "caution",
    data: {
      title: "Cozy Studio Sublet for Summer - Fast Response",
      description: "Subletting my studio apartment for 3 months. $1400/month with utilities. Can arrange viewing this Friday evening. Seeking responsible student or professional. Deposit of $700 required upon agreement. Please text or message via WhatsApp.",
      city: "Boston",
      bedrooms: 0,
      bathrooms: 1,
      sqft: 450,
      rent: 1400,
      deposit: 700,
      contact_email: "student.sublet.boston@gmail.com"
    }
  }
];

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    runtime: 'Node.js',
    version: process.version,
    service: 'AI Rental Scam Detection Engine'
  });
});

// Prediction API
app.post('/api/predict', (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(400).json({ error: 'No input payload provided' });
    }

    const title = (data.title || '').trim();
    const description = (data.description || '').trim();

    if (!title && !description) {
      return res.status(400).json({ error: 'Listing title or description is required' });
    }

    const result = scamDetector.analyzeListing(data);
    return res.json(result);
  } catch (err) {
    console.error('Error during scam prediction:', err);
    return res.status(500).json({ error: 'Internal AI detection error', details: err.message });
  }
});

// Sample Listings API
app.get('/api/samples', (req, res) => {
  res.json({ samples: SAMPLE_LISTINGS });
});

// Market Benchmarks API
app.get('/api/benchmarks', (req, res) => {
  res.json({ benchmarks: MARKET_BENCHMARKS });
});

// Report Scam Endpoint
app.post('/api/report-scam', (req, res) => {
  try {
    const report = req.body;
    communityReports.push(report);
    res.json({
      status: 'success',
      message: 'Scam report successfully submitted to verification database.',
      total_reports: communityReports.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fallback to index.html for all other frontend routes
app.get('*', (req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`\n=======================================================`);
  console.log(`  🛡️  RentGuard AI Server (Node.js & Express)`);
  console.log(`  Listening on: http://localhost:${PORT}`);
  console.log(`  Serving Frontend from: ${FRONTEND_DIR}`);
  console.log(`=======================================================\n`);
});
