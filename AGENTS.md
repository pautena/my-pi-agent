# AGENTS.md

## Project Overview

Agentic Pi package with extensions, prompts, and skills.

## Installation

```bash
npm install
```

## Commands

| Command                              | Definition                                               |
| ------------------------------------ | -------------------------------------------------------- |
| `npm install`                        | Install npm dependencies for this repo                   |
| `npm test`                           | Run tests in watch mode                                  |
| `npm run test:run`                   | Run tests once                                           |
| `npm run test:coverage`              | Run tests with coverage report                           |
| `npm run lint`                       | Run linting and markdown checks                          |
| `npm run check:types`                | Run TypeScript type checking                             |
| `pi install /path/to/my-pi-agent`    | Register prompts/skills/extensions globally in Pi        |
| `pi install -l /path/to/my-pi-agent` | Register prompts/skills/extensions project-locally in Pi |

## Structure

```
.
├── .agents/
│   └── skills/              # Skills for this project
│       └── testing/
│           └── SKILL.md
├── extensions/
│   ├── active-skills-widget/
│   │   └── index.ts
│   └── web-search/
│       └── index.ts
├── prompts/
│   ├── build-plan.md
│   ├── extract-skill.md
│   ├── init.md
│   ├── prime.md
│   └── save-plan.md
├── tests/                   # Test suite (mirrors extensions structure)
│   ├── mocks/
│   ├── setup.ts
│   └── extensions/          # Extension tests
│       ├── active-skills-widget.test.ts
│       └── web-search.test.ts
├── themes/
└── README.md
```

## Extensions

| Extension              | Description                                                                                  | File                                       |
| ---------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------ |
| `active-skills-widget` | Displays active skills list under the editor.                                                | `extensions/active-skills-widget/index.ts` |
| `web-search`           | `ollama_web_search` and `ollama_web_fetch` tools via Ollama API (requires `OLLAMA_API_KEY`). | `extensions/web-search/index.ts`           |

## Prompt Templates

| Command          | Description                                                          | File                       |
| ---------------- | -------------------------------------------------------------------- | -------------------------- |
| `/build-plan`    | Execute a plan file phase by phase with test validation.             | `prompts/build-plan.md`    |
| `/extract-skill` | Extract a new skill from a codebase and generate a SKILL.md.         | `prompts/extract-skill.md` |
| `/init`          | Generate or update AGENTS.md with auto-detected project context.     | `prompts/init.md`          |
| `/prime`         | Load context for a new agent session.                                | `prompts/prime.md`         |
| `/save-plan`     | Save implementation plan to `.agents/plans/` with standard template. | `prompts/save-plan.md`     |

## Skills

| Skill     | Description                                                                                           | File                      |
| --------- | ----------------------------------------------------------------------------------------------------- | ------------------------- |
| `testing` | Write and run tests for Pi extensions using Vitest with reusable mock factories and coverage reports. | `.agents/skills/testing/` |

## Extension Development

- All extensions must be located in the `extensions/` directory.
- When creating a new extension, place it at `extensions/<extension-name>/`.
- Each extension should follow the standard structure with an `index.ts` entry point.
- Write tests for extensions using the mock factories from `@tests/mocks/`.
- Place tests in `tests/extensions/` to mirror the extensions structure.
- Use the `@tests/` path alias for importing test utilities (e.g., `import { createMockExtensionAPI } from "@tests/mocks"`).

## Running Tests

```bash
# Run tests in watch mode
npm test

# Run tests once
npm run test:run

# Run tests with coverage
npm run test:coverage
```

## Type Checking

Run TypeScript type checking:

```bash
npm run check:types
```

**Note**: Type errors related to `@mariozechner/pi-coding-agent` are expected. This package provides types at runtime through the Pi agent, not as a local dependency.

## Testing

- Test suite uses Vitest for testing extensions.
- Mock factories are available in `test/mocks/` for reuse.
- Global test setup in `test/setup.ts` handles environment variables.
- Generate coverage reports with `npm run test:coverage`.

## Notes

- See README.md for detailed documentation.
