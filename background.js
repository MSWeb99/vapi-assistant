// Service Worker (background.js)
self.addEventListener("install", () => {
  console.log("Service Worker Installed");
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker Activated");
  event.waitUntil(self.clients.claim());
});

// Open a specific URL when the extension is installed
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    chrome.tabs.create({
      url: chrome.runtime.getURL("popup.html"),
      active: true,
    });
    console.log("Extension Installed");
  }
});

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Received message in background.js:", message);

  switch (message.action) {
    case "sendToVAPI":
      sendToVAPI(message.transcript)
        .then((response) => {
          console.log("VAPI Response:", response);
          sendResponse({ status: "success", data: response });
        })
        .catch((error) => {
          console.error("Error in sendToVAPI:", error);
          sendResponse({ status: "error", message: error.message });
        });
      return true; // Keeps the sendResponse channel open for async tasks

    case "startSpeechRecognition":
      startVoiceRecognition();
      sendResponse({
        status: "success",
        message: "Speech recognition started.",
      });
      break;

    case "stopSpeechRecognition":
      stopVoiceRecognition();
      sendResponse({
        status: "success",
        message: "Speech recognition stopped.",
      });
      break;

    default:
      console.warn("Unknown action:", message.action);
      sendResponse({ status: "error", message: "Unknown action." });
      break;
  }
});

// Function to simulate sending data to a VAPI API
async function sendToVAPI(transcript) {
  const apiUrl =
    "https://api.vapi.ai/assistant/05cb31f4-a84d-4cb1-8143-be72bc5e73da"; // Replace with actual endpoint
  const apiKey = "52ededa7-981f-45f4-8c11-6fd95fa3a325"; // Replace with your API key

  try {
    // const response = await fetch(apiUrl, {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //     Authorization: `Bearer ${apiKey}`,
    //   },
    //   body: JSON.stringify({
    //     query: transcript, // Send the transcript to VAPI
    //   }),
    // });

    // if (!response.ok) {
    //   throw new Error(`API call failed with status ${response.status}`);
    // }

    // const data = await response.json();
    // console.log("VAPI API Response Data:", data);

    const data = { reply: "HI How can I help you" };
    speakText(data.reply);
    // Return the parsed response
    return data;
  } catch (error) {
    console.error("Failed to communicate with VAPI:", error);
    throw error;
  }
}

// Speech Recognition Handling
let recognition;
let isRecording = false;

function initializeRecognition() {
  const SpeechRecognition =
    self.SpeechRecognition || self.webkitSpeechRecognition;

  recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = "en-US";

  recognition.onstart = () => {
    console.log("Voice recognition started...");
    isRecording = true;
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    console.log("Recognized speech:", transcript);

    // Send the recognized transcript to other parts of the extension
    chrome.runtime.sendMessage({ action: "speechResult", transcript });
  };

  recognition.onerror = (event) => {
    console.error("Recognition error:", event.error);
  };

  recognition.onend = () => {
    console.log("Voice recognition ended.");
    isRecording = false;
  };
}

async function startVoiceRecognition() {
  return navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
    console.log("Microphone access granted.");
    if (!recognition) {
      initializeRecognition();
    }
    recognition.start();
  });
}

function stopVoiceRecognition() {
  if (recognition && isRecording) {
    recognition.stop();
    console.log("Voice recognition stopped.");
    isRecording = false;
  }
}

function speakText(text) {
  if (chrome && chrome.tts) {
    chrome.tts.speak(text, {
      lang: "en-US", // Set language
      rate: 1.0, // Set speed
      pitch: 1.0, // Set pitch
      volume: 1.0, // Set volume
      onEvent: (event) => {
        if (event.type === "error") {
          console.error("TTS Error:", event.errorMessage);
        }
      },
    });
  } else {
    console.error("chrome.tts is not available.");
  }
}
