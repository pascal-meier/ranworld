import fs from "node:fs";
import { execSync } from "node:child_process";

fs.rmSync("dist", { recursive: true, force: true });
fs.mkdirSync("dist", { recursive: true });

execSync("node ./node_modules/typescript/bin/tsc", { stdio: "inherit" });

fs.cpSync("index.html", "dist/index.html");
fs.cpSync("styles", "dist/styles", { recursive: true });

if (fs.existsSync("assets")) {
  fs.cpSync("assets", "dist/assets", { recursive: true });
}
