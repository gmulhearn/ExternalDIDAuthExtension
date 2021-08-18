(() => {
  console.log("begin injection")
  
  const nativeCredentials = {
    create: navigator.credentials.create,
    get: navigator.credentials.get,
};

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
        console.log("got data, now resolving:");
        console.log(window.webauthnResolution);

         var enc = new TextDecoder("utf-8")

        console.log(enc.decode(new Uint8Array(window.webauthnResolution.response.clientDataJSON)))
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


    create(opts) {
      const jsonMessage = JSON.stringify(opts);
            
      console.log(jsonMessage);

      // return nativeCredentials.create.bind(navigator.credentials)(opts);

      const data = {origin: window.origin, data: opts}

      window.dispatchEvent(
        new CustomEvent(WEBAUTHN_REG_REQUEST, { detail: data })
      );

      window.addEventListener(WEBAUTHN_REG_RESPONSE, (data) => {
        window.webauthnResolution = data.detail;
        console.log("injectedjs recieved data from runner");
      });


      return new Promise(function (resolve, reject) {
        pollAndResolveForData(0, resolve, reject);
      });
    },
    get(opts) {
      const jsonMessage = JSON.stringify(opts);

      const data = {origin: window.origin, data: opts}


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

  Object.assign(navigator.credentials, credentialsContainer);
  console.log("nav creds injected")
})();
