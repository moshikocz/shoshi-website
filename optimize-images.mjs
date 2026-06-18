import sharp from "sharp";
import path from "node:path";
import { stat } from "node:fs/promises";

// input: source file (already backed up to image_originals_backup/)
// output: new .webp file written next to it
// width: target display width at 2x retina for the largest real usage on the site (sharp won't enlarge past the source)
// quality: webp quality
const jobs = [
  { input: "photos/circle_logo_shoshi.png", output: "photos/circle_logo_shoshi.webp", width: 480, quality: 82 },
  { input: "photos/healing_plants_service.png", output: "photos/healing_plants_service.webp", width: 900, quality: 80 },
  { input: "photos/sgirat_agan_service_main_page.png", output: "photos/sgirat_agan_service_main_page.webp", width: 900, quality: 80 },
  { input: "photos/steam_sauna_service.png", output: "photos/steam_sauna_service.webp", width: 900, quality: 80 },
  { input: "photos/tree.png", output: "photos/tree.webp", width: 1100, quality: 78 },
  { input: "photos/SHOSHI1.jpg", output: "photos/SHOSHI1.webp", width: 1400, quality: 78 },
  { input: "photos/shoshi_outdoor.jpg", output: "photos/shoshi_outdoor.webp", width: 840, quality: 82 },
  { input: "photos/Mirit_levona.jpeg", output: "photos/Mirit_levona.webp", width: 760, quality: 82 },
  { input: "photos/service_group.jpeg", output: "photos/service_group.webp", width: 1000, quality: 80 },
  { input: "photos/livui_rigshi_main_page_service.jpg", output: "photos/livui_rigshi_main_page_service.webp", width: 900, quality: 82 },
  { input: "brand_assets/WiseTree_logo.png", output: "brand_assets/WiseTree_logo.webp", width: 140, quality: 90 },
];

const root = path.resolve(import.meta.dirname);
let totalBefore = 0;
let totalAfter = 0;

for (const job of jobs) {
  const inPath = path.join(root, job.input);
  const outPath = path.join(root, job.output);

  const before = (await stat(inPath)).size;

  await sharp(inPath)
    .resize({ width: job.width, withoutEnlargement: true })
    .webp({ quality: job.quality })
    .toFile(outPath);

  const after = (await stat(outPath)).size;

  totalBefore += before;
  totalAfter += after;

  console.log(
    `${job.input.padEnd(45)} ${(before / 1024).toFixed(0).padStart(6)}KB -> ${job.output.padEnd(40)} ${(after / 1024).toFixed(0).padStart(6)}KB`
  );
}

console.log("---");
console.log(`Total: ${(totalBefore / 1024).toFixed(0)}KB -> ${(totalAfter / 1024).toFixed(0)}KB (${(100 - (totalAfter / totalBefore) * 100).toFixed(0)}% smaller)`);
