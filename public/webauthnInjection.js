(() => {
  /** data type = [PublicKeyCredentialCreationOptions] */
  const WEBAUTHN_REG_REQUEST = "WEBAUTHN_REG_REQUEST";

  /** data type = [PublicKeyCredentialAttestationResponse] */
  const WEBAUTHN_REG_RESPONSE = "WEBAUTHN_REG_RESPONSE";

  /** data type = [PublicKeyCredentialRequestOptions] */
  const WEBAUTHN_AUTH_REQUEST = "WEBAUTHN_AUTH_REQUEST";

  /** data type = [PublicKeyCredentialAssertionResponse] */
  const WEBAUTHN_AUTH_RESPONSE = "WEBAUTHN_AUTH_RESPONSE";

  //
  const pollAndResolveForData = (attempts, resolve, reject) => {
    setTimeout(() => {
      if (window.webauthnResolution != null) {
        resolve(window.webauthnResolution);
      } else {
        if (attempts > 15) {
          reject("didnt receive response");
        } else {
          pollAndResolveForData(attempts + 1, resolve, reject);
        }
      }
    }, 500);
  };

  const credentialsContainer = {
    async create(opts) {
      const jsonMessage = JSON.stringify(opts);

      window.dispatchEvent(
        new CustomEvent(WEBAUTHN_REG_REQUEST, { detail: opts })
      );

      window.addEventListener(WEBAUTHN_REG_RESPONSE, (data) => {
        window.webauthnResolution = data.detail;
        console.log("injectedjs recieved data from runner");
      });

      console.log(jsonMessage);

      return new Promise(function (resolve, reject) {
        pollAndResolveForData(0, resolve, reject);
        // setTimeout(() => {
        //   console.log("resolving now!");
        //   resolve(window.webauthnResolution);
        // }, 15000);
      });
    },
    async get(opts) {
      const jsonMessage = JSON.stringify(opts);

      window.dispatchEvent(
        new CustomEvent(WEBAUTHN_AUTH_REQUEST, { detail: opts })
      );

      window.addEventListener(WEBAUTHN_AUTH_RESPONSE, (data) => {
        window.webauthnResolution = data.detail;
      });

      console.log(jsonMessage);

      return new Promise(function (resolve, reject) {
        pollAndResolveForData(0, resolve, reject);
        // setTimeout(() => {
        //   console.log("resolving now!!");
        //   resolve(window.webauthnResolution);
        // }, 15000);
      });
    },
  };

  Object.assign(navigator.credentials, credentialsContainer);
})();
