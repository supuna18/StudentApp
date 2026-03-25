let LIMITS = { "facebook.com": 1, "youtube.com": 2 };
let userId = "user123";

console.log("EduSync Background Started! 🚀");

// Backend එකෙන් දත්ත ගැනීම
async function syncLimits() {
    try {
        const response = await fetch(`http://localhost:5005/api/wellbeing/limits/${userId}`);
        const result = await response.json();
        if (result && result.data) {
            let newLimits = {};
            result.data.forEach(item => { newLimits[item.domain] = item.limitMinutes; });
            LIMITS = newLimits;
            console.log("✅ Database Limits Updated:", LIMITS);
        }
    } catch (e) { console.log("⚠️ Sync failed, using defaults."); }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("📩 Message Received:", request.action, "from:", request.domain);

    if (request.action === "GET_DATA") {
        let dom = request.domain;
        chrome.storage.local.get([`usage_${dom}`], (res) => {
            sendResponse({ spent: res[`usage_${dom}`] || 0, limit: LIMITS[dom] || 0 });
        });
        return true;
    }
    if (request.action === "SAVE_USAGE") {
        chrome.storage.local.set({ [`usage_${request.domain}`]: request.spent });
        if (request.spent % 20 === 0) {
            // Database එකට සේව් කරන කොටස
            fetch('http://localhost:5005/api/wellbeing/usage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, domain: request.domain, minutesSpent: request.spent / 60, date: new Date().toISOString().split('T')[0] })
            });
        }
    }
    if (request.action === "EXTEND_TIME") {
        console.log("➕ Extending time for domain:", request.domain);
        let spentMinutes = Math.ceil((request.spent || 0) / 60);
        let currentLimit = LIMITS[request.domain] || 0;
        
        // If they are already over the limit, add 5 minutes to their current usage
        // otherwise just add 5 minutes to the limit.
        LIMITS[request.domain] = Math.max(currentLimit, spentMinutes) + 5;
        
        sendResponse({ success: true, newLimit: LIMITS[request.domain] });
    }
    if (request.action === "REDUCE_TIME") {
        if (LIMITS[request.domain] > 5) {
            LIMITS[request.domain] -= 5;
        } else {
            LIMITS[request.domain] = 1; // Don't reduce below 1 minute
        }
        sendResponse({ success: true, newLimit: LIMITS[request.domain] });
    }
    return true;
});

syncLimits();