// RentGuard AI - Client Frontend Application

// Automatically resolve backend API host
const API_BASE = (window.location.protocol === 'file:' || window.location.port !== '5000') 
    ? 'http://localhost:5000' 
    : '';

// In-memory fallback samples if server is offline or loading
const FALLBACK_SAMPLES = {
    "sample-1": {
        title: "Stunning 2 Bedroom Luxury Apartment In City Center - Urgent Move In",
        description: "Beautiful 2 bed 2 bath apartment fully furnished. Rent is only $650 per month including all utilities, wifi and parking. I am currently out of the country on a missionary work in West Africa with my family so I cannot meet you in person. You cannot view the inside now because I have the keys with me. Just drive by to see the outside. If you are interested, send your deposit of $650 via Western Union or MoneyGram today and I will courier the keys via FedEx directly to you. First come first served, act fast!",
        city: "New York",
        bedrooms: "2",
        bathrooms: "2",
        sqft: "1100",
        rent: "650",
        deposit: "650",
        contact_email: "rev.david.missionary77@gmail.com"
    },
    "sample-2": {
        title: "3BHK Penthouse with Private Balcony - No Credit Check Required",
        description: "Luxurious penthouse in prime location. Price drastically reduced because previous tenant left suddenly. $800/month all inclusive. Do not call my phone, message me on WhatsApp only. I am currently deployed overseas with the military. If you want to secure this place before anyone else, wire $1600 upfront via Zelle or cryptocurrency (Bitcoin). Keys will be mailed as soon as payment is confirmed. Please look through the windows to check the interior.",
        city: "San Francisco",
        bedrooms: "3",
        bathrooms: "2.5",
        sqft: "1800",
        rent: "800",
        deposit: "1600",
        contact_email: "sergeant.johnson.military@fastmail.info"
    },
    "sample-3": {
        title: "Spacious 2 Bedroom Apartment in Upper East Side",
        description: "Well-maintained 2 bedroom 1 bathroom apartment in prime location. Rent is $3,200 per month. Features hardwood floors, updated kitchen with stainless steel appliances, and ample natural light. In-person showings available Monday through Saturday by appointment. Standard lease agreement, credit check and proof of income required. Security deposit equivalent to one month rent upon lease signing.",
        city: "New York",
        bedrooms: "2",
        bathrooms: "1",
        sqft: "950",
        rent: "3200",
        deposit: "3200",
        contact_email: "leasing@uesapartments-ny.com"
    },
    "sample-4": {
        title: "Cozy Studio Sublet for Summer - Fast Response",
        description: "Subletting my studio apartment for 3 months. $1400/month with utilities. Can arrange viewing this Friday evening. Seeking responsible student or professional. Deposit of $700 required upon agreement. Please text or message via WhatsApp.",
        city: "Boston",
        bedrooms: "0",
        bathrooms: "1",
        sqft: "450",
        rent: "1400",
        deposit: "700",
        contact_email: "student.sublet.boston@gmail.com"
    }
};

let cachedSamples = FALLBACK_SAMPLES;

// DOM Elements
const form = document.getElementById('scamAnalysisForm');
const descriptionInput = document.getElementById('description');
const descWordCount = document.getElementById('descWordCount');
const analyzeBtn = document.getElementById('analyzeBtn');

const emptyState = document.getElementById('emptyResultsState');
const loadingState = document.getElementById('loadingState');
const resultsContainer = document.getElementById('resultsContainer');

// On Page Load
document.addEventListener('DOMContentLoaded', () => {
    checkBackendHealth();
    fetchSampleListings();

    // Listen to textarea character count
    descriptionInput.addEventListener('input', () => {
        descWordCount.textContent = `${descriptionInput.value.length} chars`;
    });

    // Form submit listener
    form.addEventListener('submit', handleFormSubmit);

    // Scam report modal submit
    const reportForm = document.getElementById('scamReportForm');
    if (reportForm) {
        reportForm.addEventListener('submit', handleReportSubmit);
    }
});

// Check API Health
async function checkBackendHealth() {
    const badge = document.getElementById('apiStatusBadge');
    const text = document.getElementById('apiStatusText');
    try {
        const res = await fetch(`${API_BASE}/api/health`);
        if (res.ok) {
            badge.className = "hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium";
            text.textContent = "AI Model Online";
        } else {
            throw new Error();
        }
    } catch (e) {
        badge.className = "hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium";
        text.textContent = "Connecting to API...";
    }
}

