const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const dist = path.join(root, "dist");

const skip = new Set([
    "node_modules",
    "dist",
    "src",
    "scripts",
    "package.json",
    "package-lock.json",
    "tailwind.config.js",
    "vercel.json",
    "repomix-output.xml"
]);

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });

for (const name of fs.readdirSync(root)) {
    if (skip.has(name)) continue;
    if (name.startsWith(".") && name !== ".well-known") continue;
    if (name.endsWith(".md")) continue;
    fs.cpSync(path.join(root, name), path.join(dist, name), { recursive: true });
}

fs.rmSync(path.join(dist, "css", "tailwind.css"), { force: true });