// Native NLP Classifier for Rental Scam Text Analysis (Pure JavaScript / Node.js)

const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t',
  'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'can',
  'cannot', 'could', 'did', 'do', 'does', 'doing', 'down', 'during', 'each', 'few', 'for', 'from', 'further',
  'had', 'has', 'have', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him', 'himself', 'his', 'how',
  'i', 'if', 'in', 'into', 'is', 'it', 'its', 'itself', 'let\'s', 'me', 'more', 'most', 'my', 'myself',
  'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'ought', 'our', 'ours', 'ourselves',
  'out', 'over', 'own', 'same', 'she', 'should', 'so', 'some', 'such', 'than', 'that', 'the', 'their',
  'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they', 'this', 'those', 'through', 'to', 'too',
  'under', 'until', 'up', 'very', 'was', 'we', 'were', 'what', 'when', 'where', 'which', 'while', 'who',
  'whom', 'why', 'with', 'won\'t', 'would', 'you', 'your', 'yours', 'yourself', 'yourselves'
]);

// Verified Training Corpus for Rental Scam Language Modeling
const TRAINING_CORPUS = [
  // Scam listings
  {
    text: "Rent is only $650 per month all utilities included. I am currently out of the country on missionary work in West Africa with my family. Cannot meet you in person. Keys will be mailed via FedEx once deposit is sent via Western Union or MoneyGram. First come first served, wire today.",
    label: "scam"
  },
  {
    text: "Luxurious penthouse $800 all inclusive. Deployed overseas with military. Cannot tour inside, look through windows. Transfer deposit upfront via Zelle or Bitcoin. Keys will be shipped immediately.",
    label: "scam"
  },
  {
    text: "Condo downtown $500 monthly rent. Undergoing medical treatment abroad. Pay holding deposit via Apple gift cards or wire transfer before lease. Keys delivered by courier. Do not contact building management.",
    label: "scam"
  },
  {
    text: "Beautiful 2 bedroom home. Relocated to UK for emergency church ministry work. Not doing this for money, want a God-fearing tenant. Wire funds via MoneyGram or CashApp today to lock it in. DHL delivery of keys.",
    label: "scam"
  },
  {
    text: "Unbelievable studio $700. Skip the line by transferring deposit immediately via Venmo or wire. Cannot tour until payment clears because tenant is asleep. Drive by to see outside.",
    label: "scam"
  },
  {
    text: "No credit check, bad credit accepted. Landlord in Canada on business. Mail cashier check or crypto. Keys delivered to your address once fund arrives. View from the street.",
    label: "scam"
  },
  {
    text: "Huge 3 bedroom flat $750. Moved to Singapore for project. Wire reservation fee through Western Union. Email me directly at quickrent, do not message here.",
    label: "scam"
  },
  {
    text: "Low rent $520. Work transferred me to Spain. Send application fee and deposit via Zelle immediately. Tracking number for keys sent immediately after payment.",
    label: "scam"
  },
  {
    text: "Discounted rent $600. Hospitalized overseas. Send wire payment to owner agent in Nigeria. Keys sent by post. Viewing only from the street.",
    label: "scam"
  },
  {
    text: "Full villa with pool $900. Must transfer money by gift cards or Zelle right now. Cannot show interior until funds cleared. Drive by only.",
    label: "scam"
  },

  // Legitimate listings
  {
    text: "Well-maintained 2 bedroom apartment in prime location. Rent $3200 per month. Hardwood floors, stainless steel appliances. In-person showings available Monday through Saturday. Standard lease, background check, proof of income required. Security deposit upon lease signing.",
    label: "legit"
  },
  {
    text: "Modern 1 bedroom condo. Monthly rent $2850. In-unit washer dryer, fitness center, 24/7 concierge. Scheduled tours available this weekend. Application includes background check through TransUnion. Deposit payable via resident portal.",
    label: "legit"
  },
  {
    text: "Classic flat with vintage details. Rent $2400 per month, water and sewer included. Open house this Saturday from 1 to 3 PM or book private tour with property manager. 12 month lease required.",
    label: "legit"
  },
  {
    text: "Single family home with fenced backyard and garage. $3400/month. Guided walkthrough tours daily. Formal lease through licensed real estate brokerage. First month rent and deposit upon signing.",
    label: "legit"
  },
  {
    text: "Modern studio close to restaurants and transit. $1850 per month. Secure key fob entry, rooftop lounge. In-person and virtual walkthroughs available. Standard credit check and income verification 3x rent.",
    label: "legit"
  },
  {
    text: "2 bedroom apartment with balcony. Rent $2250. Stainless appliances, pool and gym. Come tour during leasing office hours Monday to Friday. No upfront fees before verified application.",
    label: "legit"
  },
  {
    text: "Modern urban living downtown. Rent $1950. In-unit laundry, parking space available. Book tour online at resident website or meet leasing agent on site. Standard lease terms.",
    label: "legit"
  },
  {
    text: "High-rise condo in Brickell. $3600 per month. Scheduled physical inspection available with 24 hours notice. Verified HOA listing. Portal payment upon official lease execution.",
    label: "legit"
  },
  {
    text: "Spacious townhome with patio and garage. Rent $2700. Physical walkthroughs for all prospective tenants before requesting application fees or deposits.",
    label: "legit"
  },
  {
    text: "Garden level apartment in historic brownstone. $2800. Open house every Sunday. Transparent application process with standard credit and references required.",
    label: "legit"
  }
];