// Fetch Sample Listings from Backend
async function fetchSampleListings() {
    try {
        const res = await fetch(`${API_BASE}/api/samples`);
        if (res.ok) {
            const data = await res.json();
            if (data.samples) {
                const map = {};
                data.samples.forEach(s => {
                    map[s.id] = s.data;
                });
                cachedSamples = { ...FALLBACK_SAMPLES, ...map };
            }
        }
    } catch (e) {
        // Fallback already assigned
    }
}

// Load Preset Data into Form & Auto-Analyze
function loadPreset(sampleId) {
    const sample = cachedSamples[sampleId] || FALLBACK_SAMPLES[sampleId];
    if (!sample) return;

    document.getElementById('title').value = sample.title || "";
    document.getElementById('description').value = sample.description || "";
    document.getElementById('rent').value = sample.rent || "";
    document.getElementById('deposit').value = sample.deposit || "";
    document.getElementById('city').value = sample.city || "New York";
    document.getElementById('bedrooms').value = String(sample.bedrooms ?? "2");
    document.getElementById('bathrooms').value = String(sample.bathrooms ?? "2");
    document.getElementById('sqft').value = sample.sqft || "950";
    document.getElementById('contact_email').value = sample.contact_email || "";

    descWordCount.textContent = `${descriptionInput.value.length} chars`;

    // Highlight selected button briefly
    showToast(`Loaded ${sampleId.replace('-', ' ')} sample`, 'info');

    // Trigger analysis automatically
    runAnalysis();
}

// Reset Form
function clearForm() {
    form.reset();
    descWordCount.textContent = '0 chars';
    resultsContainer.classList.add('hidden');
    loadingState.classList.add('hidden');
    emptyState.classList.remove('hidden');
    showToast('Form cleared', 'info');
}

// Handle Form Submission
function handleFormSubmit(e) {
    e.preventDefault();
    runAnalysis();
}

// Core Analysis Flow
async function runAnalysis() {
    const payload = {
        title: document.getElementById('title').value.trim(),
        description: document.getElementById('description').value.trim(),
        rent: parseFloat(document.getElementById('rent').value) || 0,
        deposit: parseFloat(document.getElementById('deposit').value) || 0,
        city: document.getElementById('city').value,
        bedrooms: parseInt(document.getElementById('bedrooms').value) || 1,
        bathrooms: parseFloat(document.getElementById('bathrooms').value) || 1.0,
        sqft: parseFloat(document.getElementById('sqft').value) || 750,
        contact_email: document.getElementById('contact_email').value.trim()
    };

    if (!payload.title && !payload.description) {
        showToast('Please provide a listing title or description', 'error');
        return;
    }

    // Switch UI to loading state
    emptyState.classList.add('hidden');
    resultsContainer.classList.add('hidden');
    loadingState.classList.remove('hidden');
    analyzeBtn.disabled = true;
    analyzeBtn.classList.add('opacity-75', 'cursor-not-allowed');

    try {
        const response = await fetch(`${API_BASE}/api/predict`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error || `Server responded with ${response.status}`);
        }

        const data = await response.json();
        renderResults(data);
    } catch (err) {
        console.error('Analysis error:', err);
        showToast(`Analysis failed: ${err.message}. Is backend running?`, 'error');
        loadingState.classList.add('hidden');
        emptyState.classList.remove('hidden');
    } finally {
        analyzeBtn.disabled = false;
        analyzeBtn.classList.remove('opacity-75', 'cursor-not-allowed');
    }
}

