---
name: spencer-portfolio
description: |
  Master skill for Spencer Flaherty's terminal-styled portfolio website. Handles page generation, content writing, style enforcement, and documentation updates.

  TRIGGERS - Use this skill when:
  - Creating or editing portfolio HTML pages
  - Converting markdown content to terminal-styled HTML
  - Writing portfolio project descriptions
  - Checking/enforcing style guide compliance
  - Updating portfolio documentation
  - Working on spencerflaherty.com

  CAPABILITIES:
  - Generate complete HTML pages from markdown content files
  - Enforce terminal styling (cyberpunk theme, JetBrains Mono, typing animation)
  - Write portfolio entries in Spencer's voice (8th grade reading level, tight copy)
  - Convert .md content → custom segment system → complete .html pages
  - Update CLAUDE.md and documentation with learnings
---

# Spencer Portfolio Skill

Build and maintain Spencer Flaherty's terminal-styled portfolio website.

## First Steps (ALWAYS DO THESE)

When this skill is activated:

### 1. Read the Documentation
Before doing any work, read these files in order:

```
.claude/CLAUDE.md                          # Project overview, key conventions
Documentation/style-guide-documentation.md # Full style reference
Documentation/Portfolio To Do.md           # Current tasks and page status
```

### 2. Read the Canonical Example
The file `Pages/Automation/automation V1.html` is the **canonical reference** for how all pages should be structured. Read it before creating or modifying any pages.

### 3. Confirm Understanding
After reading documentation, confirm to the user what you understand about the current state of the project and what tasks are pending.

---

## Core Principle: Documentation-Driven Development

**All specific details live in the documentation folder, not this skill.**

This skill teaches *process and workflow*. The documentation teaches *specifics*.

Why this matters:
- Details change (colors, structure, conventions)
- Documentation gets updated each session
- This skill stays stable while docs evolve

---

## Documentation Update Loop (CRITICAL)

**After EVERY significant change, update the documentation:**

### Update Checklist
1. **`.claude/CLAUDE.md`** — Add new learnings, patterns, gotchas
2. **`Documentation/Portfolio To Do.md`** — Mark completed items, add new tasks, update page status table
3. **`Documentation/style-guide-documentation.md`** — Correct any outdated information

### Confirmation Requirement
After each documentation update, confirm to the user:
> "Updated [filename] with [brief description of changes]."

**This loop is non-negotiable** — documentation must always reflect current state.

---

## Workflow: Create or Update a Page

### Step 1: Read Current State
- Read `Documentation/Portfolio To Do.md` for page status
- Read the canonical example (`Pages/Automation/automation V1.html`)
- Read the source markdown if it exists: `Pages/{Category}/{Category}.md`

### Step 2: Generate HTML
Follow the structure in the canonical example:
- Use the custom segment system (NOT Typed.js)
- See `CLAUDE.md` for segment types and examples

### Step 3: Save and Confirm
- Write to `Pages/{Category}/{Category}.html` (or `_V2.html` for drafts)
- Confirm: "Created [filename]. Structure follows canonical reference."

### Step 4: Update Documentation
- Update `Portfolio To Do.md` page status table
- Confirm the update

---

## Workflow: Add New Portfolio Entry

### Step 1: Gather Information
Ask the user:
1. **Project name** — What should we call this?
2. **Measurable outcome** — Leads, revenue, conversion %, time saved?
3. **Problem solved** — What issue did this address?
4. **Your role** — Built solo, led team, contributed to?
5. **The Stack** — What tools/platforms were used?

### Step 2: Write the Entry
Follow content rules from `CLAUDE.md`:
- ONE sentence description (action verb + what + problem + outcome)
- 8th grade reading level
- Tight copy, no filler

### Step 3: Update Files
- Add entry to markdown source file
- Regenerate HTML
- Update documentation

---

## Style Enforcement

Before finalizing any HTML, verify against the checklist in `CLAUDE.md`:
- CSS reset present
- Terminal screen on single line
- Window title matches H1
- Line breaks use CSS class (not characters)
- YouTube embeds use youtube-nocookie.com
- No personal contact info
- Navigation section at end

When in doubt, compare against the canonical example.

---

## Communication Style

Throughout the conversation:
- **Confirm each major action** — "Done: Created Home_V2.html"
- **Confirm each documentation update** — "Updated Portfolio To Do.md with page status"
- **Ask before making assumptions** — If requirements are unclear, ask
- **Summarize at session end** — List all files created/modified and documentation updates made

---

## Quick Reference

| What | Where |
|------|-------|
| Project memory | `.claude/CLAUDE.md` |
| Style guide | `Documentation/style-guide-documentation.md` |
| Task tracking | `Documentation/Portfolio To Do.md` |
| Canonical example | `Pages/Automation/automation V1.html` |
| Page sources | `Pages/{Category}/{Category}.md` |
| Generated pages | `Pages/{Category}/{Category}.html` |
