// වෙබ් අඩවියක් වෙනස් වන විට (Load වන විට) එය හඳුනා ගනී
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'loading' && tab.url && tab.url.startsWith('http')) {
        const checkUrl = tab.url;

        // Docker එකේ පිටතට පේන Port එක 5000 බැවින් එයට Request එක යවයි
        fetch(`http://localhost:5000/api/safety/check-url?url=${encodeURIComponent(checkUrl)}`)
            .then(response => response.json())
            .then(data => {
                if (data.unsafeSite) {
                    console.log("Unsafe site detected:", checkUrl);
                    
                    // Content script එකට වෙබ් පිටුව block කරන ලෙස පණිවිඩයක් යවයි
                    setTimeout(() => {
                        chrome.tabs.sendMessage(tabId, { 
                            action: "BLOCK_SITE", 
                            url: new URL(checkUrl).hostname 
                        }).catch(err => console.log("Waiting for page to load..."));
                    }, 700);
                }
            })
            .catch(err => console.error("EduSync API Offline. Run Docker and check Port 5000."));
    }
});

// විනාඩි 45 කට වරක් Break එකක් ගන්න මතක් කිරීම (Mindfulness Reminder)
chrome.alarms.create("mindfulBreak", { periodInMinutes: 45 });
chrome.alarms.onAlarm.addListener(() => {
    chrome.notifications.create({
        type: "basic",
        iconUrl: "https://cdn-icons-png.flaticon.com/512/3063/3063822.png",
        title: "EduSync Mindful Break",
        message: "You've been online for 45 mins. Take a quick breathing break!",
        priority: 2
    });
});