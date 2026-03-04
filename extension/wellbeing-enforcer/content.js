// 1. පිටුව Load වුණු ගමන්ම Background එකෙන් තත්ත්වය විමසීම
chrome.runtime.sendMessage({ action: "CHECK_CURRENT_STATUS" }, (response) => {
    if (response && response.isBlocked) {
        blockWebsite(response.domain);
    }
});

// 2. Real-time මැසේජ් එකක් ආවොත් (විනාඩිය ඉවර වුණු ගමන්) ඒක අල්ලා ගැනීම
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "BLOCK_SITE") {
        blockWebsite(request.domain);
    }
});

// 3. බ්ලොක් කරන Screen එක (අතිශය නවීන පෙනුමකින්)
function blockWebsite(domain) {
    // මුලින්ම සයිට් එකේ තියෙන දේවල් පේන එක නතර කිරීමට මුළු පිටුවම හිස් කරයි
    document.documentElement.innerHTML = ''; 

    const blockHTML = `
        <div id="edusync-blocker" style="
            all: initial; 
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; 
            background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
            display: flex; align-items: center; justify-content: center; 
            z-index: 2147483647; font-family: 'Inter', system-ui, sans-serif;
            color: white; text-align: center; overflow: hidden;
        ">
            <div style="max-width: 600px; padding: 40px;">
                <div style="font-size: 100px; margin-bottom: 20px; animation: bounce 2s infinite;">⏳</div>
                <h1 style="font-size: 64px; font-weight: 900; margin: 0; letter-spacing: -2px; line-height: 1;">TIME UP!</h1>
                <p style="font-size: 24px; color: #94a3b8; margin: 20px 0 40px; font-weight: 500;">
                    You've reached your limit on <span style="color: #3b82f6;">${domain}</span>. 
                    Your future self will thank you for focusing now.
                </p>
                <a href="http://localhost:5173/student-dashboard" style="
                    display: inline-block; padding: 18px 45px; background: #3b82f6; 
                    color: white; text-decoration: none; border-radius: 20px; 
                    font-weight: 800; font-size: 18px; transition: all 0.3s ease;
                    box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.5);
                " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                    Back to Dashboard
                </a>
            </div>
            <style>
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-20px); }
                }
            </style>
        </div>
    `;

    document.documentElement.innerHTML = blockHTML;
    document.body.style.overflow = "hidden";
}