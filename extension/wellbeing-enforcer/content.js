console.log("🛡️ EduSync Content Script is RUNNING!");

let spent = 0;
let limit = 0;
let domain = window.location.hostname.replace(/^(www\.|web\.|m\.)/, ''); 
let timerActive = false;
let lastSentUserId = null; // Professional QA: Prevents redundant sync messages

// Safe message delivery to background
function safeSendMessage(message, callback) {
    if (!chrome.runtime?.id) {
        console.warn("⚠️ EduSync: Extension context invalidated. Please refresh the page.");
        return;
    }
    chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
            console.warn("⚠️ Sync deferred: Background script unreachable.");
            return;
        }
        if (callback) callback(response);
    });
}

// --- Web App Sync Logic ---
const isEduSyncApp = window.location.host.includes("localhost:5173") || 
                     window.location.host.includes("127.0.0.1:5173") ||
                     document.title.toLowerCase().includes("edusync");

if (isEduSyncApp) {
    console.log("🔗 EduSync Web App Detected. Syncing session...");
    
    function syncAuth() {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                // Safer base64url decode
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));
                
                const payload = JSON.parse(jsonPayload);
                // Microsoft .NET uses long URI claim names
                const userId = payload.nameid || 
                               payload.sub || 
                               payload.id || 
                               payload.unique_name ||
                               payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
                
                if (userId && userId !== lastSentUserId) {
                    console.log("✅ Authenticated User Sync:", userId);
                    lastSentUserId = userId;
                    safeSendMessage({ action: "LOGIN_SUCCESS", userId: userId }, (res) => {
                        if (res && res.success) {
                            console.log("🔔 Session Sync Confirmed by Background Script.");
                        }
                    });
                }
            } catch (e) { 
                console.error("❌ Auth Parse Error", e); 
                // Fallback to simpler atob
                try {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    const userId = payload.nameid || payload.sub || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
                    if (userId && userId !== lastSentUserId) {
                        lastSentUserId = userId;
                        safeSendMessage({ action: "LOGIN_SUCCESS", userId: userId });
                    }
                } catch(inner) {}
            }
        } else if (lastSentUserId !== null) {
            console.log("🚪 No token found. Clearing session.");
            lastSentUserId = null;
            safeSendMessage({ action: "LOGOUT" });
        }
    }

    syncAuth();
    window.addEventListener('storage', (e) => {
        if (e.key === 'token') {
            console.log("🔄 Auth token changed in storage.");
            syncAuth();
        }
    });
    setInterval(syncAuth, 10000); // Check every 10 seconds
}

// Background එකෙන් දත්ත ඉල්ලීම.
if (domain !== "localhost" && !isEduSyncApp) { 
    safeSendMessage({ action: "GET_DATA", domain: domain }, (res) => {
        if (res && res.limit > 0) {
            spent = res.spent;
            limit = res.limit * 60;
            console.log(`📊 Tracking started for ${domain}. Limit: ${res.limit}m, Spent: ${Math.floor(res.spent/60)}m`);
            if (spent >= limit) blockSite();
            else { createTimerUI(); startCounting(); }
        }
    });
}

function startCounting() {
    if (timerActive) return;
    timerActive = true;
    const interval = setInterval(() => {
        spent++;
        createTimerUI();
        updateDisplay();
        if (spent % 10 === 0) {
            safeSendMessage({ action: "SAVE_USAGE", domain: domain, spent: spent });
        }
        if (spent >= limit) blockSite();
    }, 1000);
}

function updateDisplay() {
    const display = document.getElementById('edusync-time');
    if (!display) return;
    let timeLeft = limit - spent;
    let mins = Math.floor(timeLeft / 60);
    let secs = timeLeft % 60;
    display.innerText = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

function createTimerUI() {
    if (document.getElementById("edusync-floating-timer")) return;
    if (!document.body) return;
    const div = document.createElement("div");
    div.id = "edusync-floating-timer";
    div.innerHTML = `
        <button id="edusync-m" style="all:unset; cursor:pointer; color:white; font-weight:bold; font-size:18px; padding:0 10px;">-</button>
        <span id="edusync-time" style="font-family:monospace; font-weight:900; font-size:18px; margin:0 5px;">--:--</span>
        <button id="edusync-p" style="all:unset; cursor:pointer; color:white; font-weight:bold; font-size:18px; padding:0 10px;">+</button>
    `;
    Object.assign(div.style, {
        position: "fixed", top: "40px", right: "40px", padding: "10px 20px",
        background: "rgba(30, 41, 59, 0.85)", backdropFilter: "blur(12px)", 
        color: "white", borderRadius: "100px", border: "1px solid rgba(255,255,255,0.1)",
        zIndex: "2147483647", boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
        display: "flex", alignItems: "center", fontFamily: "monospace", transition: "all 0.3s ease"
    });
    document.body.appendChild(div);

    document.getElementById("edusync-p").onclick = () => {
        safeSendMessage({ action: "EXTEND_TIME", domain: domain, spent: spent }, (res) => {
            if (res && res.success) { limit = res.newLimit * 60; updateDisplay(); }
        });
    };
    
    document.getElementById("edusync-m").onclick = () => {
        safeSendMessage({ action: "REDUCE_TIME", domain: domain }, (res) => {
            if (res && res.success) { 
                limit = res.newLimit * 60; 
                updateDisplay(); 
                if (spent >= limit) blockSite();
            }
        });
    };
}

function blockSite() {
    if (document.getElementById("edusync-block-overlay")) return;
    
    console.log(`🔒 Site Blocked! Current Usage: ${Math.floor(spent/60)}m, Limit: ${Math.floor(limit/60)}m`);

    const overlay = document.createElement("div");
    overlay.id = "edusync-block-overlay";
    overlay.innerHTML = `
        <div style="background:#0f172a;height:100vh;width:100vw;display:flex;flex-direction:column;align-items:center;justify-content:center;color:white;font-family:sans-serif;text-align:center;">
            <h1 style="font-size:3rem;margin-bottom:20px;">TIME UP! ⏳</h1>
            <p style="margin-bottom:30px;font-size:1.2rem;color:#cbd5e1;">You've reached your limit for this site.</p>
            <div style="display:flex;gap:15px;">
                <button id="edusync-add-5" style="padding:12px 25px; background:#3b82f6; color:white; border:none; border-radius:10px; cursor:pointer; font-size:1rem; font-weight:bold;">Add 5 Minutes</button>
                <button id="edusync-dashboard" style="padding:12px 25px; background:#10b981; color:white; border:none; border-radius:10px; cursor:pointer; font-size:1rem; font-weight:bold;">Go to Dashboard</button>
            </div>
        </div>
    `;
    Object.assign(overlay.style, {
        position: "fixed", top: "0", left: "0", width: "100%", height: "100%",
        zIndex: "2147483647", backgroundColor: "#0f172a", display: "block"
    });
    
    if (document.body) {
        document.body.style.overflow = "hidden";
        document.body.appendChild(overlay);
    }

    document.getElementById("edusync-add-5").onclick = () => {
        safeSendMessage({ action: "EXTEND_TIME", domain: domain, spent: spent }, (res) => {
            if (res && res.success) { 
                if (document.body) document.body.style.overflow = "auto";
                location.reload(); 
            }
        });
    };

    document.getElementById("edusync-dashboard").onclick = () => {
        window.location.href = "http://localhost:5173"; 
    };
}