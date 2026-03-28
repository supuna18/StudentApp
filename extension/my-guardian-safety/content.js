// පූරණය වූ වහාම URL එක පරීක්ෂා කිරීම (බොහෝවිට background script එක මෙයට කලින් ක්‍රියාත්මක වේ)
function checkCurrentUrl() {
    chrome.runtime.sendMessage({ 
        action: "CHECK_URL", 
        url: window.location.href 
    }, (response) => {
        if (response && response.unsafeSite === true) {
            renderBlockScreen(window.location.href);
        }
    });
}

// Background script එකෙන් ලැබෙන "BLOCK_SITE" පණිවිඩය බලා සිටියි
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "BLOCK_SITE") {
        renderBlockScreen(request.url);
    }
});

// බ්ලොක් ස්ක්‍රීන් එක පෙන්වීම
function renderBlockScreen(url) {
    console.log("EduSync Guardian: Blocking site -", url);
    
    // වෙබ් පිටුවේ සියලුම දත්ත ඉවත් කර බ්ලොක් කළ පණිවිඩය පෙන්වයි
    document.documentElement.innerHTML = `
        <head>
            <title>Access Blocked | EduSync Guardian</title>
            <style>
                body {
                    background-color: #0f172a;
                    color: white;
                    margin: 0;
                    padding: 0;
                    height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
                    overflow: hidden;
                }
                .container {
                    text-align: center;
                    max-width: 600px;
                    padding: 40px;
                }
                .icon {
                    width: 120px;
                    height: 120px;
                    margin-bottom: 30px;
                    filter: drop-shadow(0 0 20px rgba(59, 130, 246, 0.3));
                }
                h1 {
                    font-size: 3rem;
                    font-weight: 900;
                    margin: 0 0 10px 0;
                    letter-spacing: -0.02em;
                    color: #f8fafc;
                }
                p {
                    font-size: 1.1rem;
                    color: #94a3b8;
                    line-height: 1.6;
                    margin-bottom: 30px;
                }
                .url-box {
                    background: #1e293b;
                    padding: 10px 20px;
                    border-radius: 12px;
                    border: 1px solid #334155;
                    font-family: monospace;
                    font-size: 0.9rem;
                    color: #3b82f6;
                    word-break: break-all;
                    margin-bottom: 30px;
                }
                .btn {
                    display: inline-block;
                    background: #2563eb;
                    color: white;
                    padding: 16px 32px;
                    border-radius: 14px;
                    font-weight: 800;
                    text-decoration: none;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    font-size: 0.9rem;
                    box-shadow: 0 10px 25px -5px rgba(37, 99, 235, 0.4);
                    transition: all 0.2s;
                    border: none;
                    cursor: pointer;
                }
                .btn:hover {
                    background: #1d4ed8;
                    transform: translateY(-2px);
                    box-shadow: 0 15px 30px -5px rgba(37, 99, 235, 0.5);
                }
                .btn:active {
                    transform: translateY(0);
                }
            </style>
        </head>
        <body>
            <div class="container">
                <img src="https://cdn-icons-png.flaticon.com/512/752/752674.png" class="icon" alt="Shield Icon">
                <h1>Access Blocked</h1>
                <p>EduSync Guardian has restricted access to this content to keep your workspace safe and focused.</p>
                <div class="url-box">${url}</div>
                <a href="http://localhost:5173/student-dashboard/safety" class="btn">Go Back to Safety</a>
            </div>
        </body>
    `;
}

// ආරම්භක පරීක්ෂාව
checkCurrentUrl();