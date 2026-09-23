# CLAUDE.md — Frontend Website Rules

## Always Do First
- **Invoke the `frontend-design` skill** before writing any frontend code, every session, no exceptions.
- **Building a new landing page** (a new course page, or any standalone topic/campaign page, e.g. "FADE IN")? Check `design-system/README.md` first and reuse its tokens/components/AOS scripts instead of designing from scratch. Only the `--accent`/`--accent-deep` color pair should change per topic — see that folder for the full system extracted from `course-isha-magalit.html`.
- **Building any new page or component** (landing page or main-site page)? Read `design-system/PRINCIPLES.md` first for the overall design language (color tokens for both page families, typography, spacing/shadow scale, component classes, animation rules) before designing from scratch.
- **Before closing out any task that touches SEO/structured-data, accessibility, performance, or the build/deploy pipeline** — check `WEBSITE_QUALITY_CHECKLIST.md` (project root). It's a portable, project-agnostic checklist distilled from real bugs found in this codebase (llms.txt format, aria-hidden+focusable traps, contrast math, touch-target sizing, publish="." exposure risk, Lighthouse lab-data noise, etc.) — not something you can derive from reading the code alone.

## Reference Images
- If a reference image is provided: match layout, spacing, typography, and color exactly. Swap in placeholder content (images via `https://placehold.co/`, generic copy). Do not improve or add to the design.
- If no reference image: design from scratch with high craft (see guardrails below).
- Screenshot your output, compare against reference, fix mismatches, re-screenshot. Do at least 2 comparison rounds. Stop only when no visible differences remain or user says so.

## Local Server
- **Always serve on localhost** — never screenshot a `file:///` URL.
- Start the dev server: `node serve.mjs` (serves the project root at `http://localhost:3000`)
- `serve.mjs` lives in the project root. Start it in the background before taking any screenshots.
- If the server is already running, do not start a second instance.

## Screenshot Workflow
- Puppeteer is installed at `C:/Users/nateh/AppData/Local/Temp/puppeteer-test/`. Chrome cache is at `C:/Users/nateh/.cache/puppeteer/`.
- **Always screenshot from localhost:** `node screenshot.mjs http://localhost:3000`
- Screenshots are saved automatically to `./temporary screenshots/screenshot-N.png` (auto-incremented, never overwritten).
- Optional label suffix: `node screenshot.mjs http://localhost:3000 label` → saves as `screenshot-N-label.png`
- `screenshot.mjs` lives in the project root. Use it as-is.
- After screenshotting, read the PNG from `temporary screenshots/` with the Read tool — Claude can see and analyze the image directly.
- When comparing, be specific: "heading is 32px but reference shows ~24px", "card gap is 16px but should be 24px"
- Check: spacing/padding, font size/weight/line-height, colors (exact hex), alignment, border-radius, shadows, image sizing

## Output Defaults
- Single `index.html` file, all styles inline, unless user says otherwise
- Tailwind CSS via CDN: `<script src="https://cdn.tailwindcss.com"></script>`
- Placeholder images: `https://placehold.co/WIDTHxHEIGHT`
- Mobile-first responsive

## Brand Assets
- Always check the `brand_assets/` folder before designing. It may contain logos, color guides, style guides, or images.
- If assets exist there, use them. Do not use placeholders where real assets are available.
- If a logo is present, use it. If a color palette is defined, use those exact values — do not invent brand colors.

## Site-Wide Components
- **Floating WhatsApp button (`.wa-float`)** is required on **every page** of the site — main site and landing pages alike. If a page is missing it, that's a bug, not an intentional omission.
- Contract: fixed bottom-right, `id="float-whatsapp-link"`, links to `https://wa.me/972528753214` (desktop swaps to `https://web.whatsapp.com/send?phone=972528753214` via the existing isMobile-check script pattern). Fades in after **~40px of scroll** — never tie visibility to a specific element's position (e.g. a hero CTA's bottom edge); that produced a multi-second-feeling delay bug once already.
- Canonical source for landing pages: `design-system/components.css` (`.wa-float` CSS) + `design-system/testimonial-carousel.js` (scroll show/hide script) — `design-system/landing-page-template.html` already wires both in.
- Main-site pages have no shared include, so copy the CSS/markup/script block verbatim from any existing page (e.g. `service-halitot.html`) when scaffolding a new one — see the `new-page-scaffold` skill. New `service-*.html` and `blog-*.html` pages can also now be created through the Decap CMS collections instead (see "Self-service editing via Decap CMS" below) — use that path when the new page fits the collection's field schema, and manual scaffolding only for anything that doesn't.

