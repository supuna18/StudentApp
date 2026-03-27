let userId = null;
let syncRetryCount = 0;
const MAX_SYNC_RETRIES = 3;

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

// Backend එකෙන් දත්ත ගැනීම.
async function syncLimits() {
    if (!userId) {
        console.warn("🚫 syncLimits aborted: No userId.");
        return;
    }
    try {
        console.log(`📡 Fetching limits for user: ${userId} (Attempt ${syncRetryCount + 1})...`);
        const response = await fetch(`http://127.0.0.1:5005/api/wellbeing/limits/${userId}`);
        
        if (!response.ok) throw new Error(`HTTP Error ${response.status}`);
        
        const result = await response.json();
        if (result && result.data) {
            let newLimits = {};
            result.data.forEach(item => { newLimits[item.domain] = item.limitMinutes; });
            LIMITS = newLimits;
            syncRetryCount = 0; // Reset on success
            console.log("✅ Database Limits Updated:", LIMITS);
        }
    } catch (e) { 
        console.error("❌ Sync failed:", e.message); 
        if (syncRetryCount < MAX_SYNC_RETRIES) {
            syncRetryCount++;
            console.log(`🔄 Retrying sync in ${syncRetryCount * 5}s...`);
            setTimeout(syncLimits, syncRetryCount * 5000);
        }
    }
}

// Backend එකට අලුත් Limit එක යැවීම.
async function saveLimitToDB(domain, limitMinutes) {
    if (!userId) return;
    try {
        await fetch('http://127.0.0.1:5005/api/wellbeing/limits', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: userId, domain: domain, limitMinutes: limitMinutes, category: "Modified via Extension" })
        });
        console.log(`✅ Sync: Limit for ${domain} updated in DB.`);
    } catch (e) { console.error("❌ DB Limit Sync failed:", e); }
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
            fetch('http://127.0.0.1:5005/api/wellbeing/usage', {
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
        let newLimit = Math.max(currentLimit, spentMinutes) + 5;
        LIMITS[request.domain] = newLimit;
        saveLimitToDB(request.domain, newLimit);
        sendResponse({ success: true, newLimit: newLimit });
        return true;
    }

    if (request.action === "REDUCE_TIME") {
        let newLimit = 1;
        if (LIMITS[request.domain] > 5) {
            newLimit = LIMITS[request.domain] - 5;
        } 
        LIMITS[request.domain] = newLimit;
        saveLimitToDB(request.domain, newLimit);
        sendResponse({ success: true, newLimit: newLimit });
        return true;
    }
    return true;
});
