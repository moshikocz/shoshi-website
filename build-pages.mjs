// build-pages.mjs
//
// "Build-in-place" system for this static site. There is no bundler and no
// dist/ folder: the HTML files Netlify serves from the repo root ARE the
// build output. This script assembles them from:
//   - src/pages/<name>.html   (page-specific content + <!-- INCLUDE:X --> markers)
//   - partials/<name>.html    (shared head-meta / nav / footer / wa-float blocks)
//
// Edit src/pages/*.html and partials/*.html, then run:
//   node build-pages.mjs
// to regenerate the root-level page files. Do NOT hand-edit the root HTML
// files directly — they will be overwritten on the next build.
//
// Plain Node.js, no dependencies.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = __dirname;
const SRC_PAGES_DIR = path.join(ROOT, 'src', 'pages');
const PARTIALS_DIR = path.join(ROOT, 'partials');

function readPartial(name) {
  const filePath = path.join(PARTIALS_DIR, `${name.toLowerCase()}.html`);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Partial not found for marker INCLUDE:${name} -> expected file: ${filePath}`);
  }
  return fs.readFileSync(filePath, 'utf8');
}

function parsePageMeta(source) {
  const match = source.match(/<!--\s*PAGE_META\s*([\s\S]*?)-->/);
  if (!match) return { meta: {}, rest: source };

  const block = match[1];
  const meta = {};
  for (const line of block.split('\n')) {
    const lineMatch = line.match(/^\s*([A-Za-z]+)\s*:\s*(.*)$/);
    if (lineMatch) meta[lineMatch[1]] = lineMatch[2].trim();
  }

  // Strip the PAGE_META comment block (and one trailing newline) from the page source.
  const rest = source.slice(0, match.index) + source.slice(match.index + match[0].length).replace(/^\n/, '');
  return { meta, rest };
}

function renderHeadMeta(meta) {
  let template = readPartial('head-meta');
  return template
    .replaceAll('{{TITLE}}', meta.title || '')
    .replaceAll('{{DESCRIPTION}}', meta.description || '')
    .replaceAll('{{CANONICAL_URL}}', meta.canonical || '')
    .replaceAll('{{OG_IMAGE}}', meta.ogImage || '');
}

function assemblePage(filename) {
  const srcPath = path.join(SRC_PAGES_DIR, filename);
  const raw = fs.readFileSync(srcPath, 'utf8');
  const { meta, rest } = parsePageMeta(raw);

  let out = rest;

  // Replace every <!-- INCLUDE:X --> marker (and its leading indentation) with
  // its partial content, so the partial's own indentation is what ends up on disk.
  out = out.replace(/^[ \t]*<!--\s*INCLUDE:([A-Z0-9-]+)\s*-->/gm, (fullMatch, name) => {
    if (name === 'HEAD-META') return renderHeadMeta(meta).replace(/\n$/, '');
    return readPartial(name).replace(/\n$/, '');
  });

  return out;
}

function main() {
  if (!fs.existsSync(SRC_PAGES_DIR)) {
    console.error(`No src/pages directory found at ${SRC_PAGES_DIR}`);
    process.exit(1);
  }

  const files = fs.readdirSync(SRC_PAGES_DIR).filter((f) => f.endsWith('.html'));
  let count = 0;

  for (const filename of files) {
    const html = assemblePage(filename);
    const destPath = path.join(ROOT, filename);
    fs.writeFileSync(destPath, html, 'utf8');
    console.log(`Built ${filename}`);
    count++;
  }

  console.log(`\nDone. ${count} page(s) written to ${ROOT}`);
}

main();
