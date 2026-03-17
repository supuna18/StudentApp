let timerElement = null;

// Background එකෙන් එන පණිවිඩ වලට ඇහුම්කන් දීම
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "UPDATE_TIMER") {
        updateFloatingTimer(request.timeLeft);
    }
    if (request.action === "BLOCK_SITE") {
        blockSite(request.domain);
    }
});

// Floating ටයිමර් එක Update කරන ආකාරය
function updateFloatingTimer(seconds) {
    if (!timerElement) {
        createTimerUI();
    }

    let mins = Math.floor(seconds / 60);
    let secs = seconds % 60;
    timerElement.innerText = `⏳ ${mins}:${secs < 10 ? '0' : ''}${secs} Left`;

    // If the time is less than a minute, it will turn red and pulse.
    if (seconds < 60) {
        timerElement.style.background = "#ef4444";
        timerElement.style.animation = "pulse 1s infinite";
    } else {
        timerElement.style.background = "#3b82f6";
        timerElement.style.animation = "none";
    }
}

// timer set for web
function createTimerUI() {
    timerElement = document.createElement("div");
    timerElement.id = "edusync-floating-timer";
    
    Object.assign(timerElement.style, {
        position: "fixed",
        top: "20px",
        right: "20px",
        padding: "10px 20px",
        background: "#3b82f6",
        color: "white",
        borderRadius: "50px",
        fontSize: "14px",
        fontWeight: "bold",
        zIndex: "2147483646",
        boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
        fontFamily: "sans-serif",
        pointerEvents: "none",
        transition: "background 0.3s ease"
    });

    document.body.appendChild(timerElement);

    const style = document.createElement("style");
    style.innerHTML = `
        @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.05); opacity: 0.8; }
            100% { transform: scale(1); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
}
// site block screen
function blockSite(domain) {
    if (timerElement) timerElement.remove();
    
    document.documentElement.innerHTML = `
        <div id="edusync-block-screen" style="background: #0f172a; height: 100vh; width: 100vw; position: fixed; top: 0; left: 0; z-index: 2147483647; display: flex; align-items: center; justify-content: center; color: white; font-family: sans-serif; text-align: center; margin: 0; padding: 0;">
            <div style="max-width: 500px; padding: 20px;">
                <div style="font-size: 80px; margin-bottom: 20px;">⌛</div>
                <h1 style="font-size: 50px; font-weight: 900; margin-bottom: 10px;">TIME UP!</h1>
                <p style="font-size: 18px; color: #94a3b8; margin-bottom: 30px;">ඔබ අද දින සඳහා ${domain} වෙත ලබා දී ඇති කාලය අවසන් වී ඇත.</p>
                
                <div style="display: flex; flex-direction: column; gap: 15px;">
                    <button id="extend-btn" style="padding: 16px 30px; background: #10b981; color: white; border: none; border-radius: 15px; font-weight: bold; cursor: pointer; font-size: 16px; transition: 0.3s hover;">
                        ➕ Give me 5 more minutes
                    </button>
                    
                    <a href="http://localhost:5173/student-dashboard" style="padding: 16px 30px; background: #3b82f6; color: white; text-decoration: none; border-radius: 15px; font-weight: bold; font-size: 16px;">
                        🏠 Go to Dashboard
                    </a>
                </div>
            </div>
        </div>
    `;

    document.getElementById("extend-btn").onclick = () => {
        chrome.runtime.sendMessage({ action: "EXTEND_TIME", domain: domain }, (response) => {
            if (response && response.success) {
                location.reload(); 
            }
        });
    };
}