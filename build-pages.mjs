// build-pages.mjs
//
// "Build-in-place" system for this static site. There is no bundler and no
// dist/ folder: the HTML files Netlify serves from the repo root ARE the
// build output. This script assembles them from:
//   - src/pages/<name>.html   (page-specific content + <!-- INCLUDE:X --> markers)
//   - partials/<name>.html    (shared head-meta / nav / footer / wa-float blocks)
//   - content/pages/<name>.json  (CMS-editable text/size/font/color fields, optional)
//   - content/blog/*.md       (CMS-authored blog posts -> generates blog-<slug>.html)
//   - content/services/*.md   (CMS-authored services -> generates service-<slug>.html)
//
// Edit src/pages/*.html, partials/*.html, or content/**, then run:
//   node build-pages.mjs
// to regenerate the root-level page files. Do NOT hand-edit the root HTML
// files directly — they will be overwritten on the next build.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { marked } from 'marked';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = __dirname;
const SRC_PAGES_DIR = path.join(ROOT, 'src', 'pages');
const PARTIALS_DIR = path.join(ROOT, 'partials');
const CONTENT_DIR = path.join(ROOT, 'content');
const PAGES_CONTENT_DIR = path.join(CONTENT_DIR, 'pages');
const BLOG_CONTENT_DIR = path.join(CONTENT_DIR, 'blog');
const SERVICES_CONTENT_DIR = path.join(CONTENT_DIR, 'services');

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

// Takes a full page source (PAGE_META block + INCLUDE markers still present)
// and resolves both. Used both for src/pages/*.html files and for the
// rendered blog-post/service-page templates (after their own {{FIELD}}
// placeholders have already been filled in).
function assemblePageFromSource(raw) {
  const { meta, rest } = parsePageMeta(raw);
  let out = rest;
  out = out.replace(/^[ \t]*<!--\s*INCLUDE:([A-Z0-9-]+)\s*-->/gm, (fullMatch, name) => {
    if (name === 'HEAD-META') return renderHeadMeta(meta).replace(/\n$/, '');
    return readPartial(name).replace(/\n$/, '');
  });
  return out;
}

// ── content/pages/<name>.json -> {{FIELD}} substitution + <!-- COLLEAGUES:START/END --> loop ──

function loadPageContent(baseName) {
  const jsonPath = path.join(PAGES_CONTENT_DIR, `${baseName}.json`);
  if (!fs.existsSync(jsonPath)) return null;
  return JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
}

function applyPageContent(html, content) {
  if (!content) return html;
  let out = html;
  for (const [key, value] of Object.entries(content)) {
    if (key === 'colleagues') continue;
    out = out.replaceAll(`{{${key}}}`, value ?? '');
  }
  if (Array.isArray(content.colleagues)) {
    out = out.replace(/<!-- COLLEAGUES:START[^>]*-->([\s\S]*?)<!-- COLLEAGUES:END -->/, (match, cardTemplate) => {
      return content.colleagues
        .map((c) =>
          cardTemplate
            .replaceAll('{{NAME}}', c.name || '')
            .replaceAll('{{TAG}}', c.tag || '')
            .replaceAll('{{BIO}}', c.bio || '')
            .replaceAll('{{PHOTO}}', c.photo || '')
            .replaceAll('{{PHOTO_ALT}}', c.photoAlt || '')
            .replaceAll('{{LOCATION}}', c.location || '')
            .replaceAll('{{PHONE}}', c.phone || '')
            .replaceAll('{{PHONE_DISPLAY}}', c.phoneDisplay || '')
        )
        .join('\n');
    });
  }
  return out;
}

function assemblePage(filename) {
  const srcPath = path.join(SRC_PAGES_DIR, filename);
  const raw = fs.readFileSync(srcPath, 'utf8');
  let out = assemblePageFromSource(raw);
  const baseName = filename.replace(/\.html$/, '');
  out = applyPageContent(out, loadPageContent(baseName));
  return out;
}

// ── content/blog/*.md and content/services/*.md -> markdown collections ──

