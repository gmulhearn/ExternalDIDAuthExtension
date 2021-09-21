(() => {
  console.log("begin injection");

  const nativeCredentials = {
    create: navigator.credentials.create,
    get: navigator.credentials.get,
  };

  const authenticatorExtensionsAppIDExcludeOutputTrue = () => {
    let result = {
      appidExclude: true,
    };

    return result;
  };

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

  //
  const pollAndResolveForData = (attempts, resolve, reject) => {
    setTimeout(() => {
      if (window.webauthnResolution != null) {
        console.log("got data, now resolving:");
        console.log(window.webauthnResolution);

        var enc = new TextDecoder("utf-8");

        console.log(
          enc.decode(
            new Uint8Array(window.webauthnResolution.response.clientDataJSON)
          )
        );
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

  const customCredentialsContainer = {
    create(opts) {
      window.webauthnResolution = null;

      const jsonMessage = JSON.stringify(opts);

      console.log(jsonMessage);

      const data = { origin: window.origin, data: opts };

      window.dispatchEvent(
        new CustomEvent(WEBAUTHN_REG_REQUEST, { detail: data })
      );

      window.addEventListener(WEBAUTHN_REG_RESPONSE, (data) => {
        window.webauthnResolution = data.detail;
        console.log("injectedjs recieved data from runner");
      });

      return new Promise(function (resolve, reject) {
        pollAndResolveForData(
          0,
          (resolvedData) => {
            resolvedData.getClientExtensionResults =
              authenticatorExtensionsAppIDExcludeOutputTrue;
            resolve(resolvedData);
          },
          reject
        );
      });
    },
    get(opts) {
      window.webauthnResolution = null;

      const jsonMessage = JSON.stringify(opts);

      const data = { origin: window.origin, data: opts };

      window.dispatchEvent(
        new CustomEvent(WEBAUTHN_AUTH_REQUEST, { detail: data })
      );

      window.addEventListener(WEBAUTHN_AUTH_RESPONSE, (data) => {
        window.webauthnResolution = data.detail;
      });

      console.log(jsonMessage);

      return new Promise(function (resolve, reject) {
        pollAndResolveForData(0, resolve, reject);
      });
    },
  };

  // WRAPPER OVER NATIVE CREDENTIALS USED FOR DEBUGGING
  const nativeCredentialsContainer = {
    create(opts) {
      console.log("debugging create credential...");
      console.log(opts);

      return nativeCredentials.create.bind(navigator.credentials)(opts);
    },
    get(opts) {
      console.log("debugging get credential...");
      console.log(opts);

      return nativeCredentials.get.bind(navigator.credentials)(opts);
    },
  };

  window.addEventListener(TOGGLE_NATIVE_CREDENTIALS, (data) => {
    if (data.detail.useNative === true) {
      Object.assign(navigator.credentials, nativeCredentialsContainer);
    } else if (data.detail.useNative === false) {
      Object.assign(navigator.credentials, customCredentialsContainer);
    }
  });

  Object.assign(navigator.credentials, customCredentialsContainer);
  console.log("nav creds injected");
})();
