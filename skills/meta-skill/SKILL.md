---
name: meta-skill
description: Reference Agent Skills spec patterns and structure for SKILL.md files and skill folders.
---

# Purpose

Document the required structure and patterns for an Agent Skills-compatible skill, based on the Agent Skills specification.

# Skill Directory Structure

- A skill is a folder containing at minimum a `SKILL.md` file.
- Optional supporting directories:
  - `scripts/` for executable helpers
  - `references/` for detailed docs (e.g., `REFERENCE.md`, `FORMS.md`)
  - `assets/` for templates, images, data files

Example:

```
skill-name/
├── SKILL.md
├── scripts/
├── references/
└── assets/
```

# SKILL.md Format

`SKILL.md` must contain YAML frontmatter followed by Markdown instructions.

## Required Frontmatter

```
---
name: skill-name
description: A description of what this skill does and when to use it.
---
```

## Optional Frontmatter Fields

```
---
name: pdf-processing
description: Extract text and tables from PDFs; use when working with PDF documents.
license: Apache-2.0
compatibility: Requires git and network access
metadata:
  author: example-org
  version: "1.0"
allowed-tools: Bash(git:*) Read
---
```

## Field Constraints

- `name` (required)
  - 1–64 characters
  - lowercase letters, numbers, hyphens only
  - must match parent directory name
  - cannot start/end with `-` or contain `--`
- `description` (required)
  - 1–1024 characters
  - describes what the skill does and when to use it
- `license` (optional)
  - short identifier or bundled license file reference
- `compatibility` (optional)
  - 1–500 characters describing environment requirements
- `metadata` (optional)
  - key-value mapping for extra properties
- `allowed-tools` (optional)
  - space-delimited list of pre-approved tools (experimental)

# Body Content Patterns

- Use Markdown to provide actionable instructions.
- Recommended sections:
  - Step-by-step instructions
  - Inputs/outputs examples
  - Common edge cases
- Keep `SKILL.md` under ~500 lines; move deep detail to `references/`.

# Progressive Disclosure

1. **Metadata**: frontmatter (`name`, `description`) loaded at startup.
2. **Instructions**: body loaded when the skill is activated.
3. **Resources**: `scripts/`, `references/`, `assets/` loaded only when needed.

# File References

- Use relative paths from the skill root.
- Keep references one level deep.

Example:

```
See references/REFERENCE.md for details.
Run scripts/extract.py to perform extraction.
```

# Validation

- Validate skills with the reference tool:

```
skills-ref validate ./my-skill
```

# Spec Source

- https://agentskills.io/specification
