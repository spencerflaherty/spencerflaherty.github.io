# Portfolio Formatter

Format raw notes into polished portfolio entries for spencerflaherty.com.

## Arguments

This command requires three arguments:
- `$ARGUMENTS` should be provided as: `<input-file> | <H1-category> | <H2-subcategory>`

Example: `/portfolio-format Work/ColdIQ Outbound.md | Automation | Outbound Lead Gen`

## Instructions

You are a portfolio content formatter. Your job is to transform raw notes into polished, professional portfolio entries.

### Step 1: Validate Paths

1. The Obsidian vault is at: `/Users/spencerflaherty/My Drive/My Vault/`
2. The Portfolio folder is at: `/Users/spencerflaherty/My Drive/My Vault/Portfolio/`
3. Parse the arguments to extract:
   - Input file path (relative to vault root)
   - H1 category (the target .md file name, e.g., "Automation")
   - H2 subcategory (the section header, e.g., "Outbound Lead Gen")

4. Verify the Portfolio folder exists. If not, stop and tell the user: "Portfolio folder not found. Please create it at /Users/spencerflaherty/My Drive/My Vault/Portfolio/"

5. Verify the H1 file exists (e.g., `Portfolio/Automation.md`). If not, stop and tell the user which file is missing.

6. Valid H1 files are: Automation, Media, Paid Ads, Reporting, Resources, Websites
   - Navigation.md and To Do.md are NOT valid targets

7. Read the input file to get the raw notes.

### Step 2: Ask Clarifying Questions

Before formatting, ask the user these 5 questions (use AskUserQuestion tool):

1. **Measurable Outcome:** "What was the measurable outcome? (e.g., leads generated, revenue, conversion %, time saved)"

2. **Client/Context:** "Who was this for? (client name, employer, or personal project)"

3. **Problem Solved:** "What problem did this solve?"

4. **Your Role:** "What was your specific role? (built it solo, led a team, contributed to, etc.)"

5. **Unique Approach:** "What made this approach unique or innovative?"

### Step 3: Format the Content

Using the raw notes and clarifying answers, create a formatted entry following this exact structure:

```markdown
### {Project Name}
{Action verb} + {what you built} + {problem solved} + {outcome/metric}.

**The Stack:**
- {Component}: {Tool/Tech}
- {Component}: {Tool/Tech}
- {Component}: {Tool/Tech}
```

**Formatting Rules:**
- Project name should be punchy and descriptive (2-5 words)
- Opening paragraph: ONE sentence, starts with strong action verb (Architected, Engineered, Developed, Built, Designed, Created, Deployed, Automated, Orchestrated, Transformed, Packaged)
- Choose the action verb that most precisely describes the work
- The Stack: ~3 bullet points, format as "Component Type: Tool/Tech Name"
- NO separate Example or Results section — merge outcomes and examples directly into the opening paragraph
- Keep entries tight: H3, one paragraph, The Stack, done

**Writing Style (Spencer's Preferences):**
- 8th grade reading level—simple, clear, direct
- Keep it short. Tighter is better.
- Get the point across without jargon or filler
- Avoid naming specific clients/companies when the concept is more universal (e.g., say "property management group" not "Bozzuto")
- Only include technical details (like SEO/GEO) if they're actually relevant to the section's focus
- Did the work → made it look good → got results. That's the story.

### Step 4: Write to Portfolio File

1. Read the target H1 file (e.g., `Portfolio/Automation.md`)
2. Find the H2 section that matches the provided H2 subcategory (e.g., `## Outbound Lead Gen`)
3. Append the new formatted entry at the end of that H2 section (before the next `---` or `##`)
4. If the H2 section doesn't exist, ask the user if they want to create it
5. Write the updated file

### Step 5: Confirm

Show the user the formatted entry you added and confirm success.
