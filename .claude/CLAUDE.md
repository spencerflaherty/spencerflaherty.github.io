# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

---

## Workflow Orchestration

### 1. Plan Mode Default
- Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions)
- If something goes sideways, STOP and re-plan immediately - don't keep pushing
- Use plan mode for verification steps, not just building
- Write detailed specs upfront to reduce ambiguity

### 2. Subagent Strategy
- Use subagents liberally to keep main context window clean
- Offload research, exploration, and parallel analysis to subagents
- For complex problems, throw more compute at it via subagents
- One task per subagent for focused execution

### 3. Self-Improvement Loop
- After ANY correction from the user: update 'tasks/lessons.md' with the pattern
- Write rules for yourself that prevent the same mistake
- Ruthlessly iterate on these lessons until mistake rate drops
- Review lessons at session start for relevant project

### 4. Verification Before Done
- Never mark a task complete without proving it works
- Diff behavior between main and your changes when relevant
- Ask yourself: "Would a staff engineer approve this?"
- Run tests, check logs, demonstrate correctness

### 5. Demand Elegance (Balanced)
- For non-trivial changes: pause and ask "is there a more elegant way?"
- If a fix feels hacky: "Knowing everything I know now, implement the elegant solution"
- Skip this for simple, obvious fixes - don't over-engineer
- Challenge your own work before presenting it

### 6. Autonomous Bug Fixing
- When given a bug report: just fix it. Don't ask for hand-holding
- Point at logs, errors, failing tests - then resolve them
- Zero context switching required from the user
- Go fix failing CI tests without being told how

## Task Management

1. **Plan First**: Write plan to "tasks/todo.md" with checkable items
2. **Verify Plan**: Check in before starting implementation
3. **Track Progress**: Mark items complete as you go
4. **Explain Changes**: High-level summary at each step
5. **Document Results**: Add review section to "tasks/todo.md"
6. **Capture Lessons**: Update "tasks/lessons.md" after corrections

## Core Principles

- **Simplicity First**: Make every change as simple as possible. Impact minimal code.
- **No Laziness**: Find root causes. No temporary fixes. Senior developer standards.
- **Minimal Impact**: Changes should only touch what's necessary. Avoid introducing bugs.

---

## Project Overview

This is Spencer Flaherty's portfolio website - a collection of HTML pages designed to look like a retro terminal interface. The pages are standalone HTML documents with embedded CSS/JS.

**Canonical Reference:** `Pages/HTML/Automation.html` — This is the perfect example of how all pages should be structured.

---

## Project Structure

```
/
├── .claude/                     # Claude Code working directory
│   ├── CLAUDE.md                # This file - consolidated documentation
│   ├── settings.local.json      # Local settings
│   └── Style Guide/
│       └── Current/
│           └── style-guide-example.html  # Reference implementation with all features
├── .skills/                     # Skills system (legacy)
├── Pages/
│   ├── HTML/                    # All HTML page files (deployed to Squarespace)
│   │   ├── Automation.html      # CANONICAL EXAMPLE
│   │   ├── Home_WithImage.html
│   │   ├── About.html
│   │   ├── Media.html
│   │   ├── Paid Ads.html
│   │   ├── Reporting.html
│   │   ├── Resources.html
│   │   └── Websites.html
│   └── Content/                 # Organized content by page/project
│       ├── About/
│       │   └── About.md
│       ├── Automation/
│       │   ├── Automated Public Sector Prospecting Engine/
│       │   │   ├── Automation.md
│       │   │   ├── image-prompt.md
│       │   │   └── [generated images]
│       │   ├── Geospatial Prospecting Workflow/
│       │   │   ├── image-prompt.md
│       │   │   └── [generated images]
│       │   └── Intent-to-Sales Conversion Engine/
│       │       ├── image-prompt.md
│       │       └── [generated images]
│       ├── Home/
│       │   └── [hero images]
│       ├── Media/
│       │   └── Media.md
│       ├── Paid Ads/
│       │   └── Paid Ads.md
│       ├── Reporting/
│       │   └── Reporting.md
│       ├── Resources/
│       │   └── Resources.md
│       ├── Websites/
│       │   └── Websites.md
│       └── Z-Site-Wide/         # Shared assets and templates
│           ├── master-image-prompt-v2.md  # Image generation template
│           ├── Header Logo/     # Site logo variations
│           └── OG Image/        # Social media preview
├── Skills/                      # Skills directory
│   ├── portfolio-format.md
│   └── spencer-portfolio-skill-v2/
└── Archive/                     # Version history (V1-V9, v11, Testing)
```

### Content Organization Philosophy

The `Pages/Content/` directory mirrors the site structure with a folder for each page. Within page folders:

- **Top-level pages** (About, Media, etc.): Single markdown file per page
- **Multi-project pages** (Automation, etc.): Each project gets its own subdirectory containing:
  - Content markdown file
  - `image-prompt.md` - The exact prompt used to generate the project's visual
  - Generated image files (PNG, JPG, etc.)

This structure ensures all assets related to a specific portfolio piece live together.

---

## Site Pages

