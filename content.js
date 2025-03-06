// content.js - Content script for AI Voice Assistant Chrome Extension

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Message received in content.js:", message);
  if (message.action === "displayResponse") {
    displayResponse(message.text);
    sendResponse({ status: "displayed" });
  } else if (message.action === "speakResponse") {
    speakResponse(message.text);
    sendResponse({ status: "spoken" });
  }
  return true; // Keeps the sendResponse channel open
});

function displayResponse(response) {
  console.log("Displaying response:", response);
  const messageBox = document.createElement("div");
  messageBox.style = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background-color: #333;
    color: white;
    padding: 10px;
    border-radius: 5px;
    z-index: 9999;
  `;
  messageBox.innerText = response;
  document.body.appendChild(messageBox);

  setTimeout(() => {
    document.body.removeChild(messageBox);
  }, 5000);
}

function speakResponse(text) {
  console.log("speakResponse invoked with text:", text);
  if ("speechSynthesis" in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.onstart = () => console.log("Speech synthesis started.");
    utterance.onend = () => console.log("Speech synthesis completed.");
    utterance.onerror = (error) =>
      console.error("Speech synthesis error:", error);
    window.speechSynthesis.speak(utterance);
  } else {
    console.error("Speech synthesis not supported in this browser.");
  }
}
