# Plan: Migrate Portfolio to Self-Hosted Template + Admin Panel

## Context

Today the portfolio lives as 8 standalone HTML files deployed into Squarespace code blocks. Each file duplicates ~500 lines of shared infrastructure (CSS reset, theming, typing engine, navigation, window chrome) and each page's content is hand-inlined into `contentSegments` / `dropdownBodyContent` JS arrays. Content markdown in `Pages/Content/` exists but is not wired to the HTML — it's reference material that Claude hand-translates.

Spencer wants to:
1. Edit the template in one place instead of eight
2. Edit content (words, order, media) through a regular admin UI — no code
3. Host at spencerflaherty.com himself, cheaply
4. Kill Squarespace

The exploration surfaced a blocker: **the 8 pages have drifted**. Some have minified CSS, some have the slider engine, some have stripped-down JS. Templating can't begin until the pages share a single source of truth again.

## Recommended Architecture

**Static site generator + git-based CMS + free static host.**

| Layer | Choice | Why |
|---|---|---|
| Build | **Eleventy (11ty)** | Outputs plain HTML (matches current paradigm), no framework overhead, Nunjucks templating is dead simple, zero runtime cost. |
| Content store | **YAML files in repo** (one per page, committed to git) | No database to run, full version history, diffable, survives any tool change. |
| Admin UI | **Sveltia CMS** (modern fork of Decap) | Free, self-hosted at `/admin/`, GitHub OAuth, writes to git as commits. Structured forms for each content type. Works without the Netlify-identity proxy Decap requires. |
| Host | **Cloudflare Pages** | Free tier covers this forever, unmetered bandwidth, free SSL, free OAuth proxy for Sveltia, auto-deploy on `git push`, excellent DNS since you can move the domain to Cloudflare too. |
| Images | **Repo-hosted under `/static/images/`** + Cloudflare's image CDN | Cuts the Squarespace CDN dependency. Cloudflare serves them from edge for free. |

Total monthly cost: **$0** (plus domain renewal).

## Content Model

Each page becomes one YAML file under `src/content/pages/`. Example schema for a multi-project page like Automation:

```yaml
# src/content/pages/automation.yml
slug: automation
windowTitle: /Automation/
h1: AUTOMATION
seo:
  title: Automation — Spencer Flaherty
  description: ...
  ogImage: /static/og/automation.png
intro: >
  The pages preceding dropdowns — typed text.
sections:
  - heading: Outbound Lead Generation
    projects:
      - title: EV Feasibility Engine
        order: [media, description, stack]   # controls dropdown layout
        description: |
          Architected an end-to-end pipeline...
        media:
          - type: image
            src: /static/images/automation/ev-feasibility-engine.png
            alt: EV Feasibility Engine
        stack:
          - category: AI Logic
            items: [Agentic Workflows]
          - category: Spatial Data
            items: [OpenStreetMap]
```

Home/About (single-project pages) get a simpler schema without `sections`.

The build merges each YAML file with a single `page.njk` template that renders:
- `<head>` (meta, OG, fonts)
- shared CSS block (one file, one source of truth)
- shared JS (typing engine, nav, theme toggle, dropdowns, sliders, dial-up)
- `contentSegments` and `dropdownBodyContent` **generated from YAML** at build time

## Phased Rollout