## Build-in-Place System (main-site pages)
- The 12 non-landing-page main-site HTML files hand-authored in `src/pages/` (`index.html`, `about.html`, `accessibility.html`, `blog.html`, `friends.html`, `privacy.html`, `terms.html`, `service-*.html` ×5) are **generated output** at the repo root, not hand-edited source. `chocolate-landing.html` and `course-isha-magalit.html` stay fully standalone (per the design-system landing-page convention) and are excluded by name from the build loop in `build-pages.mjs` — do not remove that exclusion; a past session run reverted real hand-edits on `course-isha-magalit.html` before it was added. `blog-sgirat-agan.html` is no longer in `src/pages/` either — it's now generated from `content/blog/sgirat-agan.md` (see the CMS section below).
- **Do NOT hand-edit the root-level page HTML files directly anymore** — they get overwritten the next time the build runs. Edit the source instead:
  - `src/pages/<name>.html` — page-specific content (hero, unique sections), plus a `<!-- PAGE_META -->` comment block at the top (title/description/canonical/ogImage) and `<!-- INCLUDE:X -->` markers where the shared head-meta/wa-float/nav/footer blocks go.
  - `partials/*.html` — the shared blocks: `head-meta.html` (title/description/canonical/OG tags, templated with `{{TITLE}}`/`{{DESCRIPTION}}`/`{{CANONICAL_URL}}`/`{{OG_IMAGE}}`), `wa-float.html`, three nav/footer variants each (`nav-home`/`footer-home` for index.html's tiered nav, `nav-full`/`footer-full` for the other subpages, `nav-legal`/`footer-legal` for accessibility/privacy/terms, plus `footer-full-about.html` for about.html's one differing self-link), plus `blog-post-template.html` and `service-page-template.html` (see below).
  - After editing either, run `node build-pages.mjs` to regenerate the root HTML files before testing or committing.
