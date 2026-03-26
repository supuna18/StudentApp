let LIMITS = { "facebook.com": 1, "youtube.com": 2 };
let userId = null;

console.log("EduSync Background Started! 🚀");

// Initial load
chrome.storage.local.get(['userId'], (result) => {
    if (result.userId) {
        userId = result.userId;
        console.info("📂 Session Restored for:", userId);
        syncLimits();
    } else {
        console.warn("⚠️ No active session found on startup.");
    }
});

// Backend එකෙන් දත්ත ගැනීම
async function syncLimits() {
    if (!userId) {
        console.warn("🚫 syncLimits aborted: No userId.");
        return;
    }
    try {
        console.log(`fetching limits for user: ${userId}...`);
        const response = await fetch(`http://localhost:5005/api/wellbeing/limits/${userId}`);
        const result = await response.json();
        if (result && result.data) {
            let newLimits = {};
            result.data.forEach(item => { newLimits[item.domain] = item.limitMinutes; });
            LIMITS = newLimits;
            console.log("✅ Database Limits Updated:", LIMITS);
        }
    } catch (e) { console.error("❌ Sync failed:", e); }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("📩 Message Received:", request.action, "from:", request.domain || "Web App");

    if (request.action === "LOGIN_SUCCESS") {
        userId = request.userId;
        chrome.storage.local.set({ userId: userId });
        console.log("🔑 LOGIN_SUCCESS: Dynamic User ID set to:", userId);
        syncLimits();
        sendResponse({ success: true });
        return true;
    }

    if (request.action === "LOGOUT") {
        console.log("🚪 LOGOUT: Clearing session.");
        userId = null;
        LIMITS = { "facebook.com": 1, "youtube.com": 2 };
        chrome.storage.local.remove(['userId']);
        sendResponse({ success: true });
        return true;
    }

    if (request.action === "GET_DATA") {
        if (!userId) {
            console.warn("⚠️ GET_DATA requested but user is NOT logged in.");
            sendResponse({ spent: 0, limit: 0 });
            return true;
        }
        let dom = request.domain;
        const storageKey = `usage_${userId}_${dom}`;
        chrome.storage.local.get([storageKey], (res) => {
            sendResponse({ spent: res[storageKey] || 0, limit: LIMITS[dom] || 0 });
        });
        return true;
    }

    if (request.action === "SAVE_USAGE") {
        if (!userId) {
            console.warn("⚠️ SAVE_USAGE blocked: No active user session.");
            sendResponse({ success: false });
            return true;
        }
        const storageKey = `usage_${userId}_${request.domain}`;
        chrome.storage.local.set({ [storageKey]: request.spent });
        
        if (request.spent % 20 === 0) {
            fetch('http://localhost:5005/api/wellbeing/usage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    userId: userId, 
                    domain: request.domain, 
                    minutesSpent: request.spent / 60, 
                    date: new Date().toISOString().split('T')[0] 
                })
            }).then(() => console.log(`☁️ Sync: ${request.domain} usage saved to DB.`))
              .catch(e => console.error("❌ DB Sync failed:", e));
        }
        sendResponse({ success: true });
        return true;
    }

    if (request.action === "EXTEND_TIME") {
        console.log("➕ Extending time for domain:", request.domain);
        let spentMinutes = Math.ceil((request.spent || 0) / 60);
        let currentLimit = LIMITS[request.domain] || 0;
        LIMITS[request.domain] = Math.max(currentLimit, spentMinutes) + 5;
        sendResponse({ success: true, newLimit: LIMITS[request.domain] });
        return true;
    }

    if (request.action === "REDUCE_TIME") {
        if (LIMITS[request.domain] > 5) {
            LIMITS[request.domain] -= 5;
        } else {
            LIMITS[request.domain] = 1;
        }
        sendResponse({ success: true, newLimit: LIMITS[request.domain] });
        return true;
    }
    return true;
});