// BACKGROUND SCRIPT

const initEndpoint =
  "https://xl8dewabb6.execute-api.ap-southeast-2.amazonaws.com/default/InitSignal";
const getEndpoint =
  "https://xl8dewabb6.execute-api.ap-southeast-2.amazonaws.com/default/readSignal";

/** data type = [PublicKeyCredentialCreationOptions] */
const WEBAUTHN_REG_REQUEST = "WEBAUTHN_REG_REQUEST";

/** data type = [PublicKeyCredentialAttestationResponse] */
const WEBAUTHN_REG_RESPONSE = "WEBAUTHN_REG_RESPONSE";

/** data type = [PublicKeyCredentialRequestOptions] */
const WEBAUTHN_AUTH_REQUEST = "WEBAUTHN_AUTH_REQUEST";

/** data type = [PublicKeyCredentialAssertionResponse] */
const WEBAUTHN_AUTH_RESPONSE = "WEBAUTHN_AUTH_RESPONSE";

  /** data type = useNative: Boolean */
  const TOGGLE_NATIVE_CREDENTIALS = "TOGGLE_NATIVE_CREDENTIALS";

const genNonce = () => {
  //return 69;
  return Math.floor(Math.random() * 10000000);
};

const controller = () => {
  const startSimplePeer = () => {
    let serverPeer = new SimplePeer({ initiator: true, trickle: false });
    nonce = null;
    connected = false;

    // set up webrtc event handlers
    serverPeer.on("signal", (data) => {
      if (data.type == "offer") {
        console.log(data);
        var localNonce = genNonce();

        var postBody = {
          nonce: localNonce,
          initSignal: JSON.stringify(data),
        };

        axios.post(initEndpoint, postBody).then((res) => {
          console.log("posted");
          console.log(res);
          nonce = localNonce;
          pollForClientResponse();
        });
      }
    });

    serverPeer.on("connect", () => {
      console.log("connection!");
      connected = true;
      testMsgLoop();

      const testMsgLoop = () => {
        setTimeout(() => {
          serverPeer.send("test message!");
          testMsgLoop();
        }, 5000);
      };
    });

    serverPeer.on("data", (data) => {
      console.log("data! " + data.toString());
      try {
        console.log(JSON.stringify(data));
      } catch (e) {}

      handleClientDataRecieved(data.toString());
    });

    const pollForClientResponse = () => {
      if (enabled) {
        setTimeout(async () => {
          console.log("polling..");

          var res = await axios.post(getEndpoint, { nonce: nonce });

          console.log(res);

          if (res.data.Item.resSignal) {
            var clientResponse = res.data.Item.resSignal;

            console.log(clientResponse);

            serverPeer.signal(clientResponse);
          } else {
            pollForClientResponse();
          }
        }, 3000);
      }
    };

    return serverPeer;
  };

  var serverPeer = startSimplePeer();

  var nonce = null;
  var connected = false;
  var enabled = true;

  // set up extension comms event handlers
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.type) {
      case "getEnabled":
        sendResponse({ enabled: enabled });
        break;
      case "getNonce":
        sendResponse({ connected: connected, nonce: nonce });
        break;
      case "disabledWebRTC":
        enabled = false;
        serverPeer.destroy();
        // alert contentjs to alert injected
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          chrome.tabs.sendMessage(tabs[0].id, {
            type: TOGGLE_NATIVE_CREDENTIALS,
            data: {useNative: true}
          });
        });
        break;
      case "enabledWebRTC":
        enabled = true;
        serverPeer = startSimplePeer();
        // alert contentjs to alert injected
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          chrome.tabs.sendMessage(tabs[0].id, {
            type: TOGGLE_NATIVE_CREDENTIALS,
            data: {useNative: false}
          });
        });
        break;
      case WEBAUTHN_REG_REQUEST:
        if (connected) {
          chrome.tabs.query(
            { active: true, lastFocusedWindow: true },
            (tabs) => {
              var packagedData = {
                type: WEBAUTHN_REG_REQUEST,
                jsonData: JSON.stringify({
                  origin: message.data.origin,
                  publicKeyCredentialCreationOptions: message.data.data,
                }),
              };
              serverPeer.send(JSON.stringify(packagedData));
            }
          );
        }
        break;
      case WEBAUTHN_AUTH_REQUEST:
        if (connected) {
          chrome.tabs.query(
            { active: true, lastFocusedWindow: true },
            (tabs) => {
              //origin = tabs[0].url;

              var packagedData = {
                type: WEBAUTHN_AUTH_REQUEST,
                jsonData: JSON.stringify({
                  origin: message.data.origin,
                  publicKeyCredentialRequestOptions: message.data.data,
                }),
              };
              serverPeer.send(JSON.stringify(packagedData));
            }
          );
        }
        break;
      default:
        console.log("unrecog message");
    }
  });

  const handleClientDataRecieved = (data) => {
    var dataObj = JSON.parse(data);

    if (dataObj.data && dataObj.type) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, dataObj);
      });
    } else {
      console.log("received unknown message from client " + data);
    }
  };
};

const loadAxios = () => {
  // import axios
  var axiosJS = document.createElement("script");
  axiosJS.src = "minifiedLibs/axios.js";
  axiosJS.onload = controller;

  document.head.appendChild(axiosJS);
};

const loadSimplePeer = () => {
  // import simplepeer
  var simplePeerJS = document.createElement("script");
  simplePeerJS.src = "minifiedLibs/simplepeer.js";
  simplePeerJS.onload = loadAxios;

  document.head.appendChild(simplePeerJS);
};

loadSimplePeer();
