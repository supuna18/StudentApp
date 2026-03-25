// content.js
// background.js එකෙන් ලැබෙන "BLOCK_SITE" පණිවිඩය බලා සිටියි
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "BLOCK_SITE") {
        console.log("EduSync Guardian: Blocking site -", request.url);
        
        // වෙබ් පිටුවේ සියලුම දත්ත ඉවත් කර බ්ලොක් කළ පණිවිඩය පෙන්වයි
        document.body.innerHTML = `
            <div style="
                position: fixed; 
                top: 0; left: 0; 
                width: 100vw; height: 100vh; 
                background-color: #0f172a; 
                color: white; 
                z-index: 999999; 
                display: flex; 
                flex-direction: column; 
                align-items: center; 
                justify-content: center; 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                text-align: center;
            ">
                <img src="https://cdn-icons-png.flaticon.com/512/752/752674.png" style="width: 150px; margin-bottom: 20px;">
                <h1 style="font-size: 50px; margin: 10px;">Access Blocked</h1>
                <p style="font-size: 22px;">EduSync Guardian has blocked <strong>${request.url}</strong> for your safety.</p>
                <button onclick="window.history.back()" style="
                    margin-top: 20px;
                    padding: 15px 30px; 
                    font-size: 18px; 
                    cursor: pointer; 
                    background-color: #ef4444; 
                    color: white; 
                    border: none; 
                    border-radius: 8px;
                    font-weight: bold;
                ">Go Back to Safety</button>
            </div>
        `;
    }
});