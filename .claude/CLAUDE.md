# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Style Guide Reference

**CRITICAL**: For all technical implementation details (CSS, HTML structure, JavaScript), consult the canonical style guide at:

`.claude/Style Guide/Current/style-guide-example.html`

The style guide is a complete, working reference implementation that documents all CSS rules, the custom typing animation system, dropdown/navigation systems, mobile input handling, media sliders, and dial-up reveal animations.

**When to use the style guide:**
- Creating new pages (copy the structure)
- Fixing CSS/JavaScript issues (reference the working code)
- Understanding how any visual feature works (it's all implemented)
- Verifying proper implementation (compare against style guide)

---

## Workflow Orchestration

### Plan Mode Default
- Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions)
- If something goes sideways, STOP and re-plan immediately - don't keep pushing
- Write detailed specs upfront to reduce ambiguity

### Subagent Strategy
- Use subagents liberally to keep main context window clean
- Offload research, exploration, and parallel analysis to subagents
- One task per subagent for focused execution

### Self-Improvement Loop
- After ANY correction from the user: update 'tasks/lessons.md' with the pattern
- Write rules for yourself that prevent the same mistake

### Verification Before Done
- Never mark a task complete without proving it works
- Ask yourself: "Would a staff engineer approve this?"

### Demand Elegance (Balanced)
- For non-trivial changes: pause and ask "is there a more elegant way?"
- Skip this for simple, obvious fixes - don't over-engineer

### Core Principles
- **Simplicity First**: Make every change as simple as possible. Impact minimal code.
- **No Laziness**: Find root causes. No temporary fixes. Senior developer standards.
- **Minimal Impact**: Changes should only touch what's necessary.

---

## Project Overview

Spencer Flaherty's portfolio website - a collection of standalone HTML pages with embedded CSS/JS designed to look like a retro terminal interface. No build system, no external dependencies beyond Google Fonts.

**Canonical Technical Reference:** `.claude/Style Guide/Current/style-guide-example.html`
**Canonical Content Reference:** `Pages/HTML/Automation.html`

**Additional Documentation:**
- SEO specifications → `.claude/guides/seo-reference.md`
- Image generation system → `.claude/guides/image-generation-guide.md`
- Project status & tasks → `.claude/tasks/project-status.md`

---

## Architecture Overview

### Single-File Components
Each page is a self-contained HTML file with embedded `<style>` and `<script>` blocks. No external CSS/JS files. Deployed to Squarespace as code blocks.

### Squarespace Container Overrides
**CRITICAL**: Squarespace applies default width constraints to code blocks that can cause the terminal window to appear narrower on mobile. Every page **must** include these CSS overrides immediately after the CSS reset:

```css
/* --- SQUARESPACE CONTAINER OVERRIDES --- */
/* Force full-width on mobile to prevent Squarespace from constraining the code block */
body,
.sqs-block-code,
.sqs-block-content,
.sqs-code-container,
.sqs-layout .sqs-row,
.sqs-layout .sqs-col-12 {
    width: 100% !important;
    max-width: 100% !important;
    padding-left: 0 !important;
    padding-right: 0 !important;
    margin-left: 0 !important;
    margin-right: 0 !important;
}
```

These overrides target multiple Squarespace selectors to ensure consistent full-width rendering across all devices, especially mobile where Squarespace's default constraints are most problematic.

### Tech Stack
- **Font:** JetBrains Mono (weights: 400, 700) via Google Fonts
- **Animation:** Custom segment-based typing system (NOT Typed.js)
- **Theming:** CSS variables + localStorage for theme persistence
- **Format:** Full HTML documents with embedded styles/scripts