class NLPClassifier {
  constructor() {
    this.vocabulary = new Set();
    this.wordCounts = { scam: {}, legit: {} };
    this.docCounts = { scam: 0, legit: 0 };
    this.totalWords = { scam: 0, legit: 0 };
    this.train();
  }

  tokenize(text) {
    if (!text) return [];
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2 && !STOP_WORDS.has(w));
  }

  train() {
    TRAINING_CORPUS.forEach(doc => {
      const tokens = this.tokenize(doc.text);
      const label = doc.label;
      this.docCounts[label]++;

      tokens.forEach(token => {
        this.vocabulary.add(token);
        this.wordCounts[label][token] = (this.wordCounts[label][token] || 0) + 1;
        this.totalWords[label]++;
      });
    });
  }

  /**
   * Calculates the probability that a text is a scam (0.0 to 1.0)
   * Using Naive Bayes log-likelihood with Laplace smoothing
   */
  predictScamProbability(text) {
    const tokens = this.tokenize(text);
    if (tokens.length === 0) return 0.20;

    const totalDocs = this.docCounts.scam + this.docCounts.legit;
    const priorScam = Math.log(this.docCounts.scam / totalDocs);
    const priorLegit = Math.log(this.docCounts.legit / totalDocs);

    const vocabSize = this.vocabulary.size;

    let logLikelihoodScam = priorScam;
    let logLikelihoodLegit = priorLegit;

    tokens.forEach(token => {
      // Laplace smoothing (+1)
      const countScam = this.wordCounts.scam[token] || 0;
      const countLegit = this.wordCounts.legit[token] || 0;

      const pTokenScam = (countScam + 1) / (this.totalWords.scam + vocabSize);
      const pTokenLegit = (countLegit + 1) / (this.totalWords.legit + vocabSize);

      logLikelihoodScam += Math.log(pTokenScam);
      logLikelihoodLegit += Math.log(pTokenLegit);
    });

    // Normalize using log-sum-exp
    const maxLog = Math.max(logLikelihoodScam, logLikelihoodLegit);
    const expScam = Math.exp(logLikelihoodScam - maxLog);
    const expLegit = Math.exp(logLikelihoodLegit - maxLog);

    const probScam = expScam / (expScam + expLegit);
    return Math.min(0.99, Math.max(0.01, probScam));
  }
}

module.exports = new NLPClassifier();
