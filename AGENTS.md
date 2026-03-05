# AGENTS.md

## Project Overview

Agentic Pi package with extensions, prompts, and meta skills for authoring prompts/skills.

## Installation

```bash
npm install
```

## Commands

| Command                              | Definition                                               |
| ------------------------------------ | -------------------------------------------------------- |
| `npm install`                        | Install npm dependencies for this repo                   |
| `pi install /path/to/my-pi-agent`    | Register prompts/skills/extensions globally in Pi        |
| `pi install -l /path/to/my-pi-agent` | Register prompts/skills/extensions project-locally in Pi |

## Structure

```
.
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
├── skills/
│   ├── meta-prompt/
│   └── meta-skill/
├── themes/
└── README.md
```

## Extensions

| Extension              | Description                                                                                 | File                                    |
| ---------------------- | ------------------------------------------------------------------------------------------- | --------------------------------------- |
| `active-skills-widget` | Displays active skills list under the editor.                                               | `extensions/active-skills-widget/index.ts` |
| `web-search`           | `ollama_web_search` and `ollama_web_fetch` tools via Ollama API (requires `OLLAMA_API_KEY`). | `extensions/web-search/index.ts`           |

## Prompt Templates

| Command          | Description                                                        | File                       |
| ---------------- | ------------------------------------------------------------------- | -------------------------- |
| `/build-plan`    | Execute a plan file phase by phase with test validation.            | `prompts/build-plan.md`    |
| `/extract-skill` | Extract a new skill from a codebase and generate a SKILL.md.        | `prompts/extract-skill.md` |
| `/init`          | Generate or update AGENTS.md with auto-detected project context.    | `prompts/init.md`          |
| `/prime`         | Load context for a new agent session.                               | `prompts/prime.md`         |
| `/save-plan`     | Save implementation plan to `.agents/plans/` with standard template. | `prompts/save-plan.md`     |

## Skills

| Skill         | Description                                             | File                    |
| ------------- | ------------------------------------------------------- | ----------------------- |
| `meta-prompt` | Generate pi prompt templates with arguments and steps.  | `skills/meta-prompt/`   |
| `meta-skill`  | Generate a pi skill (SKILL.md) from codebase patterns. | `skills/meta-skill/`    |

## Extension Development

- All extensions must be located in the `extensions/` directory.
- When creating a new extension, place it at `extensions/<extension-name>/`.
- Each extension should follow the standard structure with an `index.ts` entry point.

## Notes

- See README.md for detailed documentation.
