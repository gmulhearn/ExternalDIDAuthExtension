// inject webauthn overwrites into each page
var s = document.createElement("script");
s.src = chrome.runtime.getURL("webauthnInjection.js");
s.onload = function () {
  this.remove();
};
(document.head || document.documentElement).appendChild(s);

/**----------------------------------------------------------- */

/** data type = [PublicKeyCredentialCreationOptions] */
const WEBAUTHN_REG_REQUEST = "WEBAUTHN_REG_REQUEST";

/** data type = [PublicKeyCredentialAttestationResponse] */
const WEBAUTHN_REG_RESPONSE = "WEBAUTHN_REG_RESPONSE";

/** data type = [PublicKeyCredentialRequestOptions] */
const WEBAUTHN_AUTH_REQUEST = "WEBAUTHN_AUTH_REQUEST";

/** data type = [PublicKeyCredentialAssertionResponse] */
const WEBAUTHN_AUTH_RESPONSE = "WEBAUTHN_AUTH_RESPONSE";

/**------------------------------------------------------------ */

/** listen for messages from injected and forward to the wrtc controller (background) */
window.addEventListener(WEBAUTHN_REG_REQUEST, (event) => {
  console.log("webrtc controller recieved webauthn reg request: ");
  console.log(event);

  // forward to controller
  chrome.runtime.sendMessage({
    type: WEBAUTHN_REG_REQUEST,
    data: event.detail,
  });
});

window.addEventListener(WEBAUTHN_AUTH_REQUEST, (event) => {
  console.log("webrtc controller recieved webauthn auth request: ");
  console.log(event);

  // forward to controller
  chrome.runtime.sendMessage({
    type: WEBAUTHN_AUTH_REQUEST,
    data: event.detail,
  });
});

/** listen for messages from wrtc controller and forward to the injected (webpage) */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("message!");

  if (message.type && message.data) {
    window.dispatchEvent(
      new CustomEvent(message.type, { detail: message.data })
    );
  } else {
    console.log("unrecognised message recieved");
  }
});
