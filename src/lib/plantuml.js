const CHEERPJ_LOADER = "https://cjrtnc.leaningtech.com/2.3/loader.js";
const PLANTUML_LOADER = "/vendor/plantuml/plantuml.js";
const PLANTUML_BASE_PATH = "/vendor/plantuml";

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

export async function initializePlantUml() {
  if (!initPromise) {
    initPromise = (async () => {
      await injectScript(CHEERPJ_LOADER);
      await injectScript(PLANTUML_LOADER);

      if (!window.plantuml) {
        throw new Error("PlantUML runtime did not register on window.");
      }

      await window.plantuml.initialize(PLANTUML_BASE_PATH);
      return window.plantuml;
    })();
  }

  return initPromise;
}

export async function renderPlantUmlPng(source) {
  const plantuml = await initializePlantUml();
  return plantuml.renderPng(source);
}