### Theming System
Two themes controlled via CSS variables and `body.classic-theme` class:
- **Cyberpunk** (default): Magenta (#ff00bb) and cyan (#00ffff) on dark purple
- **Classic**: White on black

Theme preference persists via `localStorage.getItem('theme')`.

### Custom Typing Animation System

The site uses a **custom segment-based typing system** with two arrays:

1. **`contentSegments`** — Array of segment objects defining what to type
2. **`dropdownBodyContent`** — Array of HTML strings for dropdown content (lazy-loaded)

**Six segment types:**

| Type | Purpose |
|------|---------|
| `type` | Plain text, typed character-by-character |
| `element` | DOM element created instantly, text typed into it |
| `dropdown` | Expandable section with lazy-loaded content |
| `navlink` | Full-width navigation menu links |
| `inlinelink` | Inline text links that flow with body text |
| `inject` | Instant HTML injection (no animation) |

**Key Implementation Details:**
- Elements are created instantly (no waiting for typing to reach them)
- Makes page interactive during typing animation
- Dropdown content is lazy-loaded on first open to avoid typing delay
- See style guide for complete implementation

### Navigation System
Terminal-style navigation using number input (0-7). Handled via keyboard events on desktop and hidden input field on mobile with `inputmode="numeric"`.

**Navigation Map:**
```javascript
const navigationMap = {
    '0': 'https://www.spencerflaherty.com',
    '1': 'https://www.spencerflaherty.com/about',
    '2': 'https://www.spencerflaherty.com/automation',
    '3': 'https://www.spencerflaherty.com/media',
    '4': 'https://www.spencerflaherty.com/paid-ads',
    '5': 'https://www.spencerflaherty.com/reporting',
    '6': 'https://www.spencerflaherty.com/resources',
    '7': 'https://www.spencerflaherty.com/websites'
};
```

---

## Project Structure

```
/
├── .claude/
│   ├── CLAUDE.md                # This file - architecture & workflow
│   ├── Style Guide/Current/
│   │   └── style-guide-example.html  # TECHNICAL REFERENCE
│   ├── guides/                  # Supporting documentation
│   │   ├── seo-reference.md
│   │   └── image-generation-guide.md
│   └── tasks/                   # Project tracking
│       ├── todo.md
│       ├── lessons.md
│       └── project-status.md
├── Pages/
│   ├── HTML/                    # All HTML page files (deployed to Squarespace)
│   │   ├── Automation.html      # CANONICAL CONTENT EXAMPLE
│   │   ├── Home_WithImage.html
│   │   ├── About.html
│   │   ├── Media.html
│   │   ├── Paid Ads.html
│   │   ├── Reporting.html
│   │   ├── Resources.html
│   │   └── Websites.html
│   └── Content/                 # Organized content by page/project
│       ├── [Page Name]/
│       │   ├── [Page Name].md   # Content for simple pages
│       │   └── [Project Name]/  # For multi-project pages
│       │       ├── [Project].md
│       │       ├── image-prompt.md
│       │       └── [images]
│       └── Z-Site-Wide/         # Shared assets
└── Archive/                     # Version history
```

### Content Organization Philosophy

The `Pages/Content/` directory mirrors the site structure:

- **Top-level pages** (About, Media, etc.): Single markdown file per page
- **Multi-project pages** (Automation, etc.): Each project gets its own subdirectory containing content markdown, image-prompt.md, and generated images

This structure ensures all assets related to a specific portfolio piece live together.

---

## Key Conventions

### Page Creation Workflow
1. Copy structure from `.claude/Style Guide/Current/style-guide-example.html`
2. Update meta tags (title, description, OG tags) - see `.claude/guides/seo-reference.md`
3. Customize `contentSegments` array for page content
4. Customize `dropdownBodyContent` array for dropdown content
5. Update window title and H1 to match page name

### Title Consistency
Window title (e.g., `/Automation/`) must match the page's H1 (e.g., `AUTOMATION`).

### Content Segment Conventions
- Display command must end with `\n\n` (two newlines) before H1 for visual spacing
- All H1 and H2 elements rendered via `element` type segments
- Section headings (H2) use `//` prefix (e.g., `// Outbound Lead Generation`)
- Dropdown titles (H3) are cyan and bold

### Dropdown Content Order
**CRITICAL**: The order of content elements varies by project. **Always check the markdown source file** for the exact positioning. Common patterns:

**Pattern 1 (Most Common):** Description → Media → The Stack
**Pattern 2:** Media → Description → The Stack
**Pattern 3:** Description → The Stack → Media
**Pattern 4:** Media1 → Description → Media2 → The Stack (multiple images/embeds)

**Never assume "image first"** - always reference the markdown file to determine the correct order for each project.

### "The Stack" Section Format
Each dropdown entry should include tools/technologies used:

```javascript
"Description of the project." +
"<br><br><strong>The Stack:</strong><br>• Tool 1<br>• Tool 2<br>• Tool 3"
```

Group related items on the same line when appropriate (e.g., `• Shure Mics, Rodecaster`).

### Images and Media
- ALL images must be wrapped in `.media-dialup-container` for dial-up reveal animation
- Images appear inline in dropdown content, not as inject segments
- Multiple images/embeds in one dropdown are separate elements, not sliders
- **CRITICAL SPACING RULES:**
  - **NO `<br>` tags before or after media containers** - CSS margin: 15px 0 handles all spacing
  - Text → "The Stack": Use `<br><br>` for paragraph spacing
  - Media → "The Stack": NO `<br>` tags (margin handles it)
  - Text → Media: NO `<br>` tags (margin handles it)
  - Media → Text: NO `<br>` tags (margin handles it)
- YouTube embeds: `<iframe src='https://www.youtube-nocookie.com/embed/VIDEO_ID?rel=0&modestbranding=1' title='Title'></iframe>` wrapped in `.media-dialup-container`
- Vimeo embeds: Wrap in `.media-dialup-container` and use responsive wrapper: `<div style='padding:56.25% 0 0 0;position:relative;'><iframe src='...' style='position:absolute;top:0;left:0;width:100%;height:100%;'></iframe></div>`
- LinkedIn embeds: Include `height='399'` attribute, wrap in `.media-dialup-container`

### Line Breaks
Use CSS-based line breaks via inject segment:
```javascript
{ type: 'inject', html: "<span class='line-break'></span>" }
```

**DO NOT** use character-based separators like `────────`.

### Personal Contact Information
NEVER include personal contact information (email, phone) in page content. Use LinkedIn or other professional profile links only.

---

## Common Workflows

### Creating a New Portfolio Entry

1. **Update content markdown** in `Pages/Content/[Page Name]/[Page Name].md`
2. **Generate image** (see `.claude/guides/image-generation-guide.md`)
3. **Update HTML page** in `Pages/HTML/[Page Name].html`:
   - Add dropdown to `contentSegments` array
   - Add content to `dropdownBodyContent` array (image first, description, then stack)
4. **Deploy** to Squarespace by copying HTML into code block

### Creating Image Prompts

See `.claude/guides/image-generation-guide.md` for the complete automated workflow.

### Updating SEO Meta Tags

See `.claude/guides/seo-reference.md` for current titles, descriptions, and OG tags for all pages.

---

Last Updated: 2026-02-03
