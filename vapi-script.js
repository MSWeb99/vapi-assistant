var vapiInstance = null;
const assistant = "05cb31f4-a84d-4cb1-8143-be72bc5e73da"; // Substitute with your assistant ID
const apiKey = "52ededa7-981f-45f4-8c11-6fd95fa3a325"; // Substitute with your Public key from Vapi Dashboard.
const buttonConfig = {}; // Modify this as required

(function (d, t) {
  var g = document.createElement(t),
    s = d.getElementsByTagName(t)[0];
  g.src = "scripts/vapi_ai.js";
  g.defer = true;
  g.async = true;
  s.parentNode.insertBefore(g, s);

  g.onload = function () {
    vapiInstance = window.vapiSDK.run({
      apiKey: apiKey, // mandatory
      assistant: assistant, // mandatory
      config: buttonConfig, // optional
    });
  };
})(document, "script");
