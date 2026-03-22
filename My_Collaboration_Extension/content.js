// BRIDGE: Listen for message from the React App window
window.addEventListener("message", (event) => {
    // Catch the specific signal sent by our Scheduler
    if (event.data.type && event.data.type === "START_FOCUS_MODE") {
        console.log("Extension received Start Focus signal!");
        
        // Forward it to background.js
        chrome.runtime.sendMessage({
            type: "START_FOCUS",
            duration: event.data.duration
        });
    }
});