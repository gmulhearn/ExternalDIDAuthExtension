var s = document.createElement("script");
s.src = chrome.runtime.getURL('content.js');
s.onload = function() {
  this.remove();
};
(document.head || document.documentElement).appendChild(s);

// chrome.runtime.onMessage.addListener((message, response, sendResponse) => {
//   console.log("contentjs receive msg!")
//   console.log(message)
//   console.log(window.testData)
//   sendResponse({txt: "hello back!"})
// })

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

