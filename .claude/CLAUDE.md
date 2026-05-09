# CLAUDE.md

Working guidance for this repository.

## Current Project State

This repo is the current Eleventy-based portfolio site. 

- Static site generator: Eleventy 3.x; Node pinned via `.nvmrc` (`20.11.1`), read by CI through `node-version-file`
- Main page template: `src/pages.njk` — emits `<link rel="canonical">` from `page.seo.url`, plus `<meta name="author">` and `<meta name="generator">`. Terminal screen is a `<main aria-label="Terminal output">` landmark; `#mobile-input` carries `aria-label="Navigation command"`. Page-specific data (segments, dropdown bodies, nav links, type speed, initial delay) is rendered inline as `window.__TERMINAL_DATA__`; all terminal logic lives in `src/static/js/terminal.js`, loaded via `<script defer>` so browsers cache it across pages. Theme toggle, typing animation, and `prefers-reduced-motion` short-circuit all run inside `terminal.js`
- Shared styles: `src/_includes/styles.css` (hover rules for terminal links wrapped in `@media (hover: hover)` so touchscreens don't light up while scrolling; `:focus-visible` and `:active` on terminal links/menu/inline use an inverted-block treatment matching hover, so tapping a link on touch devices also flashes the inverted highlight before navigation; `.dialup-reveal` clip-path animation gated behind `@media (prefers-reduced-motion: no-preference)`; `@font-face` declarations for self-hosted JetBrains Mono 400/700 with `font-display: swap`)
- Fonts: JetBrains Mono is self-hosted at `src/static/fonts/jetbrains-mono-{400,700}.woff2`; `pages.njk` preloads the 400 weight (no Google Fonts dependency)
- Raster images: collection imagery lives at `src/static/collections/<page>/<project-slug>/*` for the three work pages (`ai-systems`, `demand-gen`, `digital-media`) — one folder per project, multiple files allowed per project. `about/`, `home/`, and `shared/` stay flat. New CMS uploads land in `src/static/collections/<page>/_uploads/` and can be moved into a project subfolder later. Resized to display dimensions via `sharp`; a few small PNG screenshots kept where WebP did not shrink them. OG images and favicon stay PNG. Images default to `loading="lazy" decoding="async"`; an `eager` checkbox in the media schema flips the hero/first-visible image to `loading="eager" fetchpriority="high"`. YouTube/Vimeo/LinkedIn iframes also carry `loading="lazy"` (they're already injected on dropdown open, but the attribute is cheap defense-in-depth)
- Content source: `src/content/pages/*.yaml`
- CMS: Keystatic (local-only) — Next.js app under `src/app/`, schema at `keystatic.config.ts`. Page singletons are built via a `makePageSchema(slug)` factory so each page's image fields default to its own `_uploads/` folder; every media block has a `pickExisting` select populated from that page's collection folder + `shared/` (renderer precedence: `image` upload > `pickExisting` > manual `src`). Field labels and descriptions cover SEO, prompt, layout, navigation, and per-block media types. `pickExisting` options are pre-generated into `keystatic.image-options.json` by `scripts/generate-image-options.mjs` (runs automatically before `admin:dev`/`admin:build` via the `cms:options` npm script) — required because Next 16 / Turbopack bundles the config for the client and can't resolve `fs`/`path`. Picker list is frozen at server start; restart the CMS to see newly uploaded images in the dropdown
- Static assets: `src/static/`
- SEO surface: `src/sitemap.njk` builds `_site/sitemap.xml` from the `pages` global (home + nav-visible pages); `src/robots.txt` is passthrough-copied via `.eleventy.js` and points to the sitemap. `src/_includes/jsonld.njk` (driven by the `buildJsonLd` filter in `.eleventy.js`) emits a `@graph` per page — Person + WebSite + WebPage/AboutPage/CollectionPage, plus an `ItemList` of projects with `#slug` anchor URLs on the three work pages. Google Search Console is verified at the DNS level; `src/pages.njk` still exposes a fallback configurable verification meta tag from `site.analytics.googleSiteVerification`
- Analytics: `src/pages.njk` loads Cloudflare Web Analytics via a single deferred beacon script using the configured token when `site.analytics.provider` is `cloudflare`; analytics settings live in `src/_data/site.yaml`
- Project deep-linking: each project under a `section` gets a slug (auto-derived from its title via `slugify`, or overridden by an optional `slug` field in YAML / Keystatic). The dropdown renders with that `id`, and `terminal.js` auto-opens the matching dropdown on `location.hash` load and `hashchange`. Each project also accepts an optional `related` array of `{text, href}` items that renders as a `Related: link, link` line inside the dropdown body (slots into `order` as `related`, otherwise appends after the stack)
- Deployment: GitHub Pages via `.github/workflows/deploy.yml`
- Custom domain target: `https://spencerflaherty.com`

## Current Launch State

- Site is live at `https://spencerflaherty.com`
- GitHub Pages custom domain is set and HTTPS is enforced
- GoDaddy DNS resolves to GitHub Pages A/AAAA records
- CMS is local-only. Launchers in repo root: `Open CMS.command` (double-clickable shell script) and `Open CMS.app` (macOS app bundle). Both start the dev server and open `http://127.0.0.1:3000/keystatic`. Manual fallback: `NEXT_PUBLIC_KEYSTATIC_STORAGE_KIND=local npm run admin:dev`.
- Publishing: a floating **Publish live** button (bottom-right, `src/app/_components/PublishButton.tsx`) is mounted globally in the Keystatic admin. It POSTs to `/api/publish`, which builds Eleventy, commits `src/_data` + `src/content` + `src/static/collections`, and pushes to `main` — GitHub Pages deploys from there. A standalone `/publish` page also exists as a backup.

## Canonical Files

Use the live repo files, not archived guidance:

- Architecture and page runtime: `src/pages.njk` (HTML shell + inline data) and `src/static/js/terminal.js` (typing engine, dropdowns, navigation, theme toggle)
- Visual system and spacing rules: `src/_includes/styles.css`
- Site-wide settings: `src/_data/site.yaml`
- Page content and SEO values: `src/content/pages/*.yaml`
- CMS schema: `keystatic.config.ts`
- Local publish action: `src/app/api/publish/route.ts` (API), `src/app/_components/PublishButton.tsx` (floating button), `src/app/publish/page.tsx` (standalone page)
- CMS launchers: `Open CMS.command`, `Open CMS.app/`

## Working Rules

- Prefer minimal changes with clear verification.
- Treat the Eleventy/YAML/CMS workflow as canonical.
- Do not reintroduce old Squarespace-only documentation patterns.
- When changing layout, typing behavior, dropdowns, navigation, or theme behavior, inspect both `src/pages.njk` and `src/_includes/styles.css`.
- When changing page content or metadata, update the relevant YAML file in `src/content/pages/` (note: `.yaml` extension — Keystatic writes YAML as `.yaml`, Eleventy reads both).
- When changing editable fields, keep `keystatic.config.ts`, the YAML shape, and `.eleventy.js` rendering aligned.
- The Keystatic admin and `/publish` route are local-only; do not deploy them to Vercel/cloud.
- After each real piece of progress or decision while working through `.claude/tasks/improvement-ideas.md`, update that file (strike through the item with `~~...~~`, append `(done YYYY-MM-DD)`, and replace the body with a one-line note of what changed).
- Once an item is fully implemented, fold a short note about how it *currently* works into the relevant existing section of this CLAUDE.md (e.g., extend a bullet under **Current Project State** or **Canonical Files**). General terms, not change history. Don't add new top-level sections just to track shipped work.
- When a discrete feature, fix, or content change is complete and verified, proactively suggest committing and pushing to `main` (pushing triggers the GitHub Actions deploy at `.github/workflows/deploy.yml`, which publishes the site live). Surface this as a question, not an action — never commit or push without explicit confirmation. After a push, mention `gh run watch` so the user can monitor the deploy. Skip the suggestion for exploratory or WIP changes.

## Session Start Checklist

The user edits content via the local CMS and pushes directly to `main` with the Publish button. That means local `main` can be behind `origin/main` between sessions, and uncommitted changes in content paths may indicate an in-progress CMS draft. Before making edits in a fresh session:

- Run `git status`. If `src/_data/`, `src/content/`, or `src/static/collections/` show uncommitted changes, the user likely has unpublished CMS drafts — stop and ask before touching those paths.
- Run `git fetch origin main && git rev-list --count HEAD..origin/main`. If non-zero, offer to `git pull --ff-only origin main` before editing.

Skip this for read-only questions; only run when the user asks for edits.

## Canonical Page Set

Treat these as the current live content pages:

- `home`
- `about`
- `demand-gen`
- `ai-systems`
- `digital-media`

Legacy experiments and parallel page structures should not replace this set unless explicitly requested.

## Current Priorities

See `.claude/tasks/improvement-ideas.md` for prioritized post-launch work.

Last Updated: 2026-05-09 (analytics pass: Cloudflare Web Analytics token + DNS-verified Search Console)
