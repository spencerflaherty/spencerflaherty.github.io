# Image Generation Guide

Complete guide to creating terminal-style portfolio images.

---

## Base Image Prompt Template

All portfolio project images use this standardized template:

```
Create a monochromatic terminal-style illustration using magenta #F303BB on transparent background. White #FFFFFF may be used sparingly for small connectors or accents only.

VISUAL STYLE:
CRITICAL: This must look like a low-resolution bitmap from a 1985 CRT terminal display. Every edge should show visible chunky pixels.

- Low-resolution Sixel terminal graphic — coarse pixel grid visible on all edges
- Built from simple geometric primitives: rectangles, triangles, circles, lines
- Flat block fills and LARGE-GRID dithered shading (8-10 pixel blocks minimum)
- ABSOLUTELY NO fine detail, smooth curves, anti-aliasing, or gradients
- Think: diagram on a 1985 terminal, not an icon set or infographic

ICON RULES:
- Each icon is built from 2-4 simple geometric parts maximum
- Every icon should be recognizable by silhouette alone
- No rockets, targets, lightbulbs, handshakes, gears, magnifying glasses
- A person should understand what each shape represents without context

IMAGE RULES:
- All icons equally weighted and prominent
- At least 40% of the image is empty background
- No text, labels, or letters anywhere
- Wide landscape format

PORTFOLIO SECTION:
[PASTE PORTFOLIO SECTION HERE]

IMAGE DESCRIPTION:
[DESCRIBE THE IMAGE HERE]

---

CRITICAL RENDERING REQUIREMENTS:
- **Coarser dithering** — BIG VISIBLE PIXEL BLOCKS only (minimum 8x8)
- **Rougher and blockier** — Visible pixel grid on every edge
- **Chunky pixels everywhere** — Low-resolution bitmap appearance
- **Minimize smooth areas** — Make it blockier and more pixelated
```

---

## Image Prompt Storage Convention

**File Naming:** `image-prompt.md`
**Location:** `Pages/Content/[Page Name]/[Project Name]/image-prompt.md`

**Each file should include:**
1. Color specifications (magenta #F303BB on transparent)
2. Visual style rules (Sixel terminal aesthetic, geometric primitives)
3. Icon rules (2-4 parts max, silhouette recognition, banned clichés)
4. Image rules (layout balance, 40%+ empty space, no text)
5. Portfolio section context (project description)
6. Detailed image description (icons, layout, flow)

---

## Writing Effective Image Descriptions

**Key principles:**
- **Describe shapes, not concepts** - "Circle with grid lines" not "global platform"
- **State how things connect** - Arrows, lines, proximity, containment
- **Call out scale** - If everything should be same size, say so
- **Keep it sparse** - 2-4 elements is the sweet spot

**Example:**
```
IMAGE DESCRIPTION:
Three equally-sized elements arranged horizontally:
1. Left: Rectangle with pin/marker icon inside
2. Center: Circular database symbol with layered rings
3. Right: Envelope shape with arrow coming out

Thin arrow lines connect left → center → right showing data flow.
```

---

## Troubleshooting Modifiers

Add these to prompt if needed:
- **Too busy:** `Simplify further. Fewer parts. More empty space.`
- **Icons too small:** `Make all icons larger and more prominent.`
- **Dithering too fine:** `Coarser dithering — big visible pixel blocks only.`
- **Model added text:** `ABSOLUTELY NO TEXT. Only geometric shapes.`
- **Too polished:** `Rougher and blockier. Visible pixel grid on every edge.`

---

## Automated Image Prompt Creation Workflow

**When User Says: "Create an image prompt for [project name]"**

**Claude Code should:**

1. **Locate the Page Content File**
   - Identify page category (Automation, Media, etc.)
   - Read `Pages/Content/[Page Name]/[Page Name].md`

2. **Find the Project Description**
   - Search file for project name/section
   - Extract full project description + "The Stack"
   - This becomes `PORTFOLIO SECTION:` in prompt

3. **Get Image Description from User**
   - If provided in request, use it
   - If not, ask: "What should this image show? Describe icons, layout, flow."
   - Follow "Writing Effective Image Descriptions" principles

4. **Generate Complete Prompt**
   - Copy base template structure
   - Fill in sections with project context and image description

5. **Create Project Folder** (if needed)
   - Check if `Pages/Content/[Page Name]/[Project Name]/` exists
   - Create using exact project name with proper capitalization/spaces

6. **Save the Prompt**
   - Write to `Pages/Content/[Page Name]/[Project Name]/image-prompt.md`
   - Use format: `# Image Prompt: [Project Name]` as title

7. **Confirm to User**
   - "Created image prompt at `[path]`"

---

## Current Image Prompt Coverage

**All 31 portfolio projects have image prompts (✅ Complete)**

- Automation: 8 projects ✅
- Media: 5 projects ✅
- Paid Ads: 4 projects ✅
- Reporting: 3 projects ✅
- Resources: 5 projects ✅
- Websites: 6 projects ✅

---

Last Updated: 2026-02-03
