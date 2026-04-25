window.addEventListener("message", (event) => {
    // Safety check: only accept from our own origin
    if (event.origin !== "http://localhost:5173") return;

    if (event.data.type === "START_FOCUS_MODE") {
        chrome.runtime.sendMessage({
            type: "START_FOCUS",
            duration: event.data.duration
        });
    }
});