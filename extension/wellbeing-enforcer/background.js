let usageData = {}; 
let LIMITS = { "facebook.com": 1, "youtube.com": 2, "instagram.com": 1 }; 

// තත්පරයෙන් තත්පරයට කාලය ගණනය කිරීම
setInterval(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length === 0 || !tabs[0].url) return;

        try {
            let url = new URL(tabs[0].url);
            let hostname = url.hostname;
            
            // To Domain extract (facebook.com)
            let parts = hostname.split('.');
            let domain = parts.slice(-2).join('.'); 

            if (LIMITS[domain]) {
                // කාලය තත්පරයකින් වැඩි කිරීම
                usageData[domain] = (usageData[domain] || 0) + 1;
                
                let limitInSeconds = LIMITS[domain] * 60;
                let timeLeft = limitInSeconds - usageData[domain];

                if (timeLeft <= 0) {
                    chrome.tabs.sendMessage(tabs[0].id, { action: "BLOCK_SITE", domain: domain });
                } else {
                    // ඉතිරි වෙලාව Update කිරීමට Content Script එකට යවයි
                    chrome.tabs.sendMessage(tabs[0].id, { action: "UPDATE_TIMER", timeLeft: timeLeft });
                }
            }
        } catch (e) {
            // chrome:// URLs වැනි දේවල් මඟහරියි
        }
    });
}, 1000);

// කාලය වැඩි කිරීමට එන Request එක බාර ගැනීම (Listener එක Interval එකෙන් එළියේ තිබිය යුතුය)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "EXTEND_TIME") {
        let domain = request.domain;
        if (LIMITS[domain]) {
            LIMITS[domain] += 5; // තව විනාඩි 5ක් එකතු කරයි
            console.log(`${domain} සඳහා කාලය විනාඩි 5කින් වැඩි කළා! ✅`);
            sendResponse({ success: true });
        }
    }
    return true; 
});