function loadCollection(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const raw = fs.readFileSync(path.join(dir, f), 'utf8');
      const { data, content } = matter(raw);
      return { slug: f.replace(/\.md$/, ''), ...data, bodyHtml: marked.parse(content) };
    });
}

function replaceMarker(html, name, replacement) {
  const re = new RegExp(`<!-- ${name}:START[^>]*-->[\\s\\S]*?<!-- ${name}:END -->`);
  return html.replace(re, replacement);
}

function renderBlogPostPage(post) {
  const template = readPartial('blog-post-template');
  return template
    .replaceAll('{{SLUG}}', post.slug)
    .replaceAll('{{META_TITLE}}', post.metaTitle || post.title || '')
    .replaceAll('{{META_DESCRIPTION}}', post.metaDescription || post.excerpt || '')
    .replaceAll('{{TITLE}}', post.title || '')
    .replaceAll('{{TAG}}', post.tag || '')
    .replaceAll('{{EXCERPT}}', post.excerpt || '')
    .replaceAll('{{IMAGE}}', post.image || '')
    .replaceAll('{{IMAGE_ALT}}', post.imageAlt || '')
    .replaceAll('{{BODY}}', post.bodyHtml || '');
}

function renderServicePage(svc) {
  const template = readPartial('service-page-template');
  return template
    .replaceAll('{{SLUG}}', svc.slug)
    .replaceAll('{{META_TITLE}}', svc.metaTitle || svc.name || '')
    .replaceAll('{{META_DESCRIPTION}}', svc.metaDescription || svc.shortDesc || '')
    .replaceAll('{{NAME}}', svc.name || '')
    .replaceAll('{{SHORT_DESC}}', svc.shortDesc || '')
    .replaceAll('{{PRICE}}', svc.price || '')
    .replaceAll('{{IMAGE}}', svc.image || '')
    .replaceAll('{{IMAGE_ALT}}', svc.imageAlt || '')
    .replaceAll('{{BODY}}', svc.bodyHtml || '');
}

function renderFeaturedBlogCard(post) {
  return `
  <div class="featured-card" style="align-items:center; padding:36px;">
    <div style="flex:0 0 200px; width:200px; height:200px; border-radius:12px; overflow:hidden; position:relative; box-shadow:0 4px 14px rgba(59,34,16,0.18);">
      <img src="photos/${post.image || ''}" alt="${post.imageAlt || ''}" loading="lazy" style="width:100%; height:100%; object-fit:cover; display:block;" />
    </div>
    <div style="flex:1; min-width:240px; padding:0 32px;">
      <span class="blog-tag">${post.tag || ''}</span>
      <h2 style="font-size:1.9rem; font-weight:600; color:var(--brown-dark); margin:0 0 14px; line-height:1.25;">${post.title || ''}</h2>
      <p style="font-size:0.97rem; color:var(--text-mid); line-height:1.85; font-family:'Assistant', sans-serif; margin-bottom:24px;">
        ${post.excerpt || ''}
      </p>
      <div style="display:flex; align-items:center; gap:16px;">
        <a href="blog-${post.slug}.html" aria-label="קראי עוד על ${post.title || ''}" style="color:var(--olive-dark); font-weight:700; text-decoration:underline; text-underline-offset:3px; font-size:0.9rem; font-family:'Assistant', sans-serif; display:inline-flex; align-items:center; gap:6px; transition:gap 0.2s;" onmouseover="this.style.gap='10px'" onmouseout="this.style.gap='6px'">← קראי עוד</a>
        <span style="color:var(--text-light); font-size:0.82rem; font-family:'Assistant', sans-serif;">שושי מיראז</span>
      </div>
    </div>
  </div>`;
}

