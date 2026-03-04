// 1. මුලින්ම අවශ්‍ය Variables හඳුන්වා දීම
console.log("EduSync Background Script Loaded! 🚀");

let usageData = {}; // වෙබ් අඩවි වල ගත කළ කාලය තබා ගැනීමට
const LIMITS = { 
    "facebook.com": 1,   // විනාඩි 1ක ලිමිට් එකක්
    "youtube.com": 2     // විනාඩි 2ක ලිමිට් එකක්
}; 

// 2. ටැබ් එකක් මාරු කරන විට හෝ අලුත් එකක් Open කරන විට ක්‍රියාත්මක වන Listener එක
chrome.tabs.onActivated.addListener(() => {
    console.log("Tab switched! Checking for limits...");
});

// 3. ටයිමර් එක - සෑම තත්පර 10කට වරක්ම කාලය ගණනය කරයි
chrome.alarms.create("usageTimer", { periodInMinutes: 0.166 }); // තත්පර 10ක්

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "usageTimer") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length === 0 || !tabs[0].url) return;

      try {
        let url = new URL(tabs[0].url);
        let domain = url.hostname.replace('www.', '');

        // ලිමිට් එකක් දාපු සයිට් එකක් නම් (facebook/youtube) පමණක් කාලය ගණනය කරන්න
        if (LIMITS[domain]) {
          usageData[domain] = (usageData[domain] || 0) + 10; // තත්පර 10ක් එකතු කරන්න
          let minutesSpent = usageData[domain] / 60;

          console.log(`${domain} වල ගත කළ කාලය: ${minutesSpent.toFixed(2)} min / Limit: ${LIMITS[domain]} min`);

          // ලිමිට් එක පැනලා නම් Content Script එකට "Block" කරන්න මැසේජ් එකක් යවන්න
          if (minutesSpent >= LIMITS[domain]) {
            chrome.tabs.sendMessage(tabs[0].id, { action: "BLOCK_SITE", domain: domain });
          }
        }
      } catch (e) {
        // chrome:// හෝ වෙනත් URL වලදී error එන එක වැළැක්වීමට
      }
    });
  }
});

// 4. Content Script එකට අවශ්‍ය තොරතුරු ලබා දීමට (Refresh කළ විට අවශ්‍ය වේ)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "CHECK_CURRENT_STATUS") {
        try {
            let url = new URL(sender.tab.url);
            let domain = url.hostname.replace('www.', '');
            let spent = (usageData[domain] || 0) / 60;
            let limit = LIMITS[domain] || Infinity;

            if (spent >= limit) {
                sendResponse({ isBlocked: true, domain: domain });
            } else {
                sendResponse({ isBlocked: false });
            }
        } catch (e) {
            sendResponse({ isBlocked: false });
        }
    }
    return true; 
});