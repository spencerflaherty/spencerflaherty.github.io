# Project Status

Portfolio site — current state and path to DNS cutover.

---

## Stack (as shipped)

- **SSG:** Eleventy 3.x (`.eleventy.js`, `src/pages.njk`)
- **Content:** YAML files in `src/content/pages/*.yml` (one per page)
- **Template:** single Nunjucks layout + shared CSS in `src/_includes/styles.css`
- **CMS:** Sveltia CMS at `src/admin/`, GitHub OAuth backend (repo: `spencerflaherty/spencerflaherty.github.io`)
- **Images:** `src/static/images/`, served from `/static/images/`
- **Hosting:** GitHub Pages via `.github/workflows/deploy.yml`
- **Live staging URL:** spencerflaherty.github.io
- **Target production URL:** spencerflaherty.com (DNS cutover pending)

---

## Pages

All 8 pages built from a single template and live on staging:

Home, About, Automation, Media, Paid Ads, Reporting, Resources, Websites.

---

## Pre-Cutover Checklist

### Visual parity with live spencerflaherty.com
Port the small details from the current Squarespace site so the new site matches before DNS swap:

- [x] **Header logo** — desktop + mobile logos at `src/static/images/header/`, centered above terminal window
- [x] **Background color** — body set to `#1b0024` to match live site
- [ ] **Favicon** — pull favicon from live site
- [ ] **Other small visual details** — side-by-side walkthrough of live vs new for spacing, colors, font weights, anything missed

### Content polish
- [ ] **Project completion years** — add year to each portfolio entry
- [ ] **Image alt text** — SEO-friendly alt on every image in `src/content/pages/*.yml`

### SEO — full per-page editing in CMS
Current CMS only exposes title / description / canonical URL / OG image per page. Expand the `seo` block in `src/admin/config.yml` for every collection (and add matching fields to the Eleventy template if not already supported) so all of the following are editable per page:

- [ ] Page title (already exists)
- [ ] Meta description (already exists)
- [ ] Canonical URL (already exists)
- [ ] OG title (optional override of page title)
- [ ] OG description (optional override of meta description)
- [ ] OG image (already exists)
- [ ] Twitter title (optional override)
- [ ] Twitter description (optional override)
- [ ] Twitter image (optional override of OG image)
- [ ] Twitter card type (`summary` vs `summary_large_image`)
- [ ] Keywords / focus keyword
- [ ] Robots directive (index/noindex, follow/nofollow)
- [ ] Author
- [ ] JSON-LD structured data block (per page, freeform textarea)

Template already handles `ogTitle`, `ogDescription`, `twitterTitle`, `twitterDescription`, `twitterImage` fallbacks in `src/pages.njk` — just need the CMS fields to feed them.

### Build & QA
- [ ] **Run `npm run build` locally** — confirm no errors
- [ ] **Smoke test staging** at spencerflaherty.github.io: all 8 pages, theme toggle, typing animation, dropdowns, nav, media embeds, mobile layout
- [ ] **Test CMS** — log in at `/admin` with GitHub, make a test edit, confirm it commits and redeploys

### Admin / CMS
- [x] Sveltia CMS at `/admin` via GitHub OAuth (no separate password — repo write access = edit access)
- [ ] **Register GitHub OAuth app** and add Client ID to `src/admin/config.yml` (currently commented out)

---

## DNS Cutover Plan

Full step-by-step plan (prechecks, exact GoDaddy records incl. IPv6, verification commands, rollback, gotchas) lives in `dns-cutover-plan.md`.

---

## Improvement Ideas

Prioritized (P0/P1/P2) list of post-cutover improvements across performance, SEO, accessibility, CMS UX, code quality, analytics, features, and resilience lives in `improvement-ideas.md`.

---

Last Updated: 2026-04-21
