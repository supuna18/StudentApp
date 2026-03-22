document.addEventListener('DOMContentLoaded', () => {
    const openBtn = document.getElementById('openHub');
    if (openBtn) {
        openBtn.addEventListener('click', () => {
            // Open the React Study Hub URL
            chrome.tabs.create({ url: 'http://localhost:5173/hub/study-groups' });
        });
    }
});