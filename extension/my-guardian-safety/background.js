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

// වෙබ් අඩවියක් පූරණය වීමට පෙර URL එක පරීක්ෂා කිරීම
chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
    // Main tab එක (frameId 0) පමණක් පරීක්ෂා කරයි
    if (details.frameId !== 0) return; 

    const url = details.url;
    // URL එකක් නොවන අවස්ථා (chrome:// වැනි) මඟ හරියි
    if (!url || !url.startsWith('http')) return;

    try {
        // API එකෙන් URL එක Database එකේ ඇත්දැයි විමසයි
        const response = await fetch(`http://localhost:5005/api/safety/check-url?url=${encodeURIComponent(url)}`);
        
        if (!response.ok) return;

        const data = await response.json();

        // Database එකේ එම URL එක තිබේ නම් (unsafeSite: true) බ්ලොක් කරයි
        if (data.unsafeSite === true) {
            chrome.tabs.sendMessage(details.tabId, { 
                action: "BLOCK_SITE", 
                url: url 
            }).catch(() => {
                // සටහන: Tab එක පූරණය වී නැතිනම් මෙහිදී දෝෂයක් ආ හැක, එය සාමාන්‍යයි.
                console.log("EduSync Guardian: Waiting for content script to load...");
            });
        }
    } catch (err) {
        // API සම්බන්ධ වීමේදී එන දෝෂ මෙහිදී නිහඬව පාලනය වේ
        console.log("EduSync Guardian: Safety check deferred.");
    }
});

// Content script එක පූරණය වූ පසු කෙරෙන පරීක්ෂාව
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "CHECK_URL") {
        const url = request.url;
        fetch(`http://localhost:5005/api/safety/check-url?url=${encodeURIComponent(url)}`)
            .then(res => res.json())
            .then(data => sendResponse({ unsafeSite: data.unsafeSite }))
            .catch(() => sendResponse({ unsafeSite: false }));
        return true; // Asynchronous response සඳහා
    }

    // Block screen ෙල "Go Back to Safety" button click කළවිට
    if (request.action === "NAVIGATE_TO_SAFETY") {
        chrome.tabs.update(sender.tab.id, { url: "http://localhost:5173/student-dashboard/safety" });
    }
});