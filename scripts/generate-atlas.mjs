import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

// 1. Configuration
const INPUT_DIRS = [
  "assets/ui/icons/system",
  "assets/ui/icons/actions",
  "assets/ui/icons/nodes",
  "assets/ui/icons/status",
  "assets/ui/icons/mechanics",
  "assets/ui/icons/intents"
];
const OUTPUT_DIR = "assets/atlas";
const ATLAS_NAME = "ui-icons";
const ICON_SIZE = 64; // We'll pad smaller icons to this size for simplicity in this script

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// 2. Collect files
const files = [];
INPUT_DIRS.forEach(dir => {
  if (fs.existsSync(dir)) {
    fs.readdirSync(dir).filter(f => f.endsWith(".png")).forEach(f => {
      files.push({
        name: f.replace(/\.png$/, "").replace(/-v\d+$/, ""), // Clean name for frame keys
        path: path.join(dir, f)
      });
    });
  }
});

console.log(`🔍 Found ${files.length} icons to pack.`);

// 3. Simple packing logic (Grid)
const cols = Math.ceil(Math.sqrt(files.length));
const rows = Math.ceil(files.length / cols);
const atlasWidth = cols * ICON_SIZE;
const atlasHeight = rows * ICON_SIZE;

const atlasJson = {
  frames: {},
  meta: {
    app: "Ranworld Atlas Generator",
    version: "1.0",
    image: `${ATLAS_NAME}.png`,
    format: "RGBA8888",
    size: { w: atlasWidth, h: atlasHeight },
    scale: "1"
  }
};

// 4. Generate Jimp Script
const jimpFilesJson = JSON.stringify(files);
const jimpScript = `
const { Jimp } = require('jimp');
async function run() {
  const files = ${jimpFilesJson};
  const atlas = new Jimp({ width: ${atlasWidth}, height: ${atlasHeight}, color: 0x00000000 });
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    try {
      const img = await Jimp.read(file.path);
      const col = i % ${cols};
      const row = Math.floor(i / ${cols});
      const x = col * ${ICON_SIZE};
      const y = row * ${ICON_SIZE};
      
      // Center icon if smaller than grid cell
      const offsetX = Math.floor((${ICON_SIZE} - img.bitmap.width) / 2);
      const offsetY = Math.floor((${ICON_SIZE} - img.bitmap.height) / 2);
      
      atlas.composite(img, x + offsetX, y + offsetY);
    } catch (err) {
      console.error('Error processing ' + file.path + ':', err);
    }
  }
  
  await atlas.write('${path.join(OUTPUT_DIR, ATLAS_NAME + ".png")}');
  console.log('✅ Atlas image generated.');
}
run().catch(console.error);
`;

fs.writeFileSync("scripts/tmp-jimp.js", jimpScript);

// 5. Run Jimp via local node
console.log("🎨 Stitching textures with Jimp...");
try {
  execSync(`node scripts/tmp-jimp.js`, { stdio: "inherit" });
} catch (err) {
  console.error("❌ Jimp failed. This might be due to the Node version incompatibility (v16 vs v18).", err);
  process.exit(1);
} finally {
  if (fs.existsSync("scripts/tmp-jimp.js")) fs.unlinkSync("scripts/tmp-jimp.js");
}

// 6. Finalize JSON
files.forEach((file, i) => {
  const col = i % cols;
  const row = Math.floor(i / cols);
  atlasJson.frames[file.name] = {
    frame: { x: col * ICON_SIZE, y: row * ICON_SIZE, w: ICON_SIZE, h: ICON_SIZE },
    rotated: false,
    trimmed: false,
    spriteSourceSize: { x: 0, y: 0, w: ICON_SIZE, h: ICON_SIZE },
    sourceSize: { w: ICON_SIZE, h: ICON_SIZE }
  };
});

fs.writeFileSync(path.join(OUTPUT_DIR, ATLAS_NAME + ".json"), JSON.stringify(atlasJson, null, 2));
console.log(`📄 Atlas data generated: ${path.join(OUTPUT_DIR, ATLAS_NAME + ".json")}`);
console.log("🚀 Atlas migration ready!");
