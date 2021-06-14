var s = document.createElement("script");
s.src = chrome.runtime.getURL('webauthnInjection.js');
s.onload = function() {
  this.remove();
};
(document.head || document.documentElement).appendChild(s);


var webauthnData = null;

window.addEventListener("fromInjected", (data) => {
  console.log(data.detail)

  webauthnData = data.detail;
}, false)

chrome.runtime.onMessage.addListener(
  (message, sender, sendResponse) => {
    switch(message.type) {
      case "getWebAuthn":
        sendResponse(webauthnData);
        break;
      case "injectData":
        console.log(message.data);
        window.dispatchEvent(new CustomEvent("injectData", {detail: message.data}));
        break;
      default:
        console.log("unrecog message")
    }
  }
)

