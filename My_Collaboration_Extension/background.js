let isFocusModeActive = false;
let focusTimer = null;

// React-la irundhu vara focus signal-ah listen pannurom
chrome.runtime.onMessage.addListener((request) => {
    if (request.type === "START_FOCUS") {
        isFocusModeActive = true;
        console.log("GUARD ACTIVATED");

        if (focusTimer) clearTimeout(focusTimer);
        focusTimer = setTimeout(() => {
            isFocusModeActive = false;
            console.log("GUARD DEACTIVATED");
        }, request.duration * 60000); 
    }
});

// Logic to check and redirect tabs
function guardTabs(tabId, url) {
    if (isFocusModeActive && url) {
        // Localhost thavira vera URL pona block pannuvom
        if (!url.includes("localhost:5173") && !url.startsWith("edge://") && !url.startsWith("chrome://")) {
            chrome.tabs.update(tabId, { url: "http://localhost:5173/hub/scheduler" });
            
            // Notification without local icon to avoid error
            chrome.notifications.create({
                type: "basic",
                iconUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==", 
                title: "EduSync: Focus Mode 🛡️",
                message: "Distractions are blocked! Finish your study session.",
                priority: 2
            });
        }
    }
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.url) guardTabs(tabId, changeInfo.url);
});

chrome.tabs.onActivated.addListener(async (activeInfo) => {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    if(tab.url) guardTabs(activeInfo.tabId, tab.url);
});