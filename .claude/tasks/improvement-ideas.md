# Improvement Ideas

Prioritized recommendations for the Eleventy + Sveltia portfolio. Tags: **P0** = do before or immediately after DNS cutover, **P1** = should do within weeks, **P2** = nice to have.

---

## Performance

### P0 — Convert raster images to WebP/AVIF and resize to actual display dimensions
`src/static/images/` is 7.2 MB across 24 files. `header/logo-desktop.png` is 378 KB and `logo-mobile.png` is 380 KB despite being rendered at 223x180 and 180x145 respectively. `home/laser-hero.png` is 581 KB. These are clearly the source PSD exports, not web-optimized assets. Add a one-shot image pipeline (a `scripts/optimize-images.js` using `sharp`, or run `cwebp`/`avifenc` once) to generate WebP at the correct display sizes. Expect ~80% size reduction. For the logo specifically, downscale to roughly 2x the rendered size (~450x360 desktop) and serve as WebP — this should be under 40 KB.

### P0 — Stop inlining fonts-from-Google and self-host JetBrains Mono
`src/pages.njk:40` fetches from `fonts.googleapis.com`, which adds two DNS lookups plus two requests on every page. Download the WOFF2 files for weights 400 and 700, put them in `src/static/fonts/`, and use `@font-face` with `font-display: swap` directly in `styles.css`. Add `<link rel="preload" as="font" type="font/woff2" crossorigin>` for the 400 weight. Removes a third-party dependency, improves LCP, and survives Google Fonts outages. The privacy benefit also matters if you eventually care about GDPR.

### P1 — Drop the Squarespace container overrides
`src/_includes/styles.css:8-22` still carries the `!important` block targeting `.sqs-block-code` etc. This site doesn't deploy to Squarespace anymore. Removing it shrinks the CSS slightly and eliminates the mental overhead of "why is this here?" Same goes for the `Pages/` directory of legacy HTML — archive it once DNS is cut over and parity is confirmed.

### P1 — Extract the inline `<script>` into an external file
The ~450 lines of JS in `src/pages.njk:71-534` are duplicated verbatim into every page's HTML at build time. Move it to `src/static/js/terminal.js`, add a passthrough copy, reference it with `<script defer src="/static/js/terminal.js"></script>`. Browsers cache it once and reuse for all 8 pages. Shrinks each page's HTML from ~40 KB to ~15 KB.

### P2 — Defer iframe loading on dropdowns
All YouTube/Vimeo/LinkedIn iframes inside dropdowns already lazy-load because they only exist after the dropdown is opened. Fine. But for the Home hero image and any other images rendered above the fold via `inject`, add `loading="lazy"` to below-the-fold images in `renderMediaItem()` in `.eleventy.js:22`. The hero image should stay eager.

### Do NOT
- Don't add a bundler (Vite, esbuild, etc.). There's one CSS file and one JS file. A bundler would add build complexity for no benefit.
- Don't minify CSS/JS. JetBrains Mono + gzip on GH Pages already gives you >70% compression, and losing readable inline source is an anti-feature for a portfolio where "view source" is on-brand.

---

## SEO

### P0 — Generate `sitemap.xml` and `robots.txt`
Neither exists in `_site/`. Add a `src/sitemap.njk` template that iterates `pages` and emits `<url>` entries using `site.url + page.slug`, plus a static `src/robots.txt` that points to the sitemap. Eleventy can build both; add them to `addPassthroughCopy` or as templates. Critical for Google Search Console.

### P0 — Add `<link rel="canonical">`
`pages.njk` sets `og:url` from `page.seo.url` but never emits an actual `<link rel="canonical">`. Add one immediately after the description meta tag. For a site that will have both a GH Pages URL and a custom domain during cutover, this is a must to prevent duplicate-content splits.

### P1 — Ship JSON-LD structured data
`project-status.md` already lists this as a CMS checkbox. The highest-ROI schemas for this site:
- **Person** schema on the About page (name, jobTitle, sameAs with LinkedIn URL, image).
- **WebSite** with `potentialAction: SearchAction` on home (even without a search box, Google uses this).
- **CreativeWork** or **VideoObject** on media entries that include YouTube/Vimeo embeds.

