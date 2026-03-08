chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "BLOCK_SITE") {
        
        // මුළු වෙබ් පිටුවම වසා දමන රතු පාට ආරක්ෂිත ආවරණය (Overlay)
        const warningOverlay = document.createElement('div');
        warningOverlay.id = "edusync-guardian-blocker";
        warningOverlay.style = `
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: linear-gradient(135deg, #dc2626 0%, #7f1d1d 100%);
            z-index: 2147483647; display: flex; align-items: center;
            justify-content: center; color: white; font-family: 'Segoe UI', Tahoma, sans-serif;
            margin: 0; padding: 0; overflow: hidden;
        `;

        warningOverlay.innerHTML = `
            <div style="background: white; padding: 60px; border-radius: 40px; color: #1e293b; max-width: 550px; text-align: center; box-shadow: 0 40px 100px rgba(0,0,0,0.6);">
                <div style="font-size: 90px; margin-bottom: 20px;">🛑</div>
                <h1 style="font-size: 42px; font-weight: 900; margin: 0 0 15px 0; color: #dc2626; letter-spacing: -2px;">ACCESS DENIED!</h1>
                <p style="font-size: 18px; line-height: 1.6; color: #64748b; margin-bottom: 35px;">
                    The website <b>${request.url}</b> has been reported as unsafe by EduSync Guardian. Access is restricted for your safety.
                </p>
                <button id="goBackSafe" style="background: #dc2626; color: white; border: none; padding: 20px 50px; font-size: 20px; font-weight: bold; border-radius: 20px; cursor: pointer; transition: all 0.2s; box-shadow: 0 10px 30px rgba(220, 38, 38, 0.4);">
                    GET ME BACK TO SAFETY
                </button>
            </div>
        `;

        // මුල් වෙබ් පිටුවේ සියලු දත්ත ඉවත් කර රතු screen එක දමයි
        document.documentElement.innerHTML = ""; 
        document.documentElement.appendChild(warningOverlay);

        // බොත්තම එබූ විට Dashboard එකට යවයි
        document.getElementById('goBackSafe').onclick = () => {
            window.location.href = "http://localhost:5173/student-dashboard/safety";
        };
    }
});