- No bundler, no `dist/` folder — the root HTML files Netlify serves ARE the build output; this is a "build-in-place" step. `netlify.toml` now runs it automatically on every Netlify deploy (`node optimize-images.mjs --auto photos && node build-pages.mjs`), but still run it manually before testing locally.
- Why 3 nav/footer variants instead of 1: the site already had real, pre-existing per-page differences (index.html's newer tiered/scroll-hide nav vs. the older simple sticky nav on every other page; accessibility/privacy/terms omitting the testimonials/contact links since those pages have no such section to link to). These were verified by diffing, not assumed — see the file list above for which page uses which variant.

### Self-service editing via Decap CMS (`/admin`)
- Shoshi edits some content herself through `/admin` (Decap CMS, config in `admin/config.yml`), authenticated via GitHub OAuth (`netlify/functions/auth.js` + `callback.js`) — never Netlify Identity, and she never needs to see GitHub directly. Her saves are real git commits to `main`; **run `git fetch` then check `git status`/`git log origin/main` at the start of a session** (not just local `git log`) to catch her edits before making local changes — `git status`/local `git log` alone can miss commits she or another session pushed remotely since the last fetch (see the CMS memory notes for this project).
- `content/pages/<name>.json` holds CMS-editable fields for specific pages (hero text + size/font/color presets), substituted into `{{PLACEHOLDER}}` markers in the matching `src/pages/<name>.html` by `build-pages.mjs`. Only `index.html` (hero) and `friends.html` (colleagues list, via a `<!-- COLLEAGUES:START/END -->` loop) are wired this way so far — extend other pages by following the same pattern (wrap the field in a placeholder, add it to that page's JSON file and to `admin/config.yml`'s `pages` collection).
- `content/blog/*.md` and `content/services/*.md` are real Decap folder collections (markdown + frontmatter, parsed with `gray-matter`/`marked`). `build-pages.mjs` generates `blog-<slug>.html` / `service-<slug>.html` from `partials/blog-post-template.html` / `partials/service-page-template.html`, and injects listing cards into `blog.html` (`<!-- BLOG-FEATURED/BLOG-GRID:START/END -->`) and `index.html`'s services section (`<!-- SERVICES-LIST:START/END -->`). Adding a new page here (a blog post or a service) needs no code change — new `service-*.html`/`blog-*.html` pages are now (also) creatable this way, alongside the manual `new-page-scaffold` skill process for anything that doesn't fit the collection's field schema.
- `content/requests/*.md` (her feature requests / bug reports) is CMS-only — never read by `build-pages.mjs`, never rendered on any public page. Keep it that way; see `BACKLOG.md`'s note on a past incident where an internal backlog view leaked onto the public site.
- `optimize-images.mjs --auto photos` (run automatically by `netlify.toml`) catches anything she uploads through the CMS media picker that isn't `.webp` yet, so the "never reference a raw image" rule still holds even though she can't run the script herself.

## Site Audit Script
- `node audit-site.mjs` — read-only check of title/description length, og:image dimensions (≥1200×630), and `<img>` alt text coverage across all pages, per the numeric rules in this file. Run it before closing out a BACKLOG.md item that touches SEO tags or images, instead of re-deriving these checks by hand.
- When editing a numeric/structural rule in this file (page counts, size thresholds, variant counts), verify it's still true against the actual repo state at the same time, and check BACKLOG.md doesn't still contain contradicting/stale wording about the same item.

## Anti-Generic Guardrails
- **Colors:** Never use default Tailwind palette (indigo-500, blue-600, etc.). Pick a custom brand color and derive from it.
- **Shadows:** Never use flat `shadow-md`. Use layered, color-tinted shadows with low opacity.
- **Typography:** Never use the same font for headings and body. Pair a display/serif with a clean sans. Apply tight tracking (`-0.03em`) on large headings, generous line-height (`1.7`) on body.
- **Gradients:** Layer multiple radial gradients. Add grain/texture via SVG noise filter for depth.
- **Animations:** Only animate `transform` and `opacity`. Never `transition-all`. Use spring-style easing.
- **Interactive states:** Every clickable element needs hover, focus-visible, and active states. No exceptions.
- **Images:** Add a gradient overlay (`bg-gradient-to-t from-black/60`) and a color treatment layer with `mix-blend-multiply`.
- **Spacing:** Use intentional, consistent spacing tokens — not random Tailwind steps.
- **Adjacent same-background sections:** When two `<section>`s sit back-to-back with the *same* background value (e.g. both `var(--cream-bg)`), their touching paddings stack with no visual break to justify the gap. Tighten the touching sides (e.g. `90px 24px` → `90px 24px 40px` on the first, `40px 24px 90px` on the second) so the combined gap lands around 70–90px instead of 150px+. Leave the outer (non-touching) padding alone — it's touching a different background and needs the full breathing room. Only applies when the background literally matches; alternating backgrounds (e.g. `--cream-bg` → `--cream-card`) already read as a break and don't need this.
- **Depth:** Surfaces should have a layering system (base → elevated → floating), not all sit at the same z-plane.

## Image Alt Text
- **Every time a new image is added** to `photos/` or `brand_assets/`, immediately add a descriptive Hebrew `alt` attribute to every `<img>` tag referencing that file across all HTML files.
- The alt text must describe what is **visually seen** in the image (people, objects, scene, mood) — not just the service/section name.
- Format: short phrase in Hebrew, e.g. `"נשים יושבות במעגל סביב מדורה בטבע"`, `"כיסא עץ לסאונת אדים לאגן עם צמחי מרפא"`.
- Apply to all pages: `index.html`, `about.html`, the dedicated `service-*.html` pages, `blog.html`, `friends.html`.

## Image Optimization
- **Every time a new image is added** to `photos/` or `brand_assets/`, optimize it before referencing it in any HTML — never reference a raw `.png`/`.jpg`/`.jpeg` in HTML, only the resulting `.webp`.
- Workflow:
  1. Determine the image's display context(s) via the table below. If it's reused in multiple places (e.g. thumbnail on `index.html` + hero on its own `service-*.html` page + card on `blog.html`), use the **largest** applicable width.
  2. Run `node optimize-images.mjs <path> --class <name>` (or `--width N` for a custom size).
  3. The script auto-backs-up the original to `image_originals_backup/` and deletes it from `photos/`/`brand_assets/` on success. Pass `--keep-original` to skip the delete.
  4. Update every `<img src="...">` / CSS `url(...)` reference across all HTML files to the new `.webp` path.
  5. Still apply the **Image Alt Text** rule above to the new `<img>` tags.
- CSS class → target width lookup table (2x retina; the script never upscales past the source):

  | Class | Rendered size | Target width |
  |---|---|---|
  | `circle-img` | 210px circle | 420 |
  | `circle-img-lg-wrap` | 240px circle | 800 |
  | `detail-hero-img` | ≤760px column, 380px max-height | 1520 |
  | `blog-card-img` | 100% width, 220px height | 900 |
  | `friend-card-photo` | ~300-380px, 1:1 ratio | 760 |
  | `hero-bg` | full viewport background | 1920 |

- **Cache-busting caveat:** `_headers` sets a 1-year immutable cache on `/photos/*` and `/brand_assets/*`. If you replace an existing image under the same filename, returning visitors will keep seeing the old cached file for up to a year — always give a replacement a **new filename**.

## Hard Rules
- Do not add sections, features, or content not in the reference
- Do not "improve" a reference design — match it
- Do not stop after one screenshot pass
- Do not use `transition-all`
- Do not use default Tailwind blue/indigo as primary color
- when installing libraries always use virtual environment
