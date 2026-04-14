# PlantUML Sequence Studio

PlantUML Sequence Studio is a Vite + React app that renders PlantUML diagrams entirely in the browser. It uses the browser runtime approach behind `plantuml.js`, so there is no PlantUML server in the loop.

## Stack

- React 18 + Vite
- Tailwind CSS
- Local shadcn-style UI components
- `@sakirtemel/plantuml.js` runtime assets copied into `public/vendor/plantuml`

## Getting Started

```bash
npm install
npm run dev
```

Open the local Vite URL shown in the terminal, usually `http://localhost:5173`.

## Available Scripts

- `npm run dev` starts the development server
- `npm run build` creates a production build in `dist/`
- `npm run preview` serves the production build locally
- `npm run sync:plantuml` copies PlantUML runtime assets into `public/vendor/plantuml`

## How It Works

On install, the `postinstall` script copies the PlantUML browser runtime into `public/vendor/plantuml`. At runtime the app loads:

- CheerpJ from `https://cjrtnc.leaningtech.com/2.3/loader.js`
- PlantUML browser assets from `/vendor/plantuml`

The editor updates the preview by rendering PNG output locally in the browser.

## Notes

- Rendering is client-side only.
- The bundled UI is tuned for sequence-diagram editing, but the renderer can accept other PlantUML source supported by the runtime.
