---
description: Extract a new skill from a codebase and generate SKILL.md in the correct scope
---

Extract a new Pi skill from an existing codebase by analyzing patterns, summarizing findings, and writing a SKILL.md file.

## Input

- `/extract-skill <scope>` - scope: project | package | global
- `/extract-skill` - ask for scope and target paths

## Process

1. **Clarify scope + target**
   - Ask for target directory, file globs, or modules.
   - Confirm scope:
     - project: `.pi/skills/`
     - package: `skills/`
     - global: `~/.pi/agent/skills/`

2. **Extract patterns**
   - Read 5–10 representative files (core logic, tests, config).
   - Capture conventions: naming, layering, error handling, testing, dependencies.

3. **Summarize findings**
   - List patterns, conventions, edge cases.
   - Provide short abstracted snippets with source paths.
   - Ask for confirmation before writing files.

4. **Confirm skill name**
   - Suggest 2–3 names in `code-<domain>-<skill>` format.
   - Wait for user confirmation.

5. **Generate SKILL.md**
   - Include: Purpose, Core Capabilities, Instructions, Patterns, Conventions, Best Practices, Anti-Patterns, Complete Example.

6. **Write files**
   - Package scope: `skills/<domain>/<skill-name>/SKILL.md`
   - Project scope: `.pi/skills/<skill-name>/SKILL.md`
   - Global scope: `~/.pi/agent/skills/<skill-name>/SKILL.md`
   - Optional: `reference.md`, `examples.md`, `templates/`

## Rules

- Confirm before writing or editing files.
- Use kebab-case skill folder names.
- Avoid project-specific names in templates.
- Keep examples short and reusable.
