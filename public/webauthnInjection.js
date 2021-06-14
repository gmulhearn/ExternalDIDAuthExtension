(() => {

  const credentialsContainer = {
    async create(opts) {

      const jsonMessage = JSON.stringify(opts);
      
      window.dispatchEvent(new CustomEvent("fromInjected", {detail: opts}));

      window.addEventListener("injectData", (data) => {
        window.webauthnData = data.detail;
        console.log("injectedjs recieved data from runner");
      })

      console.log(jsonMessage);

      return new Promise(function (resolve, reject) {
        setTimeout(() => {
          console.log("resolving now!")
          resolve(window.webauthnData);
        }, 15000);
      });
    },
    async get(opts) {
      const jsonMessage = JSON.stringify(opts);

      window.dispatchEvent(new CustomEvent("fromInjected", {detail: opts}));

      window.addEventListener("injectData", (data) => {
        window.webauthnData = data.detail;
        console.log("injectedjs recieved data from runner");
      })

      console.log(jsonMessage);

      return new Promise(function (resolve, reject) {
        setTimeout(() => {
          console.log("resolving now!!")
          resolve(window.webauthnData);
        }, 15000);
      });
    },
  };


  Object.assign(navigator.credentials, credentialsContainer);
})();
