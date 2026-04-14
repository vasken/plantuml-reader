import { cp, mkdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(currentDir, "..");
const sourceDir = path.join(rootDir, "node_modules", "@sakirtemel", "plantuml.js");
const targetDir = path.join(rootDir, "public", "vendor", "plantuml");

async function main() {
  try {
    await stat(sourceDir);
  } catch {
    console.warn("Skipping PlantUML asset sync because @sakirtemel/plantuml.js is not installed yet.");
    return;
  }

  await mkdir(path.dirname(targetDir), { recursive: true });
  await cp(sourceDir, targetDir, {
    recursive: true,
    force: true,
  });

  console.log(`Copied PlantUML browser assets to ${targetDir}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
