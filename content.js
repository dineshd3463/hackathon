// content.js - Injected into meet.google.com
let overlay = document.createElement('div');
overlay.id = "ai-transcribe-box";
overlay.style.cssText = `
    position: fixed; bottom: 100px; left: 20px; width: 320px; max-height: 200px;
    background: rgba(0, 0, 0, 0.8); color: #00ff00; padding: 15px;
    border-radius: 12px; font-family: 'Courier New', monospace; font-size: 14px;
    overflow-y: auto; z-index: 99999; border: 1px solid #444;
    box-shadow: 0 8px 32px rgba(0,0,0,0.5); pointer-events: none;
    display: none; line-height: 1.4; scroll-behavior: smooth;
`;
overlay.innerText = "AI initialized...";
document.body.appendChild(overlay);

// Receive text updates from the Options Tab
chrome.runtime.onMessage.addListener((request) => {
    if (request.type === "UPDATE_TRANSCRIPT") {
        overlay.style.display = "block";
        overlay.innerText = "🎤 " + request.text;
        overlay.scrollTop = overlay.scrollHeight;
    }
});