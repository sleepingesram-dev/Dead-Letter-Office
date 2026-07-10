const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const requiredFiles = [
  "index.html",
  "forge.config.cjs",
  "electron/main.cjs",
  "electron/preload.cjs",
  "js/desktop.js",
  "css/desktop.css"
];

for (const relativePath of requiredFiles) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Missing desktop file: ${relativePath}`);
  }
}

const packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
if (packageJson.main !== "electron/main.cjs") {
  throw new Error("package.json main entry must point to electron/main.cjs");
}

for (const script of ["start", "package", "make", "make:linux", "make:windows"]) {
  if (!packageJson.scripts || !packageJson.scripts[script]) {
    throw new Error(`Missing npm script: ${script}`);
  }
}

const indexHtml = fs.readFileSync(path.join(root, "index.html"), "utf8");
for (const asset of ["css/desktop.css", "js/desktop.js"]) {
  if (!indexHtml.includes(asset)) {
    throw new Error(`index.html does not load ${asset}`);
  }
}

const forgeConfig = require(path.join(root, "forge.config.cjs"));
if (!Array.isArray(forgeConfig.makers) || forgeConfig.makers.length < 2) {
  throw new Error("Forge configuration must include desktop makers");
}

console.log("Desktop configuration validated.");
