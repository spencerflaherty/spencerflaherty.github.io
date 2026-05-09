# Improvement Ideas

Prioritized recommendations for the Eleventy + Keystatic portfolio. Tags: **P0** = do before or immediately after DNS cutover, **P1** = should do within weeks, **P2** = nice to have.

## Working rules for this doc

- After each real piece of progress or decision, update the affected item: strike through with `~~...~~`, append `(done YYYY-MM-DD)`, and replace the body with a one-line note of what changed.
- Once an item is fully implemented, fold a short note about how it currently works into the most relevant existing section of `.claude/CLAUDE.md` (general terms, not change history). Don't add a new top-level section just to log shipped work.

### Do NOT
- Don't add a bundler (Vite, esbuild, etc.). There's one CSS file and one JS file. A bundler would add build complexity for no benefit.
- Don't minify CSS/JS. JetBrains Mono + gzip on GH Pages already gives you >70% compression, and losing readable inline source is an anti-feature for a portfolio where "view source" is on-brand.
- Don't adopt TypeScript. Two-file project, nothing to gain.
- Don't switch to Astro/Next. The current stack fits the site perfectly.
---

## SEO

### ~~P1 — Ship JSON-LD structured data~~ (done 2026-05-09)
`src/_includes/jsonld.njk` emits a `@graph` (Person + WebSite + per-page WebPage/AboutPage/CollectionPage, plus an ItemList of projects with anchor URLs on work pages) via the `buildJsonLd` filter in `.eleventy.js`.

### ~~P1 — Expose per-portfolio-entry data for deep linking~~ (done 2026-05-09)
Each project gets yesan auto-derived (or YAML-overridable) `slug`; the dropdown renders with that `id`, and `terminal.js` auto-opens the matching dropdown on `location.hash` load and `hashchange`.

### ~~P1 — Audit internal linking~~ (done 2026-05-09)
Added optional `related` array to project schema + `renderRelated` in `.eleventy.js`. Renders as `Related: link, link` inside the dropdown body (slots into `order` as `related`, otherwise appends after stack).

---

## Accessibility

### P2 — Non-terminal text-only fallback page
Already on the post-cutover list. Worth building a `/plain/` route that renders the same content without animation or terminal chrome. Would also be a fallback for search crawlers that render JS poorly — though Googlebot handles this site fine.

---

## Code Quality & DX

### P1 — Validate YAML content at build time
`.eleventy.js` accepts any shape of project YAML. If the CMS saves a malformed `section` (missing `heading`, empty `projects`), the build succeeds and the page silently breaks. Add a schema validator (e.g., `ajv` with a JSON schema per page type) that runs before Eleventy builds and fails the GitHub Actions deploy on invalid content. Prevents "I saved from the CMS and the site is now broken" scenarios.

### P1 — Broken-link checker in CI
Add a workflow step that runs `lychee` or `linkinator` against the built `_site/` and external `buttonlink` URLs. Critical because content is edited by a non-technical user who can easily paste a typo'd LinkedIn URL.

---

## CMS

### P2 — Migrate media fields to `fields.conditional`
Once the YAML can absorb a shape change (or via a one-shot migration script), move the per-type fields under a `fields.conditional` discriminated by `type`. That hides irrelevant fields completely instead of just labeling them. Defer until there's a clear migration path that won't lose data.

---

## Analytics & Monitoring

### ~~P1 — Privacy-friendly analytics~~ (done 2026-05-09)
`src/pages.njk` emits Cloudflare Web Analytics from the configured token in `src/_data/site.yaml`; Google Search Console is verified via DNS, with an optional meta fallback still available.

---

## Design & Theming

### P1 — Warm beige/brown B/W theme (easier on eyes)
Add a third theme alongside the existing dark and light modes — a low-contrast warm palette (think paper / sepia) that's gentler than the current bright white light mode. Should be the default light option, with the existing high-contrast white kept as an alternate or retired. Includes:
- Define background, text, accent, and link colors as a beige/brown ramp in `styles.css` (CSS custom properties so the theme toggle in `terminal.js` swaps them cleanly alongside dark mode).
- The site logo at the top is currently a flat black/white asset; in the warm theme it should pick up the warm accent color. Either tint via `filter` / `mask-image` CSS, or accept a pre-tinted logo file (Spencer can provide one) and swap `<img src>` per theme.
- Update `aria-pressed` / theme-toggle states in `terminal.js` to handle three themes (or replace toggle with a 3-state cycle).

### P1 — Spacing playground page (desktop + mobile)
Right now tweaking spacing means edit CSS → reload → eyeball. Build a single non-published `/playground/` route that renders a representative content page (a short dropdown, a long dropdown, hero image, project list) with live slider controls along the side for: window width, padding above/below logo, H1/H2 margins, dropdown margin-bottom, line-height, font-size. Toggle between desktop and mobile viewport widths in-page. Slider values write to CSS custom properties on `:root`, and a "copy values" button emits the final CSS vars block to paste into `styles.css` or `site.yaml` layout.spacing. Local-only, excluded from sitemap/nav.

---

### P2 — Terminal-style search (`grep`)
Overlay a fake `$ grep "keyword"` that searches content client-side. Fits the aesthetic perfectly and is genuinely useful on a site with 40+ dropdowns. Use Lunr or Pagefind.

---

Last Updated: 2026-05-09
