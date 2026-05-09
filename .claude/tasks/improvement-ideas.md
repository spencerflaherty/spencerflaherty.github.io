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

# CMS
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

### ~~P2 — Terminal-style search (`grep`)~~ (done 2026-05-09)
`terminal.js` supports `grep <term>` against a build-time project index covering each entry's title, section, description, stack, media labels, buttons, notes, and related labels; one match jumps directly to the anchored dropdown, multiple matches show numbered choices.

### Want to properly link and built Splt and PNG23D.
Have locally. need to look up whats going on with them.

---

Last Updated: 2026-05-09