function renderBlogGridCard(post) {
  return `
    <div class="blog-card" style="max-width:320px; width:100%;">
      <img src="photos/${post.image || ''}" alt="${post.imageAlt || ''}" class="blog-card-img" loading="lazy" />
      <div style="padding:24px 22px 28px;">
        <span class="blog-tag">${post.tag || ''}</span>
        <h3 style="font-size:1.25rem; font-weight:600; color:var(--brown-dark); margin:0 0 10px; line-height:1.3;">${post.title || ''}</h3>
        <p style="font-size:0.88rem; color:var(--text-mid); line-height:1.8; font-family:'Assistant', sans-serif; margin-bottom:18px;">
          ${post.excerpt || ''}
        </p>
        <a href="blog-${post.slug}.html" aria-label="קראי עוד על ${post.title || ''}" style="color:var(--olive-dark); font-weight:700; text-decoration:underline; text-underline-offset:3px; font-size:0.85rem; font-family:'Assistant', sans-serif;">← קראי עוד</a>
      </div>
    </div>`;
}

function renderServiceCard(svc) {
  return `
      <a href="service-${svc.slug}.html" class="svc-card">
        <img src="photos/${svc.image || ''}" alt="${svc.imageAlt || ''}" class="circle-img" loading="lazy" />
        <h3 style="font-size:calc(1.15rem * var(--fs-mult-h)); font-weight:600; color:var(--brown-dark); margin:0 0 8px;">${svc.name || ''}</h3>
        <p style="font-size:calc(0.88rem * var(--fs-mult)); color:var(--text-light); line-height:1.62; margin:0; font-family:'Assistant', sans-serif;">${svc.shortDesc || ''}</p>
      </a>`;
}

function main() {
  if (!fs.existsSync(SRC_PAGES_DIR)) {
    console.error(`No src/pages directory found at ${SRC_PAGES_DIR}`);
    process.exit(1);
  }

  const blogPosts = loadCollection(BLOG_CONTENT_DIR).sort(
    (a, b) => new Date(b.date || 0) - new Date(a.date || 0)
  );
  const services = loadCollection(SERVICES_CONTENT_DIR);

  // chocolate-landing.html and course-isha-magalit.html are standalone campaign
  // pages (per CLAUDE.md's design-system convention) — hand-edited directly at
  // the repo root, NOT generated from src/pages/. Their src/pages/ copies exist
  // only historically and go stale the moment someone edits the root file
  // directly; regenerating from them would silently revert real production
  // fixes (this bit a build run during this session — see git history around
  // 2026-09-23 for the incident). Always skip them here.
  const STANDALONE_PAGES = new Set(['chocolate-landing.html', 'course-isha-magalit.html']);
  const files = fs
    .readdirSync(SRC_PAGES_DIR)
    .filter((f) => f.endsWith('.html') && !STANDALONE_PAGES.has(f));
  let count = 0;

  for (const filename of files) {
    let html = assemblePage(filename);

    if (filename === 'index.html') {
      html = replaceMarker(html, 'SERVICES-LIST', services.map(renderServiceCard).join('\n'));
    }
    if (filename === 'blog.html') {
      const featured = blogPosts.length > 0 ? renderFeaturedBlogCard(blogPosts[0]) : '';
      const grid = blogPosts.slice(1).map(renderBlogGridCard).join('\n');
      html = replaceMarker(html, 'BLOG-FEATURED', featured);
      html = replaceMarker(html, 'BLOG-GRID', grid);
    }

    fs.writeFileSync(path.join(ROOT, filename), html, 'utf8');
    console.log(`Built ${filename}`);
    count++;
  }

  for (const post of blogPosts) {
    const html = assemblePageFromSource(renderBlogPostPage(post));
    const outFilename = `blog-${post.slug}.html`;
    fs.writeFileSync(path.join(ROOT, outFilename), html, 'utf8');
    console.log(`Built ${outFilename} (from content/blog/${post.slug}.md)`);
    count++;
  }

  for (const svc of services) {
    const html = assemblePageFromSource(renderServicePage(svc));
    const outFilename = `service-${svc.slug}.html`;
    fs.writeFileSync(path.join(ROOT, outFilename), html, 'utf8');
    console.log(`Built ${outFilename} (from content/services/${svc.slug}.md)`);
    count++;
  }

  console.log(`\nDone. ${count} page(s) written to ${ROOT}`);
}

main();
