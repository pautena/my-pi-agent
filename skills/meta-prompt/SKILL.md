---
name: meta-prompt
description: Prompt template patterns and structure for Pi prompts.
---

# Prompt Template Structure

- **Frontmatter**: `---` block with a single `description:` line.
- **Required sections** (in order):
  - `# Purpose`
  - `## Inputs`
  - `## Steps` (5+ steps, imperative)
  - `## Output Format`
  - `## Output Example`
  - `## Guardrails`
  - `## Usage Examples`

# Prompt Patterns

- **Arguments**: use `$1`, `$2`, `$3` for positional args; `$ARGUMENTS` for all args.
- **Context helpers**: use `!` for pre-exec bash context when helpful; reference files via `@path`.
- **Tone**: concise, action-oriented; clarify missing output format before generating files.
- **Completeness**: avoid minimal prompts; include examples and guardrails.

# Anti-Patterns

- Missing output example.
- Skipping guardrails or usage examples.
- Omitting inputs or argument placeholders.
