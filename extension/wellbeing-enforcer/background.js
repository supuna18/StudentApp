let LIMITS = { "facebook.com": 1, "youtube.com": 2 }; 
let userId = "user123";

// 1. Backend එකෙන් Limits ලබා ගැනීම
async function syncLimitsFromBackend() {
    try {
        const response = await fetch(`http://localhost:5005/api/wellbeing/limits/${userId}`);
        const result = await response.json();
        
        if (result && result.data) {
            let newLimits = {};
            result.data.forEach(item => {
                newLimits[item.domain] = item.limitMinutes;
            });
            LIMITS = newLimits;
            console.log("Limits Updated! ✅", LIMITS);
        }
    } catch (err) {
        console.log("Sync failed. Using local defaults.");
    }
}

// 2. ටයිමර් එක
setInterval(async () => {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        if (tabs.length === 0 || !tabs[0].url) return;

        try {
            let url = new URL(tabs[0].url);
            let domain = url.hostname.replace('www.', '').split('.').slice(-2).join('.');

            if (LIMITS[domain]) {
                let storageKey = `usage_${domain}`;
                let res = await chrome.storage.local.get([storageKey]);
                let spentSeconds = res[storageKey] || 0;

                spentSeconds += 1;
                await chrome.storage.local.set({ [storageKey]: spentSeconds });

                let timeLeft = (LIMITS[domain] * 60) - spentSeconds;

                if (timeLeft <= 0) {
                    chrome.tabs.sendMessage(tabs[0].id, { action: "BLOCK_SITE", domain: domain }).catch(() => {});
                } else {
                    chrome.tabs.sendMessage(tabs[0].id, { action: "UPDATE_TIMER", timeLeft: timeLeft, domain: domain }).catch(() => {});
                }
            }
        } catch (e) {}
    });
}, 1000);

// 3. Messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    let domain = request.domain;
    if (request.action === "EXTEND_TIME") {
        LIMITS[domain] = (LIMITS[domain] || 0) + 5;
        sendResponse({ success: true });
    } else if (request.action === "REDUCE_TIME") {
        if (LIMITS[domain] > 1) {
            LIMITS[domain] -= 1;
            sendResponse({ success: true });
        }
    }
    return true;
});

syncLimitsFromBackend();