Add a Nunjucks include `src/_includes/jsonld.njk` that conditionally emits schemas based on `page.slug`, rather than freehand JSON-LD per CMS entry — which is error-prone.

### P1 — Expose per-portfolio-entry data for deep linking
Right now, every project lives behind a dropdown on a parent page. There's no `/media/podcast-xyz/` URL. That's fine for the aesthetic, but Google can only index the parent page's text, which means the portfolio entries compete for one title/description. Two options:
1. **Anchor links:** have each dropdown get an `id` derived from a slug field in YAML, and auto-open on hash load. Cheap, preserves aesthetic, improves deep-linking.
2. **Generated stub pages:** build minimal `/automation/project-name/` pages that 301 to `/automation#project-name` with full OG tags. More work, but gives per-project social sharing.

Start with option 1.

### P1 — Audit internal linking
The only internal links are the 8 nav entries. Consider adding "Related" links inside dropdown content (e.g., Media project mentions the same client as a Paid Ads case study → link it). Without internal linking, Google treats each page as an island.

### P2 — Add a `<meta name="generator">` and author meta
Tiny win but conventional.

---

## Accessibility

### P0 — Respect `prefers-reduced-motion`
The typing animation is charming but it's a 5ms-per-character crawl through hundreds of characters on every page load. Users with vestibular sensitivity or on a slow device will hate it. In `pages.njk`, detect `window.matchMedia('(prefers-reduced-motion: reduce)').matches` at the top of the DOMContentLoaded handler and short-circuit `typeContent` / `typeIntoElement` to `element.textContent = text; callback();` synchronously. Do the same for `.dialup-reveal` and `.line-break` CSS animations — wrap them in a `@media (prefers-reduced-motion: no-preference)` block in `styles.css`.

### P0 — Make the theme toggle keyboard-accessible
`#themeToggle` in `pages.njk:62` is a `<div>` with a click handler. It has no `role`, `tabindex`, or keyboard listener. Change to a real `<button>` (style it with `all: unset`), give it `aria-label="Switch to black and white theme"` that updates based on state, and the keyboard works for free.

### P1 — Give the terminal a proper accessible name
`.terminal-screen` is the main content region but has no landmark. Wrap in `<main aria-label="Terminal output">` or add `role="main"`. Consider `aria-live="polite"` on `#terminal-text` so screen reader users hear content as it types — but test this carefully, because 5ms-per-character may spam SR output. Safer: gate `aria-live` behind `prefers-reduced-motion: reduce` and dump content instantly there.

### P1 — Focus states on every interactive element
Quick audit: `.terminal-link`, `.terminal-link-menu`, `.terminal-link-inline`, `.dropdown-toggle`. Verify `:focus-visible` in `styles.css` gives each a visible outline (not `outline: none`). The nav links especially — keyboard users number-key through but Tab should also work.

### P1 — The `enter` prompt is mouse/keyboard only
After typing finishes, "Press Enter" appears. Screen reader users on iOS/Android with no hardware keyboard may not realize the hidden `#mobile-input` is the way in. Make the prompt text clearer: "Type a number from 0 to 7 and press Enter/Go" and ensure `#mobile-input` has `aria-label="Navigation command"`.

### P2 — Non-terminal text-only fallback page
Already on the post-cutover list. Worth building a `/plain/` route that renders the same content without animation or terminal chrome. Would also be a fallback for search crawlers that render JS poorly — though Googlebot handles this site fine.

---

## CMS UX (Sveltia)

### P1 — Consolidate the duplicated project schema
`src/admin/config.yml` duplicates the project-field block across automation, media, paid-ads, reporting, resources, websites (lines 110-590). Sveltia doesn't support YAML anchors *inside* config.yml, but it does load config at runtime — so a small preprocessor (a Node script that expands anchors and writes the real file on `prebuild`) is viable. Alternatively: use Sveltia's `default_collection_schema` if supported in your version. Right now, editing a field means changing it in 6 places.

