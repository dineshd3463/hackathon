// Function to update the Live Preview box
function updateLiveBox() {
    chrome.storage.local.get(['transcript'], (result) => {
        const box = document.getElementById('liveBox');
        if (result.transcript) {
            box.innerText = result.transcript;
            box.scrollTop = box.scrollHeight; // Auto-scroll to bottom
        }
    });
}

// Check for updates every second
setInterval(updateLiveBox, 1000);

document.getElementById('startBtn').addEventListener('click', () => {
    chrome.storage.local.remove(['transcript']); // Clear old data
    chrome.runtime.openOptionsPage();
    document.getElementById('startBtn').style.display = "none";
    document.getElementById('stopBtn').style.display = "block";
    document.getElementById('status').innerText = "Status: Recording...";
});

document.getElementById('stopBtn').addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: "STOP_RECORDING" });
    document.getElementById('stopBtn').style.display = "none";
    document.getElementById('startBtn').style.display = "block";
    document.getElementById('status').innerText = "Status: Stopped";
    alert("Recording stopped and saved!");
});

document.getElementById('downloadBtn').addEventListener('click', () => {
    chrome.storage.local.get(['transcript'], (result) => {
        if (!result.transcript) {
            alert("No data captured.");
            return;
        }
        const blob = new Blob([result.transcript], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Meet_Transcript.txt`;
        a.click();
    });
});