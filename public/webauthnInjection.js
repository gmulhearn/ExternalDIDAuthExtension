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

      console.log(opts);

      // convert challenge to Uint8Array if it's not already - for stringifying
      opts.publicKey.challenge = new Uint8Array(opts.publicKey.challenge);

      const jsonMessage = JSON.stringify(opts);

      console.log(jsonMessage);

      // occasionally ref is nulled out causing issues, cloning solves this
      const optsClone = JSON.parse(JSON.stringify(opts));

      const data = { origin: window.origin, data: optsClone };

      window.dispatchEvent(
        new CustomEvent(WEBAUTHN_REG_REQUEST, { detail: data })
      );

      window.addEventListener(WEBAUTHN_REG_RESPONSE, (data) => {
        let regResponse = data.detail;

        // Convert to Uint8Arrays (ArrayBuffer type) - some require this
        regResponse.rawId = new Uint8Array(regResponse.rawId);
        regResponse.response.attestationObject = new Uint8Array(
          regResponse.response.attestationObject
        );
        regResponse.response.clientDataJSON = new Uint8Array(
          regResponse.response.clientDataJSON
        );

        window.webauthnResolution = regResponse;
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

      console.log(opts);

      const jsonMessage = JSON.stringify(opts);

      // convert challenge to Uint8Array if it's not already - for stringifying
      opts.publicKey.challenge = new Uint8Array(opts.publicKey.challenge);
      opts.publicKey.allowCredentials = opts.publicKey.allowCredentials.map(
        (cred) => {
          return { type: cred.type, id: new Uint8Array(cred.id) };
        }
      );

      // occasionally ref is nulled out causing issues, cloning solves this
      const optsClone = JSON.parse(JSON.stringify(opts));

      const data = { origin: window.origin, data: optsClone };

      window.dispatchEvent(
        new CustomEvent(WEBAUTHN_AUTH_REQUEST, { detail: data })
      );

      window.addEventListener(WEBAUTHN_AUTH_RESPONSE, (data) => {
        let regResponse = data.detail;

        // Convert to Uint8Arrays (ArrayBuffer type) - some require this
        regResponse.rawId = new Uint8Array(regResponse.rawId);
        regResponse.response.authenticatorData = new Uint8Array(
          regResponse.response.authenticatorData
        );
        regResponse.response.clientDataJSON = new Uint8Array(
          regResponse.response.clientDataJSON
        );
        regResponse.response.signature = new Uint8Array(
          regResponse.response.signature
        );
        regResponse.response.userHandle = new Uint8Array(
          regResponse.response.userHandle
        );

        window.webauthnResolution = regResponse;
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

      // force cred type optionally:
      // opts.publicKey.pubKeyCredParams = [{type: "public-key", alg: -7}]

      return new Promise(async (resolve, reject) => {
        let res = await nativeCredentials.create.bind(navigator.credentials)(
          opts
        );
        console.log("got native result:");
        console.log(res);
        resolve(res);
      });

      //return nativeCredentials.create.bind(navigator.credentials)(opts);
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
