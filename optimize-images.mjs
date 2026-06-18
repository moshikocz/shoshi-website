import sharp from "sharp";
import path from "node:path";
import { stat, copyFile, unlink, mkdir } from "node:fs/promises";

// CSS class -> target width (2x retina of the real rendered size on this site).
// sharp's withoutEnlargement means it's always safe to over-specify.
// If an image is reused across multiple contexts (several site photos are: a small
// circle-img thumbnail on index.html + a detail-hero-img on its own service-*.html page
// + a blog-card-img on blog.html), pick the largest applicable class below, or pass
// --width directly. Don't try to auto-detect usage from HTML/CSS for a site this size.
const CLASS_WIDTHS = {
  "circle-img": 420, // 210px circle
  "circle-img-lg-wrap": 800, // 240px circle
  "detail-hero-img": 1520, // <=760px column, 380px max-height
  "blog-card-img": 900, // 100% width, 220px height
  "friend-card-photo": 760, // ~300-380px, 1:1 ratio
  "hero-bg": 1920, // full viewport background
};

const DEFAULT_QUALITY = 82;
const root = path.resolve(import.meta.dirname);

function parseArgs(argv) {
  const files = [];
  let width = null;
  let quality = DEFAULT_QUALITY;
  let keepOriginal = false;
  let cls = null;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--width") width = Number(argv[++i]);
    else if (arg === "--quality") quality = Number(argv[++i]);
    else if (arg === "--class") cls = argv[++i];
    else if (arg === "--keep-original") keepOriginal = true;
    else if (arg.startsWith("--")) throw new Error(`Unknown flag: ${arg}`);
    else files.push(arg);
  }

  if (files.length === 0) {
    throw new Error("No input files given.");
  }

  if (width === null) {
    if (cls === null) {
      throw new Error("Pass either --class <name> or --width <N>.");
    }
    if (!(cls in CLASS_WIDTHS)) {
      throw new Error(`Unknown --class "${cls}". Known classes: ${Object.keys(CLASS_WIDTHS).join(", ")}`);
    }
    width = CLASS_WIDTHS[cls];
  }

  return { files, width, quality, keepOriginal };
}

async function processFile(relPath, { width, quality, keepOriginal }) {
  const inPath = path.join(root, relPath);
  const before = (await stat(inPath)).size;

  const backupPath = path.join(root, "image_originals_backup", relPath);
  await mkdir(path.dirname(backupPath), { recursive: true });
  try {
    await stat(backupPath);
    console.log(`(backup already exists at image_originals_backup/${relPath}, skipping backup copy)`);
  } catch {
    await copyFile(inPath, backupPath);
  }

  const outPath = inPath.replace(/\.(png|jpe?g)$/i, ".webp");
  const outRelPath = relPath.replace(/\.(png|jpe?g)$/i, ".webp");

  await sharp(inPath)
    .resize({ width, withoutEnlargement: true })
    .webp({ quality })
    .toFile(outPath);

  const after = (await stat(outPath)).size;

  if (!keepOriginal) {
    await unlink(inPath);
  }

  console.log(
    `${relPath.padEnd(45)} ${(before / 1024).toFixed(0).padStart(6)}KB -> ${outRelPath.padEnd(45)} ${(after / 1024).toFixed(0).padStart(6)}KB`
  );
  console.log(`  -> update HTML references to ${outRelPath}, and add Hebrew alt text (see CLAUDE.md § Image Alt Text)`);
}

async function main() {
  const { files, width, quality, keepOriginal } = parseArgs(process.argv.slice(2));

  for (const file of files) {
    await stat(path.join(root, file)); // throws clearly if missing
  }

  for (const file of files) {
    await processFile(file, { width, quality, keepOriginal });
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  console.error("Usage: node optimize-images.mjs <file...> --class <name>|--width <N> [--quality <N>] [--keep-original]");
  console.error(`Known classes: ${Object.keys(CLASS_WIDTHS).join(", ")}`);
  process.exitCode = 1;
});
