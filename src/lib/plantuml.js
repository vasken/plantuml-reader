const CHEERPJ_LOADER = "https://cjrtnc.leaningtech.com/2.3/loader.js";
const PLANTUML_LOADER = "/vendor/plantuml/plantuml.js";
const PLANTUML_APP_BASE_PATH = "/app/vendor/plantuml";

let initPromise;

function injectScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      if (existing.dataset.loaded === "true") {
        resolve();
        return;
      }

      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error(`Failed to load ${src}`)), {
        once: true,
      });
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.addEventListener(
      "load",
      () => {
        script.dataset.loaded = "true";
        resolve();
      },
      { once: true },
    );
    script.addEventListener("error", () => reject(new Error(`Failed to load ${src}`)), {
      once: true,
    });
    document.head.appendChild(script);
  });
}

async function injectPlantUmlRuntime(src) {
  const existing = document.querySelector(`script[data-plantuml-runtime="${src}"]`);
  if (existing) {
    if (existing.dataset.loaded === "true") {
      return;
    }

    await new Promise((resolve, reject) => {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error(`Failed to load ${src}`)), {
        once: true,
      });
    });
    return;
  }

  const response = await fetch(src);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${src}`);
  }

  const runtimeSource = await response.text();
  const script = document.createElement("script");
  script.async = true;
  script.dataset.plantumlRuntime = src;
  script.text = `${runtimeSource}\nwindow.plantuml = plantuml;`;

  await new Promise((resolve, reject) => {
    script.addEventListener(
      "load",
      () => {
        script.dataset.loaded = "true";
        resolve();
      },
      { once: true },
    );
    script.addEventListener("error", () => reject(new Error(`Failed to load ${src}`)), {
      once: true,
    });
    document.head.appendChild(script);
    script.dataset.loaded = "true";
    resolve();
  });
}

export async function initializePlantUml() {
  if (!initPromise) {
    initPromise = (async () => {
      await injectScript(CHEERPJ_LOADER);
      await injectPlantUmlRuntime(PLANTUML_LOADER);

      if (!window.plantuml) {
        throw new Error("PlantUML runtime did not register on window.");
      }

      await window.plantuml.initialize(PLANTUML_APP_BASE_PATH);
      return window.plantuml;
    })();
  }

  return initPromise;
}

export async function renderPlantUmlPng(source) {
  const plantuml = await initializePlantUml();
  return plantuml.renderPng(source);
}
