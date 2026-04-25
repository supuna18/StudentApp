// Focus mode state-ah storage-la save pannuvom
chrome.runtime.onMessage.addListener((request) => {
    if (request.type === "START_FOCUS") {
        const duration = request.duration; // in minutes
        
        chrome.storage.local.set({ isFocusModeActive: true }, () => {
            console.log("GUARD ACTIVATED for " + duration + " mins");
            
            // Alarm set panrom (session end aahuradhuku)
            chrome.alarms.create("focusTimer", { delayInMinutes: parseFloat(duration) });
        });
    }
});

// Alarm adichona focus mode off pannuvom
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "focusTimer") {
        chrome.storage.local.set({ isFocusModeActive: false });
        console.log("GUARD DEACTIVATED");
    }
});

// Tab update aahumpodhu check pannuvom
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.url) {
        const data = await chrome.storage.local.get("isFocusModeActive");
        if (data.isFocusModeActive) {
            const url = changeInfo.url.toLowerCase();
            // Localhost thavira vera edhu ponaalum redirect
            if (!url.includes("localhost:5173") && !url.startsWith("chrome://") && !url.startsWith("edge://")) {
                chrome.tabs.update(tabId, { url: "http://localhost:5173/hub/scheduler" });
                
                chrome.notifications.create({
                    type: "basic",
                    iconUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==",
                    title: "Focus Mode Active! 🛡️",
                    message: "Finish your study session first!",
                    priority: 2
                });
            }
        }
    }
});