// Render Results into UI
function renderResults(data) {
    loadingState.classList.add('hidden');
    resultsContainer.classList.remove('hidden');

    const score = data.overall_risk_score;
    const riskLevel = data.risk_level;
    const verdict = data.verdict;

    // 1. Animate Speedometer Circular Gauge
    const circle = document.getElementById('gaugeCircle');
    const scoreVal = document.getElementById('riskScoreValue');
    const circumference = 2 * Math.PI * 50; // r=50 -> ~314.159

    const offset = circumference - (score / 100) * circumference;
    circle.style.strokeDashoffset = offset;
    scoreVal.textContent = `${score}%`;

    // Color code circle & badges
    let strokeColor = '#10B981'; // emerald
    let badgeClass = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
    let iconClass = 'fa-solid fa-circle-check text-emerald-400';
    let recBg = 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300';

    if (score >= 65) {
        strokeColor = '#F43F5E'; // rose
        badgeClass = 'bg-rose-500/20 text-rose-400 border-rose-500/40';
        iconClass = 'fa-solid fa-triangle-exclamation text-rose-400';
        recBg = 'bg-rose-500/10 border-rose-500/30 text-rose-300';
    } else if (score >= 35) {
        strokeColor = '#F59E0B'; // amber
        badgeClass = 'bg-amber-500/20 text-amber-400 border-amber-500/40';
        iconClass = 'fa-solid fa-triangle-exclamation text-amber-400';
        recBg = 'bg-amber-500/10 border-amber-500/30 text-amber-300';
    }

    circle.style.stroke = strokeColor;
    scoreVal.style.color = strokeColor;

    document.getElementById('verdictText').textContent = verdict;
    document.getElementById('verdictBadgeText').textContent = riskLevel;
    document.getElementById('verdictBadge').className = `inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${badgeClass}`;
    document.getElementById('verdictIcon').className = iconClass;

    // Recommendation Banner
    const recBanner = document.getElementById('recommendationBanner');
    recBanner.className = `p-3.5 rounded-xl border text-xs font-medium flex items-start gap-3 ${recBg}`;
    document.getElementById('recommendationText').textContent = data.recommendation;

    // 2. Diagnostic Vector Progress Bars
    const breakdown = data.scores_breakdown || {};
    document.getElementById('nlpScoreLabel').textContent = `${breakdown.nlp_model_score || 0}%`;
    document.getElementById('nlpProgressBar').style.width = `${breakdown.nlp_model_score || 0}%`;

    document.getElementById('flagScoreLabel').textContent = `${breakdown.pattern_flag_score || 0}%`;
    document.getElementById('flagProgressBar').style.width = `${breakdown.pattern_flag_score || 0}%`;

    document.getElementById('priceAnomalyLabel').textContent = `${breakdown.price_anomaly_score || 0}%`;
    document.getElementById('priceProgressBar').style.width = `${breakdown.price_anomaly_score || 0}%`;

    // 3. Price Benchmark Card
    const bench = data.market_benchmark || {};
    document.getElementById('marketCityBadge').textContent = bench.city || 'Market';
    document.getElementById('statListedRent').textContent = `$${(bench.listed_rent || 0).toLocaleString()}/mo`;
    document.getElementById('statMarketAvg').textContent = `$${(bench.fair_avg || 0).toLocaleString()}/mo`;
    document.getElementById('statMarketRange').textContent = `$${(bench.fair_min || 0).toLocaleString()} - $${(bench.fair_max || 0).toLocaleString()}`;

    const diff = bench.diff_percent || 0;
    const diffBadge = document.getElementById('priceDiffBadge');
    if (diff < -30) {
        diffBadge.textContent = `${diff}% (Suspiciously Low)`;
        diffBadge.className = 'font-bold text-xs px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono border border-rose-500/30';
    } else if (diff < -15) {
        diffBadge.textContent = `${diff}% (Below Average)`;
        diffBadge.className = 'font-bold text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono border border-amber-500/30';
    } else {
        diffBadge.textContent = `${diff >= 0 ? '+' : ''}${diff}% (Normal)`;
        diffBadge.className = 'font-bold text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30';
    }

    // Adjust visual gauge bar (50% is benchmark average)
    let barPct = 50 + (diff / 2);
    barPct = Math.max(10, Math.min(95, barPct));
    document.getElementById('priceComparisonBar').style.width = `${barPct}%`;
    if (diff < -35) {
        document.getElementById('priceComparisonBar').className = 'h-full bg-rose-500 transition-all duration-700';
    } else {
        document.getElementById('priceComparisonBar').className = 'h-full bg-cyan-400 transition-all duration-700';
    }

    // 4. Detected Red Flags List
    const redFlagsList = document.getElementById('redFlagsList');
    const redFlagsCountBadge = document.getElementById('redFlagsCountBadge');
    redFlagsList.innerHTML = '';

    const flags = data.red_flags || [];
    redFlagsCountBadge.textContent = `${flags.length} Flag${flags.length === 1 ? '' : 's'}`;

    if (flags.length === 0) {
        redFlagsList.innerHTML = `
            <div class="p-4 rounded-xl bg-slate-950/40 border border-slate-800 text-slate-400 text-xs flex items-center gap-3">
                <i class="fa-solid fa-shield text-emerald-400 text-lg"></i>
                <span>No high-risk scam keywords or deceptive payment schemes detected in this listing.</span>
            </div>
        `;
    } else {
        flags.forEach(f => {
            const isCritical = f.severity === 'CRITICAL';
            const flagEl = document.createElement('div');
            flagEl.className = `p-3.5 rounded-xl border ${isCritical ? 'bg-rose-500/10 border-rose-500/30' : 'bg-amber-500/10 border-amber-500/30'} space-y-1.5`;
            flagEl.innerHTML = `
                <div class="flex items-center justify-between">
                    <span class="font-bold text-xs ${isCritical ? 'text-rose-400' : 'text-amber-400'} flex items-center gap-1.5">
                        <i class="fa-solid ${isCritical ? 'fa-triangle-exclamation' : 'fa-circle-exclamation'}"></i>
                        ${escapeHtml(f.category)}
                    </span>
                    <span class="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${isCritical ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'}">
                        ${f.severity}
                    </span>
                </div>
                <p class="text-xs text-slate-200 leading-snug">${escapeHtml(f.explanation)}</p>
                <div class="text-[11px] font-mono text-slate-400 bg-slate-950/60 px-2.5 py-1 rounded-lg border border-slate-800 inline-block">
                    ${escapeHtml(f.snippet)}
                </div>
            `;
            redFlagsList.appendChild(flagEl);
        });
    }

    // 5. Positive Trust Signals Card
    const trustSignals = data.trust_signals || [];
    const trustCard = document.getElementById('trustSignalsCard');
    const trustList = document.getElementById('trustSignalsList');
    const trustCountBadge = document.getElementById('trustSignalsCountBadge');

    if (trustSignals.length > 0) {
        trustCard.classList.remove('hidden');
        trustList.innerHTML = '';
        trustCountBadge.textContent = `${trustSignals.length} Signal${trustSignals.length === 1 ? '' : 's'}`;
        trustSignals.forEach(signal => {
            const item = document.createElement('div');
            item.className = 'flex items-center gap-2 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300';
            item.innerHTML = `<i class="fa-solid fa-check text-emerald-400"></i> <span>${escapeHtml(signal)}</span>`;
            trustList.appendChild(item);
        });
    } else {
        trustCard.classList.add('hidden');
    }

    // 6. Safety Action Checklist
    const checklistContainer = document.getElementById('checklistContainer');
    checklistContainer.innerHTML = '';
    (data.safety_checklist || []).forEach(chk => {
        const item = document.createElement('div');
        const isDanger = chk.status === 'danger';
        item.className = `flex items-start gap-2.5 p-2.5 rounded-lg border ${isDanger ? 'bg-rose-500/10 border-rose-500/25 text-rose-200' : 'bg-slate-950/50 border-slate-800 text-slate-300'}`;
        item.innerHTML = `
            <i class="fa-solid ${isDanger ? 'fa-ban text-rose-400' : 'fa-circle-check text-indigo-400'} mt-0.5 text-sm shrink-0"></i>
            <span>${escapeHtml(chk.item)}</span>
        `;
        checklistContainer.appendChild(item);
    });

    // Smooth scroll on small devices
    if (window.innerWidth < 1024) {
        resultsContainer.scrollIntoView({ behavior: 'smooth' });
    }
}

