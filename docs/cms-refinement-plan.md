# CMS Refinement Plan

## 1. What Was There

- Sveltia CMS was already connected to GitHub and editing a file-based Eleventy setup.
- Each page lived in its own YAML file under `src/content/pages/`.
- The site rendered from those YAML files through `.eleventy.js` and [src/pages.njk](/Users/spencerflaherty/My%20Drive/Projects/Portfolio/Portfolio%20Website/src/pages.njk).
- Several behaviors were hardcoded outside the CMS:
  - navigation IDs and URLs
  - terminal prompt strings
  - logo assets and dimensions
  - advanced SEO fallback fields already used by the template
- Media editing was minimal. Most editors only had `src` and `alt`, with no width, caption, alignment, or embed sizing controls.
- Uploads were configured globally, so editors had no guardrails to keep images grouped by page area.

## 2. What Was Missing

- Editable navigation metadata per page.
- CMS fields for `ogTitle`, `ogDescription`, `twitterTitle`, `twitterDescription`, and `twitterImage`.
- Page-specific asset organization for uploads.
- Rich media presentation settings:
  - width
  - alignment
  - captions
  - size variants
  - spacing
  - aspect ratio for embeds
  - optional media link target
- Editable terminal behavior settings such as typing speed and initial delay.
- Editable branding settings for logo assets and dimensions.
- Visibility in the CMS for existing render options like section dividers and button target behavior.

## 3. Implementation Plan

1. Normalize page data in `.eleventy.js` so navigation and terminal defaults come from content and site settings instead of hardcoded arrays.
2. Expand `src/_data/site.yml` with branding and terminal settings that the template can read directly.
3. Expand `src/admin/config.yml` so the CMS exposes the missing SEO, navigation, branding, and media controls.
4. Route uploads into page-specific folders where practical to keep assets organized.
5. Update rendering in `.eleventy.js`, [src/pages.njk](/Users/spencerflaherty/My%20Drive/Projects/Portfolio/Portfolio%20Website/src/pages.njk), and [src/_includes/styles.css](/Users/spencerflaherty/My%20Drive/Projects/Portfolio/Portfolio%20Website/src/_includes/styles.css) so new CMS fields produce visible front-end changes.
6. Build and parse-check the result to confirm both the site and CMS config still work.

## 4. Double-Check / Verification

Run:

```bash
npm run build
node -e "const yaml=require('js-yaml'); const fs=require('fs'); yaml.load(fs.readFileSync('src/admin/config.yml','utf8')); console.log('config ok')"
```

Manual checks:

- Open `/admin/` and confirm page uploads default into each page’s image folder.
- Edit a media item and verify width, alignment, and caption changes appear on the front end.
- Confirm home/about/navigation still render in the intended order.