### Phase 0 — Consolidate drift *(prerequisite; ~half a day)*
The style guide at `.claude/Style Guide/Current/style-guide-example.html` is the declared source of truth but several pages have diverged. Before templating:
- Pick the style guide's CSS/JS as canonical
- Rebuild Reporting, Resources, Websites to match (they're currently on minified/stripped versions)
- Verify every page still renders identically on Squarespace

This is the hardest-to-skip step. Doing it after templating means encoding the drift into the template.

### Phase 1 — Scaffold 11ty + template *(~1 day)*
- `npm init`, add `@11ty/eleventy`
- Create `src/_includes/page.njk` containing the unified template
- Extract the shared CSS into `src/_includes/styles.css` (inlined at build)
- Extract the shared JS into `src/_includes/app.js` (inlined at build)
- Write a small Nunjucks macro that converts the YAML `sections` tree into `contentSegments` and `dropdownBodyContent` arrays — this is the one piece of real logic
- Verify: build against an empty content file, inspect output HTML vs. a current page — should be byte-identical in structure

### Phase 2 — Migrate content to YAML *(~1 day, mechanical)*
- For each of the 8 pages, extract content from the live HTML into a YAML file
- Run the 11ty build, diff output against current HTML
- Fix the Nunjucks macro until the diff is empty
- At this point the site is rebuildable from content files

### Phase 3 — Repatriate images *(~half a day)*
- Download all Squarespace CDN images referenced in content into `src/static/images/<page>/`
- Update YAML paths
- Keeps the PSD/PNG pairs that already live in `Pages/Content/<project>/` — those are the sources

### Phase 4 — Wire up Sveltia CMS *(~half a day)*
- Add `src/admin/index.html` (just loads Sveltia from CDN)
- Add `src/admin/config.yml` declaring the content schema (mirrors the YAML files from Phase 1)
- Configure GitHub OAuth app
- Test: log in at `/admin/`, edit a word in a project description, save → commit lands in the repo → Cloudflare Pages rebuilds → site updates

### Phase 5 — Go live on Cloudflare Pages + cut over DNS *(~1–2 hours of active work, plus DNS propagation)*
- Connect repo to Cloudflare Pages, configure build command (`npx @11ty/eleventy`) and output directory (`_site`)
- Deploy to a preview URL first (e.g. `portfolio.pages.dev`)
- Test every page, theme toggle, nav, dropdowns, admin panel
- When satisfied, add `spencerflaherty.com` as custom domain in Pages
- Update DNS at the domain registrar: either move DNS to Cloudflare (recommended — better integration) or add the CNAME/A records Cloudflare gives you
- Verify SSL provisions, every URL resolves, `/admin/` works
- **Only then** cancel the Squarespace subscription

## Critical Files / Paths

| Path | Role in new system |
|---|---|
| `.claude/Style Guide/Current/style-guide-example.html` | Source for the unified CSS/JS extracted in Phase 1 |
| `Pages/HTML/Automation.html` | Canonical content structure — model Phase 2 YAML schema from this |
| `Pages/Content/**/*.md` | Reference for copy (already exists; merge into YAML during Phase 2) |
| `package.json` *(new)* | 11ty + Sveltia config |
| `.eleventy.js` *(new)* | Build config |
| `src/_includes/page.njk` *(new)* | The one template |
| `src/_includes/styles.css`, `app.js` *(new)* | Extracted shared assets |
| `src/content/pages/*.yml` *(new, 8 files)* | All page content |
| `src/static/images/` *(new)* | Repatriated images |
| `src/admin/config.yml` *(new)* | CMS schema |

## Verification Per Phase

- **Phase 0**: Open every page in a browser, compare against the style guide visually and against each other. Theme toggle, nav keypresses, dropdowns, dial-up reveal all behave identically on all 8 pages.
- **Phase 1–2**: `npx @11ty/eleventy --serve`, then for each page, diff the generated HTML against the current file. Differences should be whitespace only once the macro is correct.
- **Phase 3**: No requests to `images.squarespace-cdn.com` in browser Network tab on any page.
- **Phase 4**: Log into `/admin/`, make a visible edit, watch it land in git within ~10s, watch Cloudflare rebuild, confirm site updated.
- **Phase 5**: `dig spencerflaherty.com` points to Cloudflare. Every page loads. SSL valid. `/admin/` reachable. Squarespace subscription cancelled only after 48h of clean traffic logs.

## Execution Log

### Phase 0 — Drift Audit (2026-04-20)

Audited all 8 pages against `.claude/Style Guide/Current/style-guide-example.html` (1133 lines, ~482 CSS, ~610 JS).

| Page | CSS | Dropdowns | Sliders | Dial-up | Theme | Verdict |
|------|-----|-----------|---------|---------|-------|---------|
| Automation.html | expanded ~482 | ✅ | ✅ | ✅ | ✅ | CANONICAL |
| Media.html | expanded ~490 | ✅ | ✅ | ✅ | ✅ | CANONICAL |
| Paid Ads.html | expanded ~495 | ✅ | ✅ | ✅ | ✅ | CANONICAL |
| Home_WithImage.html | expanded ~343 | ❌ | ❌ | ✅ | ✅ | feature-subset |
| About.html | expanded ~349 | ❌ | ❌ | ✅ | ✅ | feature-subset |
| Reporting.html | **minified** ~155 | ✅ simplified | ❌ | ✅ | ✅ | DRIFTED |
| Resources.html | **minified** ~155 | ✅ simplified | ❌ | ✅ | ✅ | DRIFTED |
| Websites.html | **minified** ~155 | ✅ simplified | ❌ | ✅ | ✅ | DRIFTED |

**Decision (2026-04-20):** Skip Phase 0 rebuild. The drifted pages will be REPLACED in Phase 2 when we generate HTML from YAML via the canonical template — rebuilding them first is throwaway work. Automation.html serves as the sole canonical reference for Phase 1 verification. Drifted pages stay live on Squarespace until Phase 5 cutover (functional, just internally inconsistent).

### CSS Union Audit (2026-04-20)

Compared style guide's CSS against the union of all 8 pages. Findings:

**Gaps to add to unified template CSS:**
1. **Full Squarespace overrides** (6 selectors, per CLAUDE.md) — style guide only has 2. Media.html uses the full set. Template must use full set.
2. **`.dropdown.open { margin-bottom: 15px; }`** — used on Automation/Media, missing from style guide.
3. **About-specific image constraint**: `.media-dialup-container img { max-width: 125px; }` — scope via a modifier class (e.g., `.media-dialup-container--profile`).

**Non-gaps (no template changes needed):**
- Inline `style="..."` on Vimeo/vertical-video embeds — belongs in content (YAML), template just passes through.
- Minified CSS on Reporting/Resources/Websites — functionally equivalent to style guide.
- Bare-tag vs class selectors (h1 vs .h1) — content-side concern; template macro emits consistent output.

Style guide covers ~92% of union; the 3 gaps above bring it to 100%.

### Phase 1 + 2 — Scaffold + Migrate (2026-04-20)

**Delivered:**
- `.eleventy.js` converter: `buildSegments()` + `buildDropdownBodies()` generate the canonical contentSegments/dropdownBodyContent arrays from YAML. Schema supports per-project `order`, multiple media, `buttonlinks`, and `note`. Home page has a custom path (no h1, no Navigate h2 — nav renders inline after the hero image).
- `src/pages.njk`: unified Nunjucks template using pagination, inlines CSS via `{% include %}`, emits both JS arrays via `jsonify`. Adds `buttonlink` segment type to the JS engine.
- `src/_includes/styles.css`: style guide CSS + the 3 gap fixes (full Squarespace override set, `.dropdown.open { margin-bottom: 15px }`, `.media-dialup-container--sm img { max-width: 125px }`).
- 8 YAML files under `src/content/pages/` — home, about, automation, media, paid-ads, reporting, resources, websites.

**Verification (browser smoke test, all 8 pages):**
All pages build without errors and render correctly with typing animation, dropdowns (lazy-load + dial-up image reveal), theme toggle, and navigation keypress handling all working. Verified complex schemas:
- Websites "Auto International": image → description → "View Site" button → stack ✅
- Paid Ads "$20 CPL Photo Campaign": image → description → image → stack (multi-media cursor) ✅
- Automation "Geospatial Prospecting": image + description + stack ✅
- Home: custom prompt → hero image → display_categories nav (no h1) ✅

Only console error was a benign missing `favicon.ico` 404 — not blocking.

**Fixes during verification:**
- Home permalink: special-cased `slug === 'home'` → emit `index.html` instead of `home/index.html`.
- Home structure: `buildSegments` detects home slug and emits custom layout (no h1, inline navigation).
- cwd handling: `prompt.cwd !== undefined` (to respect empty-string override) instead of `||` (which falls back on empty strings).
- `h1` is now optional — skipped when page.h1 is falsy.

### Phase 3 — Image Repatriation (2026-04-21)

**Delivered:**
- 22 unique images downloaded from Squarespace CDN into `src/static/images/<page>/` (total ~7.6MB on disk). Files organized by page: og/, home/, about/, automation/, paid-ads/, reporting/, websites/. Media and Resources pages have no images (embeds/text only).
- All 27 CDN URL references in YAML rewritten to local paths via `/tmp/rewrite-yaml.js`. Script is idempotent — safe to re-run.
- `src/_data/site.yml` added with `url: https://www.spencerflaherty.com` for absolute-URL generation.
- New Eleventy filter `absUrl` in `.eleventy.js` — prefixes relative paths with `site.url`; leaves absolute URLs untouched. Applied to `og:image` and `twitter:image` tags (required by OG protocol).

**Verification:**
- `grep -r squarespace-cdn.com src/` → zero matches.
- Browser smoke test on `/automation/` + `/` — local images load with correct dimensions, zero console errors.
- og:image now serializes as `https://www.spencerflaherty.com/static/images/og/og-image.png` (absolute) ✅.

### Phase 4 — Sveltia CMS (2026-04-21)

**Delivered:**
- `src/admin/index.html` — loads Sveltia CMS from unpkg CDN. Includes `noindex` meta to prevent search indexing of the admin panel.
- `src/admin/config.yml` — full content schema for all 8 pages with polymorphic content types (image / youtube / vimeo / linkedin / html / buttonlink / linebreak / section with nested projects). Each multi-project page has its own collection with the appropriate default `order` (matches current content patterns). Reporting/Resources have slimmer schemas (no video media).
- `.eleventy.js` passthrough-copies `src/admin` → `/admin/` at build time.
- `package.json` — added `build`, `start`, `dev` npm scripts so Cloudflare Pages can run `npm run build`.

**Verification:**
- http://localhost:8080/admin/ loads cleanly — shows Sveltia login screen with "Work with Local Repository" (File System Access API), "Sign In with GitHub", and access-token options. Zero console errors, zero warnings after removing `type="module"` and the unsupported `local_backend` option.

**Remaining user setup for Phase 4 (requires human credentials):**
1. Update `backend.repo` in `config.yml` if the GitHub repo path differs from `spencerflaherty/Portfolio-Website`.
2. Register a GitHub OAuth app (Settings → Developer settings → OAuth Apps → New OAuth App). Sveltia PKCE flow means no client secret needed — only the Client ID. Homepage URL: `https://www.spencerflaherty.com`. Authorization callback: `https://auth.sveltia.app/callback`.
3. For local-only editing (no OAuth): click "Work with Local Repository" on login screen, grant file access to this repo folder.

### Phase 5 — Cloudflare Pages Deploy + DNS (PENDING — user-driven)

All code is ready. Remaining work requires Spencer's credentials:
1. Push repo to GitHub (`main` branch).
2. In Cloudflare Pages: connect repo, set build command `npm run build`, output directory `_site`. Deploy to preview.
3. Smoke-test every page, theme toggle, dropdowns, `/admin/` panel on `<project>.pages.dev` preview URL.
4. Add `spencerflaherty.com` as custom domain in Pages dashboard.
5. DNS cutover at domain registrar (prefer moving DNS to Cloudflare for best integration).
6. Verify SSL auto-provisions; verify `/admin/` works with GitHub OAuth; verify all pages resolve.
7. **Only then** cancel Squarespace subscription.

## Risks & Open Questions

1. **Squarespace CDN image URLs are load-bearing in content**. If any are still referenced after Phase 3 migration, they break when Squarespace is cancelled. A grep check for `squarespace-cdn.com` before Phase 5 is mandatory.
2. **The typing animation is stateful**. The current `contentSegments` array ordering matters for animation pacing. The Nunjucks macro must preserve exact ordering.
3. **OAuth for Sveltia**. Requires a GitHub OAuth app registration (one-time, free). Sveltia uses PKCE so no backend proxy needed on Cloudflare Pages.
4. **Mobile input quirks**. The current hidden-input-for-keyboard trick on mobile is subtle — confirm it still works after the CSS/JS is extracted and re-inlined.
