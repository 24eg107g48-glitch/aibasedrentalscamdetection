// Behavioral Red Flag & Trust Pattern Mining for Rental Listings

const RED_FLAG_CATEGORIES = {
  "Suspicious Payment Methods": [
    {
      regex: /\b(western union|moneygram|wire transfer|wire money|cashier'?s? check)\b/i,
      explanation: "Demands wire transfer or cashier check before inspection (untraceable, non-refundable)",
      severity: "CRITICAL"
    },
    {
      regex: /\b(zelle|venmo|cashapp|cash app)\b/i,
      explanation: "Requests mobile peer-to-peer transfer to hold or reserve the property without lease execution",
      severity: "CRITICAL"
    },
    {
      regex: /\b(bitcoin|crypto|cryptocurrency|usdt|ethereum)\b/i,
      explanation: "Demands cryptocurrency payment (anonymous and permanent)",
      severity: "CRITICAL"
    },
    {
      regex: /\b(gift card|apple gift card|steam card|ebay card)\b/i,
      explanation: "Demands payment via retail gift cards (hallmark of fraudulent operations)",
      severity: "CRITICAL"
    }
  ],

  "Absentee Landlord & Excuses": [
    {
      regex: /\b(out of (the )?country|relocated abroad|moved to uk|in west africa|overseas|outside the country)\b/i,
      explanation: "Landlord claims to be out of the country/overseas and unable to show the unit",
      severity: "WARNING"
    },
    {
      regex: /\b(missionary|church mission|pastor|voluntary mission|god[- ]fearing)\b/i,
      explanation: "Appeals to religious authority/missionary work to manufacture false moral trust",
      severity: "WARNING"
    },
    {
      regex: /\b(military deployment|deployed overseas|navy deployment)\b/i,
      explanation: "Claims sudden military deployment to justify absence and rushed transaction",
      severity: "WARNING"
    },
    {
      regex: /\b(hospitalized abroad|medical emergency abroad|treatment abroad)\b/i,
      explanation: "Cites overseas medical emergency as an excuse for avoiding in-person interaction",
      severity: "WARNING"
    }
  ],

  "Viewing Denial & Mail-Key Schemes": [
    {
      regex: /\b(cannot (meet|show)|unable to show|can'?t tour|no in[- ]person tour|no in person showing)\b/i,
      explanation: "Explicitly refuses in-person tour before money is exchanged",
      severity: "CRITICAL"
    },
    {
      regex: /\b(mail (the )?keys?|courier (the )?keys?|ship (the )?keys?|send tracking number for keys?|fedex the keys?|dhl)\b/i,
      explanation: "Promises to mail or courier the keys upon receiving funds",
      severity: "CRITICAL"
    },
    {
      regex: /\b(look through the windows?|drive by (to see|only)|view from the street|peek through)\b/i,
      explanation: "Tells prospect to only drive by or peer through windows without entering",
      severity: "WARNING"
    }
  ],

  "High-Pressure Tactics & Deception": [
    {
      regex: /\b(act fast|first come first served?|skip the line|many inquiries|over \d+ inquiries)\b/i,
      explanation: "Applies artificial urgency to prevent prospective tenant from verifying facts",
      severity: "WARNING"
    },
    {
      regex: /\b(no credit check|bad credit accepted|no background check|skip background check)\b/i,
      explanation: "Claims no background check is needed for an underpriced luxury property",
      severity: "WARNING"
    },
    {
      regex: /\b(do not (call|message on this platform)|whatsapp only|email me directly at)\b/i,
      explanation: "Steers conversation away from verified platform messaging to untraceable channels",
      severity: "WARNING"
    }
  ]
};

const TRUST_PATTERNS = [
  {
    regex: /\b(in[- ]person (tour|showing|inspection|walkthrough)|schedule a tour|open house)\b/i,
    signal: "In-person tour or open house available prior to application"
  },
  {
    regex: /\b(property management|leasing office|licensed broker|resident portal)\b/i,
    signal: "Managed by verified leasing office or licensed property manager"
  },
  {
    regex: /\b(background check|transunion|credit check and proof of income|standard lease)\b/i,
    signal: "Formal tenant screening and official written lease agreement required"
  }
];

class PatternDetector {
  analyze(text, contactEmail) {
    const fullText = (text || '').toLowerCase();
    const flags = [];
    let penaltyScore = 0;

    // Check each category of red flags
    for (const [category, patterns] of Object.entries(RED_FLAG_CATEGORIES)) {
      for (const item of patterns) {
        const match = fullText.match(item.regex);
        if (match) {
          flags.push({
            category,
            explanation: item.explanation,
            snippet: `Detected term: "${match[0]}"`,
            severity: item.severity
          });
          penaltyScore += item.severity === 'CRITICAL' ? 0.28 : 0.15;
        }
      }
    }

    // Check suspicious email domains or patterns
    if (contactEmail) {
      const emailLower = contactEmail.toLowerCase();
      const suspiciousTerms = ['missionary', 'pastor', 'reverend', 'military', 'relocated', 'deals.now', 'quickrent'];
      if (suspiciousTerms.some(term => emailLower.includes(term))) {
        flags.push({
          category: 'Suspicious Contact Details',
          explanation: 'Landlord email handle uses identity-crafting persona cues (e.g. missionary, military claim)',
          snippet: `Contact email: ${contactEmail}`,
          severity: 'WARNING'
        });
        penaltyScore += 0.15;
      }
    }

    // Check positive trust signals
    const trustSignals = [];
    for (const item of TRUST_PATTERNS) {
      if (item.regex.test(fullText)) {
        trustSignals.push(item.signal);
      }
    }

    return {
      flags,
      penaltyScore: Math.min(1.0, penaltyScore),
      trustSignals
    };
  }
}

module.exports = new PatternDetector();
