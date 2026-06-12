(function () {
  function jsonp(url, params = {}) {
    return new Promise((resolve, reject) => {
      const callbackName = `wc26_${Date.now()}_${Math.random().toString(16).slice(2)}`;
      const requestUrl = new URL(url);
      Object.entries(params).forEach(([key, value]) => requestUrl.searchParams.set(key, value));
      requestUrl.searchParams.set("callback", callbackName);

      const script = document.createElement("script");
      const timer = window.setTimeout(() => {
        cleanup();
        reject(new Error("Tiempo agotado consultando GAS"));
      }, 10000);

      function cleanup() {
        window.clearTimeout(timer);
        delete window[callbackName];
        script.remove();
      }

      window[callbackName] = (payload) => {
        cleanup();
        resolve(payload);
      };
      script.onerror = () => {
        cleanup();
        reject(new Error("No se pudo cargar JSONP desde GAS"));
      };
      script.src = requestUrl.toString();
      document.head.appendChild(script);
    });
  }

  async function fetchJson(url) {
    const cacheBust = window.APP_CONFIG?.appVersion || Date.now();
    const requestUrl = `${url}${url.includes("?") ? "&" : "?"}v=${encodeURIComponent(cacheBust)}`;
    const response = await fetch(requestUrl, { cache: "no-cache" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  }

  async function loadWorldCupData() {
    const config = window.APP_CONFIG;
    const status = {
      source: "local_json",
      backend: "fallback_local",
      loadedAt: new Date().toISOString(),
      error: null
    };

    if (config.gasExecUrl) {
      try {
        const payload = await jsonp(config.gasExecUrl, { action: "bootstrap" });
        if (payload && payload.ok && payload.data) {
          status.source = "gas";
          status.backend = "gas_jsonp";
          return { data: payload.data, status };
        }
        throw new Error(payload?.error || "Respuesta GAS sin datos");
      } catch (error) {
        status.error = error.message;
      }
    }

    const data = await fetchJson(config.dataUrl);
    return { data, status };
  }

  window.WorldCupData = {
    loadWorldCupData
  };
})();