- **Home:** https://www.spencerflaherty.com
- **About:** https://www.spencerflaherty.com/about
- **Automation:** https://www.spencerflaherty.com/automation
- **Media:** https://www.spencerflaherty.com/media
- **Paid Ads:** https://www.spencerflaherty.com/paid-ads
- **Reporting:** https://www.spencerflaherty.com/reporting
- **Resources:** https://www.spencerflaherty.com/resources
- **Websites:** https://www.spencerflaherty.com/websites

---

## Architecture

### Single-File Components
Each page is a self-contained HTML file with embedded `<style>` and `<script>` blocks. No external CSS/JS files.

### Tech Stack
- **Font:** JetBrains Mono (weights: 400, 700) via Google Fonts
- **Animation:** Custom typing system (NOT Typed.js)
- **Theming:** CSS variables + localStorage
- **Format:** Full HTML documents (not Squarespace code blocks)

### Theming System
Two themes controlled via CSS variables and `body.classic-theme` class:
- **Cyberpunk** (default): Magenta (#ff00bb) and cyan (#00ffff) on dark purple
- **Classic**: White on black

Theme preference persists via `localStorage.getItem('theme')`.

### Custom Typing Animation (NOT Typed.js)
The site uses a **custom typing system** with two arrays:

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

### Navigation System
Terminal-style navigation using number input (0-7). Handled via keyboard events on desktop and hidden input field on mobile with `inputmode="numeric"`.

---

## Key Conventions

### Required CSS Reset
Every file must start with:
```css
* { margin: 0; padding: 0; box-sizing: border-box; }
```

**Why this is required:**
- Browsers apply default margins (typically 8px on `<body>`) and padding to elements
- Without the reset, you'll see unwanted spacing above/around the terminal window
- The reset ensures consistent rendering across all browsers
- `box-sizing: border-box` makes width/height calculations predictable

**CRITICAL**: This reset must appear FIRST in your `<style>` block, before any other CSS rules.

### Squarespace Container Overrides (CRITICAL)
Squarespace applies width constraints to code block containers that vary by page, causing inconsistent mobile rendering. ALL pages must include these overrides immediately after the CSS reset.

**Required CSS** (place after reset, before CSS variables):
```css
/* --- SQUARESPACE CONTAINER OVERRIDES --- */
/* Force full-width on mobile to prevent Squarespace from constraining the code block */
.sqs-block-content,
.sqs-code-container {
    width: 100% !important;
    max-width: 100% !important;
}
```

**Why this is required:**
- Without these overrides, Squarespace constrains `.sqs-code-container` to 330px on some pages vs 375px on others
- This creates wider magenta borders (~47px) instead of the intended 25px horizontal padding
- The `!important` flag is necessary to override Squarespace's default styles
- Ensures consistent full-width rendering across all pages at mobile breakpoints

### Viewport Meta Tag (CRITICAL)
ALL pages must include the viewport meta tag for proper mobile rendering.

**Required meta tag** (in `<head>`, immediately after charset):
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

**Why this is required:**
- Without this tag, mobile browsers render at desktop width (980px) and scale down
- Causes the terminal window to appear narrower with wide magenta borders
- Forces browsers to use device width and prevent user scaling issues

### Window Container Requirement
Always wrap `.window-frame` in `.window-container` with horizontal padding to prevent glow effect clipping.

**Required CSS:**
```css
.window-container {
    padding: 0 25px; /* 0 top/bottom, 25px left/right */
}
```

### Mobile Responsive (CRITICAL)
**ALL PAGES** must keep horizontal padding but NO vertical padding.

**DO NOT add this mobile media query to ANY page:**
```css
/* WRONG - DO NOT USE */
@media (max-width: 600px) {
    .window-container {
        padding: 0;
    }
    .window-frame {
        border-radius: 0;
        border-left: none;
        border-right: none;
    }
}
```

**The window container uses `padding: 0 25px` on all screen sizes:**
- **Left/Right: 25px** — Prevents glow effect clipping on sides
- **Top/Bottom: 0px** — Removes gap at top/bottom of viewport

### Terminal Loading State
Use `.terminal-loading` class on `.terminal-screen` initially to prevent background flash on mobile. Remove it when typing begins.

```css
.terminal-screen.terminal-loading {
    min-height: 0;
    padding: 0;
    height: 0;
    overflow: hidden;
}
```

### Title Consistency
Window title (e.g., `/Automation/`) must match the page's H1 (e.g., `AUTOMATION`).

### Heading Hierarchy
- **H1**: One per page, matches window title, 24px magenta uppercase
- **H2**: Section headings with `//` prefix, 18px magenta (e.g., `// Outbound Lead Generation`)
- **H3**: Dropdown titles, 16px cyan bold (inside dropdown toggle)

**CRITICAL**: Both H1 and H2 elements must have `margin: 0` to eliminate default browser spacing.

**Required CSS:**
```css
.terminal-screen h1 {
    /* existing styles */
    margin: 0;  /* REQUIRED */
    /* remaining styles */
}

.terminal-screen h2 {
    /* existing styles */
    margin: 0;  /* REQUIRED */
    /* remaining styles */
}
```

**Why this is required:**
- Browsers apply default vertical margins to heading elements (typically 16-20px top/bottom)
- Without `margin: 0`, unwanted spacing appears between sections
- Ensures consistent, tight spacing throughout the terminal interface

### YouTube Embeds
Always use `youtube-nocookie.com` with `?rel=0&modestbranding=1` and wrap in `.media-dialup-container`.

### Images and Media (CRITICAL)
**ALL images must be wrapped in `.media-dialup-container`** for the retro dial-up line-by-line reveal animation.

**Required CSS for all pages:**
```css
.dialup-reveal {
    clip-path: inset(0 0 100% 0);
    animation: dialupReveal 1.5s steps(30) forwards;
}

@keyframes dialupReveal {
    0% { clip-path: inset(0 0 100% 0); }
    100% { clip-path: inset(0 0 0% 0); }
}

.media-dialup-container {
    position: relative;
    overflow: hidden;
    margin: 10px 0;  /* Always 10px margin, no padding */
}

.media-dialup-container img {
    width: 100%;
    max-width: 100%;
    height: auto;
    display: block;
    border-radius: 5px;
}
```

**Required JavaScript in inject segment handler:**
```javascript
} else if (segment.type === 'inject') {
    const temp = document.createElement('div');
    temp.innerHTML = segment.html;
    while (temp.firstChild) {
        terminalText.appendChild(temp.firstChild);
    }
    // Apply dialup-reveal animation to images - REQUIRED
    const images = terminalText.querySelectorAll('.media-dialup-container img');
    images.forEach(function(img) {
        if (img.complete) {
            img.classList.add('dialup-reveal');
        } else {
            img.addEventListener('load', function() {
                img.classList.add('dialup-reveal');
            });
        }
    });
    processNextSegment();
}
```

**Adding images via inject:**
```javascript
{ type: 'inject', html: "<div class='media-dialup-container'><img src='URL' alt='Description'></div>" }
```

### Line Breaks / Horizontal Separators
Use CSS-based line breaks via inject segment:

```javascript
{ type: 'inject', html: "<span class='line-break'></span>" }
```

```css
.line-break {
    display: block;
    width: 100%;
    height: 1px;
    background: var(--text-color);
    margin: 25px 0;
}
```

**DO NOT** use character-based separators like `────────`.

### Personal Contact Information
NEVER include personal contact information (email addresses, phone numbers) in page content. Use LinkedIn or other professional profile links only.

### Terminal Screen HTML Whitespace
The `.terminal-screen` element uses `white-space: pre-wrap`, so any whitespace/newlines in the HTML will render visibly. Keep all terminal-screen content on a single line:

```html
<!-- CORRECT -->
<div class="terminal-screen terminal-loading"><span id="terminal-text"></span>...</div>

<!-- WRONG -->
<div class="terminal-screen terminal-loading">
    <span id="terminal-text"></span>
    ...
</div>
```

---

## Content Segments Example

```javascript
const contentSegments = [
    { type: 'type', content: "root@spencer-portfolio:~/automation\n" },
    { type: 'element', tag: 'span', className: 'prompt-arrow', text: '$' },
    { type: 'type', content: " ./display_projects\n\n" },  // CRITICAL: Two \n for blank line before H1
    { type: 'element', tag: 'h1', className: 'h1', text: 'AUTOMATION' },
    { type: 'element', tag: 'h2', className: 'h2', text: '// Outbound Lead Generation' },
    { type: 'dropdown', text: '[+]  Geospatial Prospecting Workflow' },
    { type: 'inject', html: "<span class='line-break'></span>" },
    // ... more sections
    // Navigation section at end
    { type: 'element', tag: 'h2', className: 'h2', text: 'Navigate' },
    { type: 'navlink', href: 'https://www.spencerflaherty.com', text: '[0]  ~Root/ (Home)' },
    // ... nav items [1-7]
];
```

**CRITICAL**: The display command must end with `\n\n` (two newline characters) to create a blank line between the command and the page title (H1). This provides visual breathing room and matches terminal UX conventions.

---

## Dropdown Content Example

**CRITICAL CONTENT ORDER**: All dropdown entries MUST follow this exact structure:
1. **Image/Media first** (wrapped in `.media-dialup-container`)
2. **Description text** (the project description)
3. **"The Stack" section** (with proper spacing)

```javascript
const dropdownBodyContent = [
    // CORRECT ORDER: Image → Description → Stack
    "<div class='media-dialup-container'><img src='URL' alt='Project Name'></div>" +
    "Description text explaining what this project does and why it matters." +
    "<br><br><strong>The Stack:</strong><br>• Tool 1<br>• Tool 2<br>• Tool 3",

    // Another example with video
    "<div class='media-dialup-container'><iframe src='youtube-nocookie...'></iframe></div>" +
    "Video description text." +
    "<br><br><strong>The Stack:</strong><br>• Camera<br>• Editing Software",
];
```

**Why this order matters:**
- Images load first and are immediately visible when dropdown opens
- Creates better visual hierarchy (visual → text → technical details)
- Consistent user experience across all portfolio pages

### "The Stack" Section Format
Each dropdown entry should include a "The Stack" section listing the tools/technologies used. Use bullet points with the `•` character:

**CRITICAL**: Always use `<br><br>` (two line breaks) before "The Stack" to create visual separation.

```javascript
"Description of the project." +
"<br><br><strong>The Stack:</strong><br>• Tool 1<br>• Tool 2<br>• Tool 3"
```

Group related items on the same line when appropriate (e.g., `• Shure Mics, Rodecaster`).

### Dropdown Spacing (CSS)
Spacing between open dropdowns and subsequent content is handled via CSS, **not** trailing `<br>` tags. The CSS rule adds margin when a dropdown is expanded:

```css
.dropdown.open {
    margin-bottom: 15px;
}
```

This ensures the spacing appears outside the bordered dropdown content area.

---

## File Relationships

The Automation page (`Pages/HTML/Automation.html`) is the canonical reference. When creating new pages:
1. Copy the structure from `Automation.html`
2. Modify the `contentSegments` array for page-specific content
3. Modify the `dropdownBodyContent` array for dropdown content
4. Update the window title and H1 to match

Archive versions (V1-V9) are for reference only.

---

## Navigation Map

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

## SEO Meta Tags

All pages include proper SEO meta tags. Here are the current titles and descriptions:

### Home Page
**Title:** `Spencer Flaherty | Marketing, Media & AI Portfolio`
**Description:** `Baltimore-based marketer specializing in AI automation, video production, and paid ads. Explore work spanning marketing engineering, media, and web design.`

### About Page
**Title:** `About Spencer Flaherty | Marketing & AI Engineer`
**Description:** `15 years creating at the intersection of sales, media, and AI. Baltimore-based marketing professional with expertise in automation, video, and engineering.`

### Automation Page
**Title:** `Marketing Automation Portfolio | Spencer Flaherty`
**Description:** `AI-powered marketing automation: geospatial prospecting, RAG-based personalization, intent conversion engines, and custom CRM tools built to scale lead generation.`

### Media Page
**Title:** `Video Production & Media Portfolio | Spencer Flaherty`
**Description:** `Commercial video production, podcast studio builds, and documentary filmmaking. From case studies to AI-enhanced archival projects in Baltimore and beyond.`

### Paid Ads Page
**Title:** `Paid Advertising Campaigns Portfolio | Spencer Flaherty`
**Description:** `Facebook and LinkedIn ad campaigns for EV infrastructure, electrical services, and eCommerce. AI-generated creative, conversion optimization, and lead gen.`

### Reporting Page
**Title:** `BI Dashboards & Analytics Portfolio | Spencer Flaherty`
**Description:** `Custom attribution models, Power BI dashboards, and automated reporting systems. Multi-touch attribution, pipeline tracking, and customer operations tools.`

### Resources Page
**Title:** `Content Marketing & SEO Portfolio | Spencer Flaherty`
**Description:** `Whitepapers, training docs, and SEO-driven blog content. Built crawlable PDFs cited by AI, managed 300%+ organic growth, and automated sales enablement tools.`

### Websites Page
**Title:** `Web Design & Development Portfolio | Spencer Flaherty`
**Description:** `Custom web projects on Squarespace, WordPress, and HubSpot. Terminal-style portfolio site, local business SEO builds, and agency redesigns that triple traffic.`

### Social Media Tags
All pages share the same Open Graph image:
```
https://images.squarespace-cdn.com/content/67758c2dcfaa0679c00768d7/4d19da35-4186-4b41-826b-b67ce7c95d71/OG+Image.png?content-type=image%2Fpng
```

**Format used across all pages:**
- `<meta property="og:title">` - Matches the page title
- `<meta property="og:description">` - Matches the meta description
- `<meta property="og:type" content="website">`
- `<meta property="og:url">` - Specific to each page
- `<meta property="og:image">` - Shared OG image
- `<meta name="twitter:card" content="summary_large_image">`
- `<meta name="twitter:title">` - Matches the page title
- `<meta name="twitter:description">` - Matches the meta description
- `<meta name="twitter:image">` - Shared OG image

---

## Outstanding Tasks

### High Priority
- [x] Add "The Stack" sections to each item on the Automation page (use bulleted format)
- [x] **Create image prompts for all projects** — All 31 projects now have complete image-prompt.md files (Automation: 8, Media: 5, Paid Ads: 4, Reporting: 3, Resources: 5, Websites: 6)
- [x] **Generate images for Automation page** — All 8 automation project images created and added to HTML
- [x] **Update Automation.html with images** — Synced contentSegments and dropdownBodyContent with current .md structure, added all image URLs
- [ ] **Image-specific and template-level formatting refinements** — Address any visual/layout issues with images and overall template structure
- [ ] **Generate images for remaining pages** — Media, Paid Ads, Reporting, Resources, Websites (23 remaining)
- [ ] Add Year to all pieces
- [ ] **Add descriptive image alt text** — All images need SEO-optimized alt attributes describing the content
- [ ] **Websites page:** Make all entries have actual URL as H3, add button links
- [ ] **Update remaining web pages with HTML files and confirm SEO compliance**

### SEO & Accessibility
- [x] **Convert CSS heading classes to semantic HTML tags** — Created versions with `<h1>`, `<h2>`, `<h3>` tags
- [x] **Add meta descriptions** — All pages complete
- [x] **Add OG descriptions** — For social media previews

### Development & Tooling
- [ ] **Create Portfolio Management Skill** — Build a comprehensive Claude Code skill for this project
  - **Primary skill**: Portfolio manager that references this repo and CLAUDE.md
  - **Subskill: Write Entries** — Help write new dropdown entries with proper formatting
    - Generate "The Stack" sections with bullet formatting
    - Ensure proper HTML structure for dropdowns
    - Add media containers with dialup-reveal animation
    - Maintain voice and style consistency
  - **Subskill: Validate Format** — Check pages against canonical reference (Automation.html)
    - Verify CSS reset is first in style block
    - Check window container has `padding: 0 25px` (no mobile media query)
    - Ensure all images wrapped in `.media-dialup-container`
    - Validate heading hierarchy (one H1, H2 with `//` prefix, H3 in dropdowns)
    - Check terminal screen HTML is single-line (no whitespace)
    - Verify SEO meta tags present and properly formatted
    - Ensure no personal contact info (email, phone) in content
    - Validate navigation map has all 8 URLs
    - Check dropdownBodyContent array matches number of dropdowns
  - **Subskill: Manage Project** — General project management and updates
    - Update Page Status table in CLAUDE.md
    - Generate new pages from Automation.html template
    - Sync content between Content/*.md and HTML/*.html files
    - Track outstanding tasks and mark completed items
    - Validate all pages use semantic HTML tags (not just className)
  - **Goal**: Enable jumping into new Claude Code instance and immediately resume work with full context

### Final Polish (Do Last)
- [ ] **Non-terminal version for accessibility** — For visitors who hate the terminal aesthetic

### Hosting Migration & Architecture Refactor (PLANNED - NOT IMPLEMENTED)
**Current Pain Point:** Deployment Method A (Squarespace Code Blocks)
- Manual copy/paste of HTML into Squarespace after each change
- $300/year hosting cost
- Duplicate CSS/JS across all pages (3000+ lines per file)
- Error-prone manual deployment process

**Proposed Solution:** Git-Based Auto-Deployment + Theme System
- **Cost Savings:** $300/year → $0/year
- **Deployment:** `git push` = instant deploy (30 seconds)
- **Maintenance:** 10x faster updates

#### Phase 1: Hosting Migration (FREE alternatives)
**Option 1: GitHub Pages** (Recommended)
- Cost: $0/year
- Custom domain support (spencerflaherty.com already owned)
- Auto-deploy on `git push` to main branch
- HTTPS automatic
- Setup time: ~5 minutes

**Option 2: Netlify**
- Cost: $0/year
- Faster builds, better analytics dashboard
- Same git-based deployment

**Option 3: Cloudflare Pages**
- Cost: $0/year
- Fastest CDN, unlimited bandwidth
- Same git-based deployment

**Deployment Workflow:**
1. User requests change
2. Claude modifies file in local repo
3. User says "push it live"
4. Claude runs: `git add . && git commit -m "Update" && git push`
5. Site auto-deploys in ~30 seconds

#### Phase 2: Theme System Refactor (DRY Architecture)
**Current Structure (Repetitive):**
```
Pages/HTML/Automation.html  (3000+ lines, all CSS/JS duplicated)
Pages/HTML/Media.html       (3000+ lines, all CSS/JS duplicated)
Pages/HTML/Websites.html    (3000+ lines, all CSS/JS duplicated)
```

**New Structure (DRY - Don't Repeat Yourself):**
```
/theme/
  ├── template.html         # Master template with all CSS/JS
  ├── styles.css            # Shared styles
  └── terminal.js           # Typing animation engine

/pages/
  ├── automation.json       # Just contentSegments + dropdownBodyContent
  ├── media.json            # Just contentSegments + dropdownBodyContent
  └── websites.json         # Just contentSegments + dropdownBodyContent

/build/
  └── build.js              # Script that injects page data into template

/dist/                      # Generated HTML files (these get deployed)
  ├── index.html
  ├── automation.html
  ├── media.html
  └── websites.html
```

**Benefits:**
- Update navigation URLs once (not 8 times)
- CSS/theme changes propagate to all pages instantly
- Page updates only require editing JSON (no HTML/JS knowledge needed)
- Build script generates final HTML files
- Single source of truth for all shared code

**Update Workflow Example:**
```bash
# Add new project to Automation page
# Claude edits pages/automation.json (just the content)
$ npm run build              # Generates dist/automation.html
$ git push                   # Auto-deploys to live site
```

**Implementation Steps:**
1. Set up GitHub Pages hosting (5 min)
   - Create deployment workflow
   - Connect custom domain
   - Test deployment
2. Refactor to theme system (1-2 hours)
   - Extract shared template from Automation.html
   - Convert pages to JSON config files
   - Create build script (Node.js)
   - Test all pages work identically
3. Enable one-command deployment
   - Create deployment script: `./deploy.sh "Updated automation page"`
   - Document workflow for future reference

**Notes:**
- Total setup time: ~2 hours
- Ongoing updates: 10x faster than current manual process
- Makes site portable (easy to migrate hosts in future)
- User only edits JSON files, never touches HTML/CSS/JS again

### Future Ideas (Long-Term)
- [ ] **Non-terminal version for accessibility** — For visitors who hate the terminal aesthetic (convert theme to support multiple visual styles)

---

## Page Status

| Page | Status | Current File | Notes |
|------|--------|--------------|-------|
| Home | Complete | `Pages/HTML/Home_WithImage.html` | Updated to custom segment system with full guidelines compliance. |
| About | Complete | `Pages/HTML/About.html` | Migrated to custom segment system. |
| Automation | Complete | `Pages/HTML/Automation.html` | **Canonical reference** - all pages should match this structure. |
| Media | Complete | `Pages/HTML/Media.html` | Migrated to custom segment system. |
| Paid Ads | Complete | `Pages/HTML/Paid Ads.html` | Migrated to custom segment system. |
| Reporting | Complete | `Pages/HTML/Reporting.html` | Migrated to custom segment system. |
| Resources | Complete | `Pages/HTML/Resources.html` | Migrated to custom segment system. |
| Websites | Complete | `Pages/HTML/Websites.html` | Migrated to custom segment system. |

---

## Image Generation System

### Base Image Prompt Template

All portfolio project images use this standardized template:

```
Create a monochromatic terminal-style illustration using magenta #F303BB on transparent background. White #FFFFFF may be used sparingly for small connectors or accents only.

VISUAL STYLE:
CRITICAL: This must look like a low-resolution bitmap from a 1985 CRT terminal display. Every edge should show visible chunky pixels.

- Low-resolution Sixel terminal graphic — coarse pixel grid visible on all edges. The entire image should have a blocky, pixelated appearance.
- Built from simple geometric primitives: rectangles, triangles, circles, lines
- Flat block fills and LARGE-GRID dithered shading. Dithering MUST use big visible checkerboard blocks (8-10 pixels per block minimum), NOT fine dot patterns or small stippling. Most areas should be solid flat fill with NO shading at all.
- ABSOLUTELY NO fine detail, smooth curves, anti-aliasing, or gradients
- Think: diagram on a 1985 terminal, not an icon set or infographic. This should look rough, blocky, and pixelated like old computer graphics.

ICON RULES:
- Each icon is built from 2-4 simple geometric parts maximum
- Every icon should be recognizable by silhouette alone
- No rockets, no targets, no lightbulbs, no handshakes, no gears, no magnifying glasses — no overused business/tech clip-art
- A person with no context should be able to understand what each shape represents

IMAGE RULES:
- All icons should feel equally weighted and prominent — no icon should dominate or shrink relative to others
- At least 40% of the image is empty background
- No text, labels, or letters anywhere in the image
- Wide landscape format

PORTFOLIO SECTION:
[PASTE PORTFOLIO SECTION HERE]

IMAGE DESCRIPTION:
[DESCRIBE THE IMAGE HERE]

---

CRITICAL RENDERING REQUIREMENTS:
- **Coarser dithering** — Use BIG VISIBLE PIXEL BLOCKS only (minimum 8x8 pixel checkerboard squares). NO fine stippling or small dots. More areas of solid flat fill instead of dithering.
- **Rougher and blockier** — Visible pixel grid on every edge of every shape. This should look like it was rendered on a CRT monitor in 1985, NOT designed in Illustrator or modern vector software.
- **Chunky pixels everywhere** — The entire image should have a low-resolution bitmap appearance. Every line, every edge, every curve should show visible stair-stepping and chunky pixels.
- **Minimize smooth areas** — If something looks smooth or polished, make it blockier and more pixelated. This is intentionally crude retro computer graphics.
```

**Usage Workflow:**
1. Copy the base prompt above
2. Replace `[PASTE PORTFOLIO SECTION HERE]` with the project description
3. Replace `[DESCRIBE THE IMAGE HERE]` with specific icon/layout instructions
4. Generate image using AI image generation tool
5. Save the complete prompt as `image-prompt.md` in the project folder
6. Save generated images to the same project folder

### Image Prompt Storage Convention

**File Naming:** `image-prompt.md`

**Location:** `Pages/Content/[Page Name]/[Project Name]/image-prompt.md`

**Purpose:**
- Maintain consistency across regenerations
- Document the exact specifications used
- Enable quick iterations or variations
- Preserve institutional knowledge
- Keep all project assets together

**Each `image-prompt.md` file should include:**
1. **Color specifications** - Exact hex codes for magenta (#F303BB) and white (#FFFFFF) accents on transparent background
2. **Visual style rules** - Sixel terminal aesthetic, geometric primitives, dithering guidelines
3. **Icon rules** - Complexity limits (2-4 parts max), silhouette recognition, banned clichés
4. **Image rules** - Layout balance, background space (40%+ empty), no text, wide landscape format
5. **Portfolio section context** - The project name and description this image represents
6. **Detailed image description** - Step-by-step breakdown of each icon/element in the composition

**Examples:**
- `Pages/Content/Automation/Geospatial Prospecting Workflow/image-prompt.md`
- `Pages/Content/Automation/Intent-to-Sales Conversion Engine/image-prompt.md`
- `Pages/Content/Automation/Automated Public Sector Prospecting Engine/image-prompt.md`

**When creating new images:**
1. Start with the base prompt template above
2. Customize with project-specific context and image description
3. Generate the image using AI image generation tool
4. Save the complete prompt as `image-prompt.md` in the project's folder
5. Save generated images (PNG, JPG, etc.) to the same project folder
6. All project assets (content, prompt, images) live together in one directory

### Current Image Prompt Coverage

**All 31 portfolio projects have image prompts (✅ Complete)**

#### Automation (8 projects)
- ✅ Geospatial Prospecting
- ✅ Gov-Procurement Pipeline
- ✅ Arcadia Run Outreach Campaign
- ✅ Intent Conversion Engine
- ✅ Paid Acquisition Engine
- ✅ RAG Reactivation Engine
- ✅ Custom Internal Tools
- ✅ EV Feasibility Engine

#### Media (5 projects)
- ✅ eCommerce Masters Podcast
- ✅ Industrial Job Site Documentation
- ✅ Station House x Xeal Case Study
- ✅ Bowie MD 50 Years In The Making
- ✅ Canton Baltimore

#### Paid Ads (4 projects)
- ✅ Cooperative Purchasing Explainer
- ✅ Automated ROI Report Funnel
- ✅ $20 CPL Photo Campaign
- ✅ B2B Retainer Acquisition

#### Reporting (3 projects)
- ✅ Custom Attribution System
- ✅ Pipeline & Churn Dashboards
- ✅ Automated Review Request Pipeline

#### Resources (5 projects)
- ✅ Process Documentation System
- ✅ Agentic Workflow Automation
- ✅ Gated Lead Magnets
- ✅ Groove Commerce Blog
- ✅ Blue Whale EV Blog

#### Websites (6 projects)
- ✅ SpencerFlaherty.com
- ✅ Auto International
- ✅ HVAC Company Site
- ✅ AnnieLauk.com
- ✅ Groove Commerce
- ✅ CriticalPeake.com

### Writing Effective Image Descriptions

Key principles for creating effective image descriptions:

- **Describe shapes, not concepts** - "Circle with grid lines" not "global platform." If you can't describe it as geometry, the model will guess and it'll look generic.
- **State how things connect** - Arrows, lines, proximity, containment, overlap — say what links the elements and in what direction.
- **Call out scale** - If everything should be the same size, say so. If one thing should be bigger, say so. The model defaults to making the first thing biggest.
- **Keep it sparse** - The fewer icons, the better each one reads. 2-4 elements is the sweet spot. If you need more, consider whether some can be grouped into a single composite icon.

#### Example Descriptions

**For a left-to-right workflow:**
```
3 icon groups arranged left to right, all the same vertical height. Tiny white chevrons between them as connectors.
LEFT: A globe with grid lines and a map pin on its surface.
CENTER: A flat-roofed commercial building with a grid of squares below it representing a parking lot.
RIGHT: A person silhouette with an envelope next to them showing horizontal lines inside.
```

**For a single hero icon:**
```
A single large icon centered in the frame taking up about 50% of the image area. A terminal monitor shape (rounded rectangle) with a simple bar chart displayed on screen. Dithered shading on the monitor body, solid fill on the screen content.
```

**For a cyclical process:**
```
3 icons arranged in a triangle formation. Simple line arrows connecting them in a clockwise loop.
TOP: A document shape (rectangle with a folded corner).
BOTTOM LEFT: A brain shape (simple rounded blob with a line down the middle).
BOTTOM RIGHT: An envelope with lines inside.
All three the same size.
```

**For a before/after or transformation:**
```
2 icons side by side, same height, with a single white arrow between them.
LEFT: A messy cluster of small scattered squares — chaotic, overlapping, different sizes.
RIGHT: The same number of squares but neatly arranged in a clean grid formation.
```

### Troubleshooting Modifiers

Paste any of these at the end of your prompt if needed:

- **Too busy:** `Simplify further. Fewer geometric parts per icon. More empty space between everything.`
- **Icons too small:** `Make all icons larger and more prominent. They should feel like they fill the frame.`
- **Dithering too fine:** `Coarser dithering — big visible pixel blocks only. More areas of solid flat fill.`
- **Model added text:** `ABSOLUTELY NO TEXT of any kind. No labels, letters, numbers, or words. Only geometric shapes.`
- **Too polished/vector-looking:** `Rougher and blockier. Visible pixel grid on every edge. This should look like it was rendered on a CRT monitor, not designed in Illustrator.`
- **Icons not balanced:** `All icons must be the same visual weight and vertical scale. No icon should be noticeably larger or smaller than the others.`

---

## Automated Image Prompt Creation Workflow

### When User Says: "Create an image prompt for [project name]"

**Claude Code should follow this automated workflow:**

#### Step 1: Locate the Page Content File
- Identify which page category the project belongs to (Automation, Media, Paid Ads, etc.)
- Read the corresponding `.md` file from `Pages/Content/[Page Name]/[Page Name].md`
- Example: For automation projects, read `Pages/Content/Automation/Automation.md`

#### Step 2: Find the Project Description
- Search the `.md` file for the project name or section
- Extract the full project description and "The Stack" section
- This becomes the `PORTFOLIO SECTION:` content in the image prompt

#### Step 3: Get Image Description from User
- If user provided an image description in their request, use it
- If not, ask user: "What should this image show? Describe the icons, layout, and flow."
- Follow the "Writing Effective Image Descriptions" principles in the Image Generation System section

#### Step 4: Generate Complete Prompt
- Copy the base prompt structure from the "Base Image Prompt Template" section above
- Fill in the sections:
  - **VISUAL STYLE:** Copy from base template (magenta #F303BB on transparent background, etc.)
  - **ICON RULES:** Copy from base template
  - **IMAGE RULES:** Copy from base template
  - **PORTFOLIO SECTION:** Insert the project description from the .md file
  - **IMAGE DESCRIPTION:** Insert the user's image description or what they provided

#### Step 5: Create Project Folder (if needed)
- Check if folder exists at `Pages/Content/[Page Name]/[Project Name]/`
- If not, create it using the exact project name with proper capitalization and spaces
- Folder naming convention: Match the project name exactly as it appears in the content file

#### Step 6: Save the Prompt
- Write the complete prompt to `Pages/Content/[Page Name]/[Project Name]/image-prompt.md`
- Use filename format: `# Image Prompt: [Project Name]` as the title
- Follow the format from existing prompts (see reference examples below)

#### Step 7: Confirm to User
- Confirm: "Created image prompt at `Pages/Content/[Page Name]/[Project Name]/image-prompt.md`"
- User can now use this prompt to generate images in their AI image tool

### Reference Examples

**Existing image prompts to use as templates:**
- `Pages/Content/Automation/RAG-Driven Lifecycle Personalization Engine/image-prompt.md`
- `Pages/Content/Automation/Custom Software Solutions/image-prompt.md`
- `Pages/Content/Automation/Geospatial Prospecting Workflow/image-prompt.md`

**Base template reference:**
- See "Base Image Prompt Template" section in this document

### Example User Request Handling

**User says:** "Create an image prompt for Geospatial Prospecting Workflow"

**Claude Code should:**
1. Read `Pages/Content/Automation/Automation.md`
2. Find the "Geospatial Prospecting" project section
3. Extract: Description + The Stack
4. Check if user provided image description (if not, ask for it)
5. Combine base template + project info + image description
6. Create/verify folder: `Pages/Content/Automation/Geospatial Prospecting Workflow/`
7. Write to: `Pages/Content/Automation/Geospatial Prospecting Workflow/image-prompt.md`
8. Confirm to user

**User says:** "Create an image prompt for Custom Software Solutions with a before/after showing frustrated employee then happy employee using the tool"

**Claude Code should:**
1. Read `Pages/Content/Automation/Automation.md`
2. Find "Custom Internal Tools" or similar section
3. Extract project description
4. Use user's provided description: "before/after showing frustrated employee then happy employee using the tool"
5. Expand this into a detailed geometric description following the "Writing Effective Image Descriptions" guidelines
6. Create complete prompt and save to `Pages/Content/Automation/Custom Software Solutions/image-prompt.md`

---

## SEO Notes

### Best Practices Applied
1. **Title Length:** All titles are under 60 characters for optimal display in search results
2. **Description Length:** All descriptions are under 160 characters for optimal display
3. **Keywords Included:** Each page includes relevant keywords (portfolio, Spencer Flaherty, specific expertise area)
4. **Unique Content:** Each page has unique title and description tailored to its content
5. **Brand Consistency:** "Spencer Flaherty" appears in all titles
6. **Location Signal:** "Baltimore" mentioned in Home and About pages
7. **Social Media Optimized:** All pages include Open Graph and Twitter Card meta tags

### Technical SEO Status
| Check | Status | Notes |
|-------|--------|-------|
| HTTPS | ✅ Pass | Site loads securely |
| Mobile responsive | ✅ Pass | Viewport configured, responsive design |
| Image alt text | ✅ Pass | All images have alt attributes |
| Structured data | ✅ Pass | JSON-LD scripts present |
| Meta descriptions | ✅ Pass | All pages have optimized descriptions |
| H1 tags | ✅ Pass | Semantic H1 elements on all pages |
| Canonical tags | ⚠️ Warning | Verify Squarespace settings |
| XML sitemap | ⚠️ Warning | Verify at /sitemap.xml |
| Page speed | ⚠️ Warning | Monitor typing animation impact on LCP |
| Core Web Vitals | ⚠️ Warning | Monitor JavaScript animation impact on INP |

---

Last Updated: 2026-02-01

**Recent Updates:**
- Created image prompts for all 31 portfolio projects (19 new prompts added)
- Complete coverage: Automation (8), Media (5), Paid Ads (4), Reporting (3), Resources (5), Websites (6)
- All prompts follow terminal-style design system (magenta #F303BB on transparent background)
- Added Automated Image Prompt Creation Workflow to documentation
