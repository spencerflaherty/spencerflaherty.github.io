# Lessons Learned - Portfolio Website

## Patterns to Remember

### Content Structure
- **Always sync .md and .html files**: When updating content, both the markdown source and HTML deployment files need to be updated together
- **Image URLs follow pattern**: Squarespace CDN URLs are in the format `https://images.squarespace-cdn.com/content/{site-id}/{image-id}/{filename}.png?content-type=image%2Fpng`
- **Dropdown content matches array index**: The order of dropdowns in `contentSegments` must match the order in `dropdownBodyContent` array

### HTML Structure
- **Terminal screen must be single-line**: The `.terminal-screen` element uses `white-space: pre-wrap`, so any newlines in HTML will render visibly
- **CSS reset must be first**: The `* { margin: 0; padding: 0; box-sizing: border-box; }` rule must appear before any other CSS
- **Window container padding**: Always `padding: 0 25px` (no mobile media query override)

### Image Handling
- **All images need dialup-reveal animation**: Images in dropdowns get the retro line-by-line reveal effect via `dialup-reveal` class
- **Wrap images in media-dialup-container**: Required for animation to work properly
- **Images need alt text**: SEO requirement for all images

### Project Organization
- **Each project gets its own folder**: Structure is `Pages/Content/{Page}/{Project Name}/`
- **Keep prompts with outputs**: Image prompts stored as `image-prompt.md` alongside generated images
- **Stack sections use bullet format**: Use `• ` (bullet character) not `- ` (hyphen) for "The Stack" lists

---

## Corrections History

*(Add entries when user provides corrections)*

### 2026-02-01: Initial Setup
- Created workflow orchestration system
- Established task tracking structure
