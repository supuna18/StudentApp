let timerElement = null;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "UPDATE_TIMER") {
        updateFloatingTimer(request.timeLeft, request.domain);
    }
    if (request.action === "BLOCK_SITE") {
        blockSite(request.domain);
    }
});

function updateFloatingTimer(seconds, domain) {
    if (!timerElement) createTimerUI(domain);
    
    let mins = Math.floor(seconds / 60);
    let secs = seconds % 60;
    const timeText = document.getElementById('edusync-time-display');
    if(timeText) timeText.innerText = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

    if (seconds < 60) {
        timerElement.style.background = "#ef4444";
    } else {
        timerElement.style.background = "#1e293b";
    }
}

function createTimerUI(domain) {
    if (document.getElementById("edusync-floating-timer")) return;
    
    timerElement = document.createElement("div");
    timerElement.id = "edusync-floating-timer";
    
    // UI එක ඇතුලතින් සෑදීම
    timerElement.innerHTML = `
        <button id="edusync-m-btn" style="background:none;border:none;color:white;cursor:pointer;font-weight:bold;padding:5px;font-size:18px;">-</button>
        <span id="edusync-time-display" style="margin:0 10px; font-weight:900; font-family:monospace; font-size:16px;">--:--</span>
        <button id="edusync-p-btn" style="background:none;border:none;color:white;cursor:pointer;font-weight:bold;padding:5px;font-size:18px;">+</button>
    `;
    
    Object.assign(timerElement.style, {
        position: "fixed", top: "20px", right: "20px", padding: "10px 20px",
        background: "#1e293b", color: "white", borderRadius: "50px",
        zIndex: "2147483647", boxShadow: "0 8px 20px rgba(0,0,0,0.4)",
        display: "flex", alignItems: "center", fontFamily: "sans-serif",
        cursor: "move", userSelect: "none"
    });
    
    document.body.appendChild(timerElement);

    // --- Dragging Logic ---
    let isDragging = false;
    let offset = { x: 0, y: 0 };

    timerElement.addEventListener('mousedown', (e) => {
        if (e.target.tagName === 'BUTTON') return; // බටන් එක ක්ලික් කළොත් ඇදගෙන යන්න එපා
        isDragging = true;
        offset.x = e.clientX - timerElement.getBoundingClientRect().left;
        offset.y = e.clientY - timerElement.getBoundingClientRect().top;
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        timerElement.style.left = (e.clientX - offset.x) + 'px';
        timerElement.style.top = (e.clientY - offset.y) + 'px';
        timerElement.style.right = 'auto';
    });

    document.addEventListener('mouseup', () => { isDragging = false; });

    // --- Click Listeners ---
    document.getElementById("edusync-p-btn").addEventListener("click", () => {
        chrome.runtime.sendMessage({ action: "EXTEND_TIME", domain: domain });
    });

    document.getElementById("edusync-m-btn").addEventListener("click", () => {
        chrome.runtime.sendMessage({ action: "REDUCE_TIME", domain: domain });
    });
}

function blockSite(domain) {
    if (timerElement) timerElement.remove();
    document.documentElement.innerHTML = `
        <head>
            <style>
                body { background: #0f172a !important; color: white !important; font-family: sans-serif !important; display: flex !important; align-items: center !important; justify-content: center !important; height: 100vh !important; margin: 0 !important; overflow: hidden !important; }
                .card { max-width: 500px; padding: 40px; background: #1e293b; border-radius: 30px; border: 1px solid #334155; text-align: center; box-shadow: 0 20px 50px rgba(0,0,0,0.5); }
                h1 { font-size: 50px; margin: 0; }
                .btn-green { width: 100%; padding: 15px; background: #10b981; color: white; border: none; border-radius: 15px; font-weight: bold; cursor: pointer; font-size: 18px; margin-bottom: 15px; }
                .btn-blue { display: block; padding: 15px; background: #3b82f6; color: white; text-decoration: none; border-radius: 15px; font-weight: bold; font-size: 16px; }
            </style>
        </head>
        <body>
            <div class="card">
                <div style="font-size: 60px; margin-bottom: 20px;">⌛</div>
                <h1>TIME UP!</h1>
                <p>You've reached your limit for <b>${domain}</b>.</p>
                <button id="edusync-extend-btn" class="btn-green">➕ Give me 5 more minutes</button>
                <a href="http://localhost:5173/student-dashboard" class="btn-blue">🏠 Back to Dashboard</a>
            </div>
        </body>
    `;

    setTimeout(() => {
        const btn = document.getElementById("edusync-extend-btn");
        if(btn) {
            btn.addEventListener("click", () => {
                chrome.runtime.sendMessage({ action: "EXTEND_TIME", domain: domain }, () => {
                    window.location.reload(); 
                });
            });
        }
    }, 500);
}