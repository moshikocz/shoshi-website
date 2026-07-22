# Landing Page Design System

Reusable design language + scripts extracted from `course-isha-magalit.html`
(קורס אשה מעגלית). Use this whenever building a new landing page — another
course, or a different topic entirely (e.g. a "FADE IN" page) — instead of
re-deriving tokens/animations from scratch.

This site has **no build step or shared includes** — every page is a fully
self-contained HTML file. These files are therefore meant to be **copy-pasted
into a new page**, not linked/imported at runtime.

## Files

| File | What it is | How to use |
|---|---|---|
| `tokens.css` | `:root` color variables (cream/olive/gold + swappable `--accent`) + base reset/rhythm | Paste into the new page's `<style>` block first |
| `components.css` | Buttons, section-header trio, cards, chips, FAQ accordion, zigzag timeline, testimonial carousel, WhatsApp float | Paste right after tokens.css |
| `fade-in-scroll.html` | AOS (Animate On Scroll) CDN includes + init + usage/staggering notes | Copy the `<link>`/`<script>` blocks into `<head>`/before `</body>` |
| `testimonial-carousel.js` | IntersectionObserver dot-nav sync for the testimonial carousel, + WhatsApp float show/hide | Paste into a `<script>` block before the AOS init script |
| `landing-page-template.html` | Full skeleton page combining all of the above, with `[טקסט placeholder]` markers | Duplicate this file the same way `new-page-scaffold` duplicates existing pages, then fill in placeholders |

## Design language

**Typography**: Assistant (sans, body/UI text) + Cormorant Garamond (serif,
headings + italic emotional/quote text). Always paired, never the same font
for both.

**Color**: a warm cream/olive/gold base (identity color, keep as-is per
brand) + one swappable `--accent`/`--accent-deep` pair (terracotta on the
course page). **Re-tint the accent per topic** — that's what should make a
FADE IN page feel different from a course page, while everything else
(cards, buttons, spacing, fonts) stays identical for consistency and speed.

**Animation philosophy — two separate systems, both present:**
1. **Scroll reveal** (AOS): `data-aos="fade-up|fade-right|fade-left|zoom-in"`
   on section content, staggered with `data-aos-delay`. See
   `fade-in-scroll.html` for the exact staggering conventions used.
2. **Idle micro-animation**: the `.btn-primary` "breathing glow" keyframe
   runs continuously on the primary CTA button (stops on hover) — independent
   of scroll, always active.

Both respect `prefers-reduced-motion` (AOS `disable` option + a global CSS
override) — keep both when reusing.

**Recurring structural patterns worth copying, not just the CSS:**
- **Section header trio**: `.section-label` (eyebrow) + `.gold-divider` +
  `h2`, centered, at the top of nearly every section.
- **Objection-handling testimonials**: short single-quote breaks interleaved
  *between* content sections (not just bunched at the end) — a copywriting
  pattern, not just a visual one.
- **FAQ as native `<details>/<summary>`** — no JS needed for the accordion
  itself (only the `+`→`×` rotate is CSS).

## Adding a new landing page (e.g. FADE IN)

1. Copy `landing-page-template.html` to the new filename.
2. Paste `tokens.css` + `components.css` into its `<style>` block.
3. Pick a new `--accent`/`--accent-deep` pair for the topic (re-tint the
   `btn-breathe` keyframe's rgba values to match if the hue changes a lot).
4. Paste in the AOS includes from `fade-in-scroll.html` and the carousel
   script from `testimonial-carousel.js` if using a testimonial carousel.
5. Fill in the `[placeholder]` text/images, following this repo's existing
   rules: run new images through `optimize-images.mjs` (see the
   `image-optimize-and-alt` skill) and add Hebrew alt text before referencing
   them.
6. Wire the new page into site navigation per the `new-page-scaffold` skill.
7. Run the `frontend-design` skill's screenshot-compare loop before calling
   it done.

## Source of truth

`course-isha-magalit.html` is the canonical example implementation — if
anything here seems out of date, that file is the reference to re-derive
from.
