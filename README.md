# my-pi-agent

Agentic coding tool package for Pi with extensions, prompt templates, and meta skills.

## Installation

### Development

```bash
git clone <repo-url>
cd my-pi-agent
npm install
```

### Pi agent install

Local path install (from another project):

```bash
pi install /absolute/path/to/my-pi-agent
# or
pi install ./relative/path/to/my-pi-agent
```

Project-local install (shared with the repo):

```bash
pi install -l /absolute/path/to/my-pi-agent
```

## Repository layout

- `skills/` - Meta skills for prompt/skill generation.
- `prompts/` - Prompt templates invoked via `/<name>`.
- `extensions/` - Pi extensions (Ollama web search + fetch).
- `themes/` - Reserved for custom themes (currently empty).

## Skills

| Skill         | Description                                                            |
| ------------- | ---------------------------------------------------------------------- |
| `meta-prompt` | Generate pi prompt templates with arguments, steps, and output format. |
| `meta-skill`  | Generate a pi skill (SKILL.md) from codebase patterns.                 |

## Prompt templates

| Command          | Description                                                                                     | File                       |
| ---------------- | ----------------------------------------------------------------------------------------------- | -------------------------- |
| `/build-plan`    | Execute a plan file phase by phase with test validation.                                        | `prompts/build-plan.md`    |
| `/extract-skill` | Extract a new skill from a codebase and generate a SKILL.md.                                    | `prompts/extract-skill.md` |
| `/init`          | Generate or update AGENTS.md with auto-detected project context.                                | `prompts/init.md`          |
| `/prime`         | Load context for a new agent session by analyzing codebase structure, documentation and README. | `prompts/prime.md`         |
| `/save-plan`     | Save implementation plan to `.agents/plans/` with standard template.                            | `prompts/save-plan.md`     |

## Extensions

| Extension              | Description                                                                                                                                                                    | File                                 |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------ |
| `active-skills-widget` | Displays the active skills list under the editor as comma-separated values, or `No skill loaded` when none are available.                                                      | `extensions/active-skills-widget.ts` |
| `web-search`           | Registers `ollama_web_search` and `ollama_web_fetch` tools that call the local MCP CLI via `uv run` (requires `OLLAMA_API_KEY`; optional `OLLAMA_WEB_SEARCH_SCRIPT` override). | `extensions/web-search.ts`           |
