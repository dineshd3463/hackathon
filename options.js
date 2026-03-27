let fullTranscript = "";
let isRecording = false;
let recognition;

async function startTranscription() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        alert("Your browser does not support Speech Recognition.");
        return;
    }

    try {
        // 1. REQUEST PERMISSIONS (Must happen on click)
        // This captures the meeting audio + your mic
        const stream = await navigator.mediaDevices.getDisplayMedia({ 
            video: true, 
            audio: { echoCancellation: true } 
        });
        
        // 2. Setup Native Speech Engine
        recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
            let interim = "";
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    fullTranscript += event.results[i][0].transcript + " ";
                } else {
                    interim += event.results[i][0].transcript;
                }
            }
            updateLiveText(fullTranscript + interim);
        };

        recognition.start();
        isRecording = true;
        showRecordingUI();

    } catch (err) {
        console.error("Capture failed:", err);
        alert("Permission denied. You must 'Share Audio' in the popup.");
    }
}

function updateLiveText(text) {
    const preview = document.getElementById('live-preview');
    if (preview) {
        preview.innerText = text;
        preview.scrollTop = preview.scrollHeight;
    }
    // Sync with Google Meet Overlay
    chrome.tabs.query({url: "https://meet.google.com/*"}, (tabs) => {
        tabs.forEach(tab => {
            chrome.tabs.sendMessage(tab.id, { type: "UPDATE_TRANSCRIPT", text: text }).catch(() => {});
        });
    });
}

function showRecordingUI() {
    document.querySelector('.card').innerHTML = `
        <div style="border: 2px solid #ff4444; padding: 25px; border-radius: 12px; background: #1a1a1a;">
            <h2 style="color: #ff4444; animation: blink 1s infinite;">● LIVE TRANSCRIBING</h2>
            <p style="font-size: 12px; color: #aaa;">Don't close this tab! You can switch to Meet now.</p>
            <div id="live-preview" style="height:300px; overflow-y:auto; background:#000; color:#00ff00; padding:15px; margin: 15px 0; text-align:left; font-family:monospace; border: 1px solid #333; white-space: pre-wrap;">Listening...</div>
            <button id="stopBtn" style="background:#ff4444; color:white; padding:12px; width:100%; border:none; border-radius:8px; cursor:pointer; font-weight:bold;">STOP & SAVE</button>
        </div>
    `;

    document.getElementById('stopBtn').onclick = () => {
        recognition.stop();
        const blob = new Blob([fullTranscript], { type: 'text/plain' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `Meeting_Notes_${new Date().getTime()}.txt`;
        a.click();
        window.close();
    };
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('authBtn').onclick = startTranscription;
});