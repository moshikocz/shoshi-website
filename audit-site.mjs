// audit-site.mjs
//
// One-shot SEO/accessibility health check for this static site. Encodes the
// numeric rules already documented in CLAUDE.md (title/description length,
// og:image minimum size, alt text coverage) as a repeatable command instead
// of re-deriving them ad hoc every time someone asks "is this still fine?".
//
// Read-only: never modifies any file. Run with:
//   node audit-site.mjs
//
// Requires sharp (already a devDependency, used by optimize-images.mjs).

import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, '$1');
const SRC_PAGES_DIR = path.join(ROOT, 'src', 'pages');

const TITLE_MAX = 60;
const DESC_MAX = 160;
const OG_MIN_WIDTH = 1200;
const OG_MIN_HEIGHT = 630;

let issues = 0;

function section(title) {
  console.log(`\n=== ${title} ===`);
}

function parsePageMeta(source) {
  const match = source.match(/<!--\s*PAGE_META\s*([\s\S]*?)-->/);
  if (!match) return {};
  const meta = {};
  for (const line of match[1].split('\n')) {
    const lineMatch = line.match(/^\s*([A-Za-z]+)\s*:\s*(.*)$/);
    if (lineMatch) meta[lineMatch[1]] = lineMatch[2].trim();
  }
  return meta;
}

function auditTitlesAndDescriptions() {
  section('Title / description length');
  const files = fs.readdirSync(SRC_PAGES_DIR).filter((f) => f.endsWith('.html'));
  for (const file of files) {
    const meta = parsePageMeta(fs.readFileSync(path.join(SRC_PAGES_DIR, file), 'utf8'));
    const title = meta.title || '';
    const description = meta.description || '';
    if (!title) {
      console.log(`  ⚠ ${file}: missing title`);
      issues++;
    } else if (title.length > TITLE_MAX) {
      console.log(`  ⚠ ${file}: title too long (${title.length} > ${TITLE_MAX}): "${title}"`);
      issues++;
    }
    if (!description) {
      console.log(`  ⚠ ${file}: missing description`);
      issues++;
    } else if (description.length > DESC_MAX) {
      console.log(`  ⚠ ${file}: description too long (${description.length} > ${DESC_MAX}): "${description}"`);
      issues++;
    }
  }
  console.log(`  Checked ${files.length} page(s).`);
}

async function auditOgImages() {
  section('og:image dimensions (>=1200x630 recommended)');
  const files = fs.readdirSync(SRC_PAGES_DIR).filter((f) => f.endsWith('.html'));
  const seen = new Map(); // localPath -> [pages]
  for (const file of files) {
    const meta = parsePageMeta(fs.readFileSync(path.join(SRC_PAGES_DIR, file), 'utf8'));
    if (!meta.ogImage) {
      console.log(`  ⚠ ${file}: missing ogImage`);
      issues++;
      continue;
    }
    const localPath = decodeURIComponent(meta.ogImage.replace(/^https?:\/\/[^/]+\//, ''));
    if (!seen.has(localPath)) seen.set(localPath, []);
    seen.get(localPath).push(file);
  }

  for (const [localPath, pages] of seen) {
    const fullPath = path.join(ROOT, localPath);
    if (!fs.existsSync(fullPath)) {
      console.log(`  ⚠ ${localPath}: file not found (used by ${pages.join(', ')})`);
      issues++;
      continue;
    }
    try {
      const { width, height } = await sharp(fullPath).metadata();
      const ok = width >= OG_MIN_WIDTH && height >= OG_MIN_HEIGHT;
      if (!ok) {
        console.log(`  ⚠ ${localPath}: ${width}x${height} — below ${OG_MIN_WIDTH}x${OG_MIN_HEIGHT} (used by ${pages.join(', ')})`);
        issues++;
      }
    } catch (e) {
      console.log(`  ⚠ ${localPath}: could not read image metadata (${e.message})`);
      issues++;
    }
  }
  console.log(`  Checked ${seen.size} unique og:image file(s) across ${files.length} page(s).`);
}

function auditAltText() {
  section('<img> alt text coverage');
  const files = fs.readdirSync(ROOT).filter((f) => f.endsWith('.html'));
  let checked = 0;
  for (const file of files) {
    const content = fs.readFileSync(path.join(ROOT, file), 'utf8');
    const imgTags = content.match(/<img[^>]*>/g) || [];
    for (const tag of imgTags) {
      checked++;
      const altMatch = tag.match(/alt="([^"]*)"/);
      const alt = altMatch ? altMatch[1] : null;
      const isDecorative = /role="presentation"|aria-hidden="true"/.test(tag);
      if (alt === null) {
        console.log(`  ⚠ ${file}: <img> with no alt attribute at all: ${tag.slice(0, 90)}...`);
        issues++;
      } else if (alt.trim() === '' && !isDecorative) {
        console.log(`  ⚠ ${file}: empty alt without role="presentation"/aria-hidden: ${tag.slice(0, 90)}...`);
        issues++;
      }
    }
  }
  console.log(`  Checked ${checked} <img> tag(s) across ${files.length} root HTML file(s).`);
}

async function main() {
  auditTitlesAndDescriptions();
  await auditOgImages();
  auditAltText();

  console.log(`\n${issues === 0 ? '✅ No issues found.' : `⚠ ${issues} issue(s) found — see above.`}`);
  process.exit(issues === 0 ? 0 : 1);
}

main();
