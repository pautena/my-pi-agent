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

- `.agents/skills/` - Skills for this project (testing patterns).
- `prompts/` - Prompt templates invoked via `/<name>`.
- `extensions/` - Pi extensions (download_webpage, ollama_web_search, ollama_web_fetch, active-skills-widget).
- `themes/` - Reserved for custom themes (currently empty).

## Skills

| Skill     | Description                                                                                           |
| --------- | ----------------------------------------------------------------------------------------------------- |
| `testing` | Write and run tests for Pi extensions using Vitest with reusable mock factories and coverage reports. |

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
| `download-webpage`     | Registers `download_webpage` tool that fetches a webpage directly and saves it to a file. Supports custom file paths and timeouts.                                             | `extensions/download-webpage.ts`     |

## Testing

This project uses [Vitest](https://vitest.dev/) for testing extensions. See the [testing skill](.agents/skills/testing/SKILL.md) for comprehensive documentation on:

- Running tests and coverage reports
- Writing tests with reusable mock factories
- Testing patterns for Pi extensions
- Code coverage goals and best practices

### Quick Start

```bash
# Run tests in watch mode
npm test

# Run tests once
npm run test:run

# Run tests with coverage
npm run test:coverage

# Run TypeScript type checking
npm run check:types
```

### Test Path Alias

Tests can use the `@tests/` path alias for importing test utilities:

```typescript
import { createMockExtensionAPI, createSuccessResponse } from "@tests/mocks";
```

**Note**: Type errors related to `@mariozechner/pi-coding-agent` are expected. This package provides types at runtime through the Pi agent, not as a local dependency.
