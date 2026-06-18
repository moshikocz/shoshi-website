# CLAUDE.md — Frontend Website Rules

## Always Do First
- **Invoke the `frontend-design` skill** before writing any frontend code, every session, no exceptions.

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

## Anti-Generic Guardrails
- **Colors:** Never use default Tailwind palette (indigo-500, blue-600, etc.). Pick a custom brand color and derive from it.
- **Shadows:** Never use flat `shadow-md`. Use layered, color-tinted shadows with low opacity.
- **Typography:** Never use the same font for headings and body. Pair a display/serif with a clean sans. Apply tight tracking (`-0.03em`) on large headings, generous line-height (`1.7`) on body.
- **Gradients:** Layer multiple radial gradients. Add grain/texture via SVG noise filter for depth.
- **Animations:** Only animate `transform` and `opacity`. Never `transition-all`. Use spring-style easing.
- **Interactive states:** Every clickable element needs hover, focus-visible, and active states. No exceptions.
- **Images:** Add a gradient overlay (`bg-gradient-to-t from-black/60`) and a color treatment layer with `mix-blend-multiply`.
- **Spacing:** Use intentional, consistent spacing tokens — not random Tailwind steps.
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
