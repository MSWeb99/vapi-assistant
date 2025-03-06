// Select DOM elements
const micButton = document.getElementById("mic-button");
const chatWindow = document.getElementById("chat-window");

let recognition;
let isRecording = false;

// Check for browser compatibility
function isSpeechRecognitionSupported() {
  return "webkitSpeechRecognition" in window || "SpeechRecognition" in window;
}

// Initialize voice recognition
function initializeRecognition() {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false; // Only finalize results
  recognition.lang = "en-US";

  // Event handlers
  recognition.onstart = () => {
    isRecording = true;
    appendMessage("Assistant", "Listening...");
    console.log("Voice recognition started...");
  };

  recognition.onresult = async (event) => {
    const transcript = event.results[0][0].transcript;
    appendMessage("User", transcript);
    console.log("vapiInstance");
    // Send the transcript to the background script for VapiAI processing
    chrome.runtime.sendMessage(
      { action: "sendToVAPI", transcript },
      (response) => {
        if (chrome.runtime.lastError) {
          console.error("Error sending message:", chrome.runtime.lastError);
          appendMessage("Assistant", "Error communicating with the assistant.");
          return;
        }

        // Handle the response from VapiAI
        if (response && response.status === "success" && response.data.reply) {
          appendMessage("Assistant", response.data.reply);
        } else {
          appendMessage("Assistant", "No response from assistant.");
        }
      }
    );
  };

  recognition.onerror = (event) => {
    console.error("Recognition error:", event.error);
    appendMessage("Assistant", `Error: ${event.error}`);
    if (event.error === "not-allowed") {
      alert(
        "Microphone access is blocked. Please allow it in your browser settings."
      );
    }
  };

  recognition.onend = () => {
    isRecording = false;
    console.log("Voice recognition ended.");
    appendMessage("Assistant", "Stopped listening.");
  };
}

// Start voice recognition
function startVoiceRecognition() {
  if (!recognition) {
    initializeRecognition();
  }

  navigator.mediaDevices
    .getUserMedia({ audio: true })
    .then(() => {
      console.log("Microphone access granted.");
      recognition.start();
    })
    .catch((error) => {
      console.error("Error accessing microphone:", error);
      alert(
        "Microphone access is required to use voice recognition. Please allow it in your browser settings."
      );
    });
}

// Stop voice recognition
function stopVoiceRecognition() {
  if (recognition && isRecording) {
    recognition.stop();
    isRecording = false;
    console.log("Voice recognition stopped.");
  }
}

// Display messages in chat window
function appendMessage(sender, message) {
  const messageElement = document.createElement("div");
  messageElement.className = `message ${sender.toLowerCase()}`;
  messageElement.innerText = `${sender}: ${message}`;
  chatWindow.appendChild(messageElement);

  // Scroll to the bottom of the chat window
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Speak the assistant's response (optional)
function speakResponse(text) {
  if ("speechSynthesis" in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
  } else {
    console.error("Speech synthesis not supported.");
  }
}

// Microphone button event listener
micButton.addEventListener("click", () => {
  if (!isSpeechRecognitionSupported()) {
    alert("Speech Recognition is not supported in this browser.");
    return;
  }

  if (isRecording) {
    stopVoiceRecognition();
    micButton.textContent = "🎤"; // Reset button icon
  } else {
    startVoiceRecognition();
    micButton.textContent = "⏹"; // Change to stop icon
  }
});
