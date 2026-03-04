# AGENTS.md

## Project Overview

Agentic Pi package with extensions, prompts, and meta skills for authoring prompts/skills.

## Installation

```bash
npm install
```

## Commands

| Command | Definition |
| --- | --- |
| `npm install` | Install npm dependencies for this repo |
| `pi install /path/to/my-pi-agent` | Register prompts/skills/extensions globally in Pi |
| `pi install -l /path/to/my-pi-agent` | Register prompts/skills/extensions project-locally in Pi |

## Structure

```
.
├── extensions/
├── prompts/
├── skills/
│   ├── meta-prompt/
│   └── meta-skill/
├── themes/
└── README.md
```

## Notes

- Extensions and prompts are listed in README.md.