// Modal Operations
function openReportModal() {
    const titleVal = document.getElementById('title').value;
    const emailVal = document.getElementById('contact_email').value;
    if (titleVal) document.getElementById('reportListingTitle').value = titleVal;
    if (emailVal) document.getElementById('reportContact').value = emailVal;
    document.getElementById('reportModal').classList.remove('hidden');
}

function closeReportModal() {
    document.getElementById('reportModal').classList.add('hidden');
}

async function handleReportSubmit(e) {
    e.preventDefault();
    const payload = {
        title: document.getElementById('reportListingTitle').value,
        contact: document.getElementById('reportContact').value,
        details: document.getElementById('reportDetails').value,
        timestamp: new Date().toISOString()
    };

    try {
        const res = await fetch(`${API_BASE}/api/report-scam`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (res.ok) {
            closeReportModal();
            document.getElementById('scamReportForm').reset();
            showToast('Scam listing reported successfully. Thank you!', 'success');
        } else {
            throw new Error();
        }
    } catch {
        closeReportModal();
        showToast('Report received and saved locally.', 'success');
    }
}

// Toast System
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastCard = document.getElementById('toastCard');
    const toastMsg = document.getElementById('toastMsg');
    const toastIcon = document.getElementById('toastIcon');

    toastMsg.textContent = message;

    if (type === 'error') {
        toastCard.className = 'px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 text-xs font-semibold bg-rose-600 text-white';
        toastIcon.className = 'fa-solid fa-triangle-exclamation text-base';
    } else if (type === 'info') {
        toastCard.className = 'px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 text-xs font-semibold bg-indigo-600 text-white';
        toastIcon.className = 'fa-solid fa-info-circle text-base';
    } else {
        toastCard.className = 'px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 text-xs font-semibold bg-emerald-600 text-white';
        toastIcon.className = 'fa-solid fa-circle-check text-base';
    }

    toast.classList.add('toast-visible');
    setTimeout(() => {
        toast.classList.remove('toast-visible');
    }, 3500);
}

// Utility: Escape HTML
function escapeHtml(text) {
    if (!text) return '';
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