### P1 — Add in-CMS image size hints
The CMS lets the user upload any image. After the image pipeline lands (Performance P0), add validation on image width in the CMS or a note: "Upload images at least 1200px wide; they'll be compressed automatically."

### P2 — CMS preview for the dropdown layout
`editor: { preview: false }` is set on every collection. Sveltia's preview pane could show a live rendering. This is substantial work (you'd need a preview template matching the terminal look), but would dramatically help a non-technical editor understand what order/media combinations look like.

---

## Code Quality & DX

### P1 — Validate YAML content at build time
`.eleventy.js` accepts any shape of project YAML. If the CMS saves a malformed `section` (missing `heading`, empty `projects`), the build succeeds and the page silently breaks. Add a schema validator (e.g., `ajv` with a JSON schema per page type) that runs before Eleventy builds and fails the GitHub Actions deploy on invalid content. Prevents "I saved from the CMS and the site is now broken" scenarios.

### P1 — Broken-link checker in CI
Add a workflow step that runs `lychee` or `linkinator` against the built `_site/` and external `buttonlink` URLs. Critical because content is edited by a non-technical user who can easily paste a typo'd LinkedIn URL.

### P2 — Pin Node version
`deploy.yml:25` uses `node-version: 20`. Pin to `20.x` or commit `.nvmrc` so local dev matches CI. Not urgent.

### P2 — Dependabot / Renovate
Only two deps (`@11ty/eleventy`, `js-yaml`), but a yearly security refresh is cheap.

### Do NOT
- Don't adopt TypeScript. Two-file project, nothing to gain.
- Don't switch to Astro/Next. The current stack fits the site perfectly.

---

## Analytics & Monitoring

### P1 — Privacy-friendly analytics
Plausible or Umami via a single `<script defer>` tag. Avoid GA4 — it's overkill, slow, and brings cookie-banner obligations. This matters specifically because the portfolio markets marketing services; showing prospects that you chose a lightweight, ethical analytics tool is on-message.

### P2 — Sentry or similar for JS errors
The typing-animation JS has nontrivial complexity (the dropdown HTML parser in `pages.njk:392-462` is fragile — it re-implements HTML tag matching with regex). A tiny error tracker would catch breakage from weird CMS content. Low volume → free tier is plenty.

---

## Feature Ideas Genuinely Worth Considering

### P2 — `/resume.pdf` or printable `/print/` route
Recruiters will want one. Eleventy can render a separate template optimized for print/PDF from the About + resume content.

### P2 — RSS feed for "new work"
Only if you plan to post regularly. Skip otherwise.

### P2 — Terminal-style search (`grep`)
Overlay a fake `$ grep "keyword"` that searches content client-side. Fits the aesthetic perfectly and is genuinely useful on a site with 40+ dropdowns. Use Lunr or Pagefind.

### Skip outright
- Dark/light mode beyond what exists — the two themes are the schtick.
- A blog. Scope creep.
- Comments. Never.

---

## Resilience

### P1 — Back up CMS content outside GitHub
Content lives only in the `spencerflaherty.github.io` repo. If the repo is compromised or accidentally deleted, content is gone. Add a weekly GitHub Action that zips `src/content/` + `src/static/images/` and commits to a private mirror repo, or uploads to a cloud bucket. Fifteen minutes of work.

### P2 — Document Sveltia failure mode
If Sveltia itself breaks or its hosted auth endpoint goes down, the user can't edit via CMS. Note in `project-status.md` that content is plain YAML — editable via the GitHub web UI as a fallback. This is already true; just needs documenting.

### P2 — GH Pages outage contingency
GitHub Pages has historically had 2-4 multi-hour outages per year. A DNS failover to a Cloudflare Pages or Netlify mirror is possible but probably overkill for a portfolio. Mention in README as a future consideration.

---

Last Updated: 2026-04-21
