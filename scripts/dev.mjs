import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

console.log("🚀 Starting development environment...");

console.log("📦 Performing initial build...");
spawnSync("node", ["./scripts/build.mjs"], { stdio: "inherit" });

console.log("👀 Starting TypeScript watcher...");
const tsc = spawn("npx", ["tsc", "-w", "--incremental"], { stdio: "inherit", shell: true });

console.log("🌐 Starting local server at http://localhost:8080...");
const server = spawn("npx", ["--yes", "http-server", "dist"], { stdio: "inherit", shell: true });

// Simple Asset Watcher Logic
const watchFolders = ["assets", "styles"];
const watchFiles = ["index.html"];

const copyAsset = (item) => {
  const src = item;
  const dest = path.join("dist", item);
  try {
    if (fs.existsSync(src)) {
      fs.cpSync(src, dest, { recursive: true });
      console.log(`✨ Synced: ${item}`);
    }
  } catch (err) {
    console.error(`❌ Sync failed for ${item}:`, err);
  }
};

watchFolders.forEach(folder => {
  if (fs.existsSync(folder)) {
    fs.watch(folder, { recursive: true }, (event, filename) => {
      if (filename && !filename.startsWith(".")) {
        copyAsset(folder);
      }
    });
  }
});

watchFiles.forEach(file => {
  if (fs.existsSync(file)) {
    fs.watch(file, (event) => {
      copyAsset(file);
    });
  }
});

console.log("✅ Watchers are running. Happy coding!");

process.on("SIGINT", () => {
  console.log("\n👋 Shutting down development environment...");
  tsc.kill();
  server.kill();
  process.exit();
});
