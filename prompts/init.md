---
description: Generate or update AGENTS.md with auto-detected project context
---

# Init

Generate or update AGENTS.md with auto-detected project context for agentic programming.

## Goal

**Generate as much information as possible.** This command exists to provide comprehensive context for AI agents working with the codebase.

**Critical rules:**

1. **Empty output is NOT allowed** - Every execution MUST produce content
2. **When in doubt, INCLUDE it** - If unsure whether to add or skip information, always add it
3. **More is better** - Verbose documentation is preferred over concise/minimal
4. **No skipping** - Do not skip sections because they seem "obvious" or "simple"
5. **Infer when needed** - If explicit info isn't available, make reasonable inferences and document them

Even for simple projects, generate meaningful content for each applicable section.

## Input

Optional argument: $ARGUMENTS

- `/init` - auto-detect everything
- `/init --force` - regenerate without preserving user content

## Context

Run these commands with the bash tool and use the outputs:

- `find . -maxdepth 2 \( -name "*.json" -o -name "*.toml" -o -name "*.mod" -o -name "*.xml" -o -name "Makefile" -o -name "justfile" -o -name "Gemfile" -o -name "Rakefile" -o -name "*.gradle" \) 2>/dev/null | head -30`
- `ls -d */ 2>/dev/null | grep -v -E "node_modules|__pycache__|\.git|dist|build|\.venv|venv|\.next|target" | head -15`
- `ls -d .github/workflows .gitlab-ci.yml Jenkinsfile 2>/dev/null`
- `ls .env* docker-compose*.yml 2>/dev/null | head -10`
- `ls .editorconfig .pre-commit-config.yaml .eslintrc* .prettierrc* ruff.toml .golangci.yml tsconfig.json mypy.ini pyrightconfig.json 2>/dev/null`
- `ls pytest.ini jest.config.* vitest.config.* .coveragerc 2>/dev/null`
- `ls -d .husky .git/hooks 2>/dev/null`
- `ls LICENSE* COPYING* 2>/dev/null`
- `ls package.json pyproject.toml go.mod Cargo.toml Makefile justfile pom.xml build.gradle Gemfile composer.json mix.exs CMakeLists.txt 2>/dev/null`
- `find . -mindepth 2 -maxdepth 4 \( -name "package.json" -o -name "pyproject.toml" -o -name "go.mod" -o -name "Cargo.toml" -o -name "Makefile" -o -name "pom.xml" \) -not -path "*/node_modules/*" -not -path "*/.venv/*" -not -path "*/target/*" -not -path "*/dist/*" -not -path "*/build/*" 2>/dev/null | head -20`

## Process

### 1. Detect and Document Projects

**Step 1: Check root for project files**

Look for these files in the root directory:
| File | Type |
|------|------|
| package.json | Node.js |
| pyproject.toml | Python |
| go.mod | Go |
| Cargo.toml | Rust |
| Makefile, justfile | Build system |
| pom.xml, build.gradle | Java |
| Gemfile | Ruby |
| composer.json | PHP |
| mix.exs | Elixir |
| CMakeLists.txt | C/C++ |

If any found → document root project using Steps 2-32 below.

**Step 2: Scan subdirs for sub-projects**

Search in subdirectories (max 3 levels, exclude node_modules, .venv, target, dist, build):

```bash
find . -mindepth 2 -maxdepth 4 \( -name "package.json" -o -name "pyproject.toml" -o -name "go.mod" -o -name "Cargo.toml" -o -name "Makefile" -o -name "pom.xml" \) -not -path "*/node_modules/*" -not -path "*/.venv/*" -not -path "*/target/*" -not -path "*/dist/*" -not -path "*/build/*"
```

For each file found → that directory is a sub-project. Document it in a Sub-projects section.

**Classification:**

- Root has project files only → single project (Coding Template)
- Root + sub-projects found → monorepo (Coding Template + Sub-projects section)
- Only sub-projects, no root → monorepo without root project
- No project files, 80%+ markdown → Documentation Template
- No project files, 80%+ binary → Asset Collection Template

### 2. Gather Project Info

**For Coding Projects:**

1. **README**: Read README.md for project description (first paragraph)

2. **Installation**: Detect setup commands:
   - package.json + package-lock.json → `npm install`
   - package.json + pnpm-lock.yaml → `pnpm install`
   - package.json + yarn.lock → `yarn`
   - pyproject.toml + uv.lock → `uv sync`
   - pyproject.toml + poetry.lock → `poetry install`
   - pyproject.toml (other) → `pip install -e .`
   - go.mod → `go mod download`
   - Cargo.toml → `cargo build`
   - Gemfile → `bundle install`
   - pom.xml → `mvn install`
   - build.gradle → `./gradlew build`
   - Makefile with `setup`/`install` target → `make setup`
   - .env.example exists → "Copy `.env.example` to `.env` and configure"

3. **Commands**: Extract, group by concept, and define each command.

   **Source files to parse:**
   | File | Format |
   |------|--------|
   | `Makefile` | target: deps → extract name, parse `#` comments above |
   | `justfile` | recipe format → extract name + description comment |
   | `package.json` | scripts object → key: command |
   | `pyproject.toml` | [tool.poetry.scripts] or [project.scripts] |
   | `Cargo.toml` | common: `cargo build`, `cargo test`, `cargo run` |
   | `go.mod` | common: `go build`, `go test`, `go run` |
   | `composer.json` | scripts object |
   | `Rakefile` | rake tasks |
   | `deno.json` | tasks object |
   | `bun.toml` | scripts |

   **Group commands by concept:**
   | Concept | Match patterns |
   |---------|----------------|
   | Development | dev, start, serve, watch, run |
   | Build | build, compile, bundle, dist |
   | Test | test, test:_, coverage, spec |
   | Lint/Format | lint, format, check, fix, prettier, eslint |
   | Database | migrate, seed, db:_, schema |
   | Deploy | deploy, release, publish, push |
   | Clean | clean, reset, purge, clear |
   | Install/Setup | install, setup, bootstrap, init |
   | Documentation | docs, typedoc, storybook |
   | Utility | (catch-all for unmatched) |

   **Generate definition for each command:**
   - Priority: 1) comment above command 2) analyze command content 3) infer from name
   - Format: max 60 chars, starts with verb (Run, Build, Start, Deploy), no period
   - Examples: `test:unit` → "Run unit tests", `build:prod` → "Build production bundle"

   **Monorepo Command Deduplication:**

   When both root and sub-project have commands:
   | Scenario | Action |
   |----------|--------|
   | Same command, same script | Document at root only |
   | Same command, different script | Document at both, note difference |
   | Root runs workspace command | Document at root with note "all packages" |
   | Sub-project only command | Document at sub-project level |

   **Workspace-aware commands:**
   - `pnpm -r run {script}` → note as "recursive"
   - `lerna run {script}` → note packages affected
   - `nx run-many` / `turbo run` → note caching behavior

   **Root-level orchestration commands:**
   | Pattern | Document As |
   |---------|-------------|
   | `pnpm dev` that runs workspace | "Start all services" |
   | `docker-compose up` | "Start development stack" |
   | `nx affected:test` | "Test affected packages" |

4. **Tech Stack**:
   - Languages: file extensions (.ts, .py, .go, .rs, .java, .rb)
   - Frameworks: dependencies in package.json/pyproject.toml/pom.xml
   - Package manager: npm/pnpm/yarn/uv/pip/cargo/maven/gradle

5. **Project Structure**:
   - Use `find . -maxdepth 3 -type d` for tree
   - Exclude: node_modules, **pycache**, .git, dist, build, .venv, .next, target
   - Identify: src/, lib/, tests/, docs/, scripts/, packages/, apps/

6. **Monorepo Sub-projects** (if detected per Step 1):

   **Package Discovery:**
   - Parse workspace config to find all packages:
     | Config File | Package Location Pattern |
     |-------------|-------------------------|
     | `pnpm-workspace.yaml` | `packages:` array (glob patterns) |
     | `package.json` | `workspaces` array (npm/yarn) |
     | `lerna.json` | `packages` array |
     | `nx.json` | `projects` object or scan for project.json files |
     | `turbo.json` | Use root package.json workspaces |
     | `rush.json` | `projects` array |
     | `go.work` | `use` directives list Go modules |
     | `Cargo.toml` | `[workspace] members` array |
   - Fallback: scan 3 levels for package.json/pyproject.toml/go.mod
   - Resolve glob patterns (e.g., `packages/*`, `apps/*`, `services/*`)

   **For each sub-project, gather:**

   a. **Identity**:
   - Path (relative to root)
   - Name from config file (package.json name, pyproject.toml [project.name])
   - Description from README.md first paragraph or package.json description

   b. **Installation** (Step 2 applied locally):
   - Detect sub-project-specific install command
   - Note if installation is handled by root workspace command

   c. **Commands** (Step 3 applied locally):
   - Extract scripts from local package.json/pyproject.toml
   - Group by concept (dev, build, test, lint)
   - Mark commands unique to this sub-project vs inherited from root

   d. **Tech Stack** (Step 4 applied locally):
   - Languages, frameworks, package manager
   - Note differences from root stack

   e. **Environments** (Step 12 applied locally):
   - Per-service environment files (.env, .env.local)
   - Ports, URLs, service dependencies

   f. **Testing** (Step 13 applied locally):
   - Test framework and config
   - Test command specific to package

   g. **Database** (Step 14 applied locally):
   - ORM, migrations directory
   - Schema files if applicable

   h. **Dependencies** (Step 24 applied locally):
   - Key libraries specific to this sub-project
   - Internal workspace dependencies

   i. **API Structure** (Steps 19-20 applied locally):
   - Routes, controllers, models if applicable
   - API type (REST/GraphQL/gRPC)

   **Deduplication Logic:**
   - Compare sub-project config with root config
   - If same as root: mark as "inherits from root"
   - If different: document explicitly
   - Track shared vs unique:
     | Aspect | Logic |
     |--------|-------|
     | Install | If root has workspace install, note "handled by root" |
     | Commands | If command exists at both levels, prefer sub-project |
     | Env vars | Merge root + sub-project, note conflicts |
     | Dependencies | Show only sub-project-specific deps |

6a. **Monorepo Edge Cases:**

- **Deeply Nested**: Scan up to 3 levels; if sub-project has workspace config, mark as "nested monorepo - see {path}/AGENTS.md"
- **Mixed Tech Stacks**: Document each stack independently; in root Tech Stack list all languages present with which packages use each
- **Sub-projects with Own AGENTS.md**: Note "See detailed docs in {path}/AGENTS.md" and include only summary
- **Empty/Placeholder Packages**: If no scripts and minimal deps, mark as "in development" and skip detailed docs
- **Shared Libraries** (packages/_, libs/_): Focus on exports/API surface, skip environments/deployment
- **Deployable Services** (apps/_, services/_): Full docs including ports, health checks, deployment

7. **CI/CD** (if exists):
   - List .github/workflows/\*.yml files with inferred purpose
   - List .gitlab-ci.yml jobs
   - Note Jenkinsfile if present

8. **Environment Variables** (if .env.example/.env.sample exists):
   - Parse variable names
   - Infer purpose from name or comments

9. **Naming Conventions**:
   - **Files**: Analyze filenames in src/, lib/, components/
     - Detect: kebab-case, snake_case, camelCase, PascalCase
     - Note test patterns: _.test._, _.spec._, test\_\*
   - **Code**: Sample 5-10 source files
     - Check function/variable naming style
     - Check class naming style
   - **Config**: Check ESLint, pylint, ruff rules if present

10. **Adding New Items**: Infer from existing patterns
    - Detect common domains: routes/, handlers/, components/, models/
    - Note test file location relative to source
    - Check for barrel exports (index.ts)

11. **Documentation Files**:
    - List all .md files in docs/, root
    - Check for OpenAPI/Swagger specs
    - Check for Storybook, Docusaurus config
    - Map code directories to relevant docs

12. **Environments**: Detect and document each environment with startup instructions.

    **Sources to analyze:**
    | Source | What to extract |
    |--------|-----------------|
    | `.env.example`, `.env.sample` | Template variables |
    | `.env.local`, `.env.development`, `.env.staging`, `.env.production` | Env-specific vars |
    | `docker-compose*.yml` | Compose files per environment |
    | `Makefile` / `justfile` | Targets like `dev`, `start-local`, `run-staging` |
    | `package.json` | Scripts with env prefixes: `dev`, `start:dev`, `start:prod` |
    | `.github/workflows/*.yml` | Environment references |
    | `k8s/`, `deploy/` | Kubernetes manifests |
    | `environments/`, `*.tfvars` | Terraform configs |

    **Environments to detect:**
    | Environment | Indicators |
    |-------------|------------|
    | Local/Development | `.env.local`, `docker-compose.dev.yml`, `dev` scripts |
    | Integration | `.env.integration`, `integration` in CI |
    | Staging | `.env.staging`, `staging` branch |
    | Production | `.env.production`, `prod` scripts |
    | Test | `.env.test`, test databases |

    **For Local Development (detailed):**
    - Prerequisites: required tools (Node, Python, Docker), services (Postgres, Redis)
    - Setup: clone, install, env file setup, database migrations, seeds
    - Running: start commands, hot-reload, default ports/URLs
    - Common tasks: reset db, run tests, debug mode, view logs

    **For other environments (concise):**
    - Access URL, deploy method, config location

    **For Monorepos - Per-subproject environments:**

    For each sub-project that is a runnable service (has `start`/`dev` script):
    | Attribute | Source |
    |-----------|--------|
    | Service name | package.json name or directory name |
    | Port | Parse start script, docker-compose, or env files |
    | Dependencies | Other sub-project services needed |
    | Env file | Local .env or .env.{service} in sub-project dir |
    | Docker config | Local Dockerfile or docker-compose service |

    Document each runnable service with:
    - Prerequisites (other services that must be running)
    - Start command
    - Default port/URL
    - Environment file location

13. **Testing Patterns**:
    - Framework: pytest, jest, vitest, mocha, go test, cargo test, rspec, junit
    - Config: pytest.ini, jest.config._, vitest.config._, .rspec
    - Coverage: .coveragerc, nyc, c8, coverage in package.json
    - Directory: tests/, **tests**/, spec/, \*\_test.go

14. **Database & Migrations**:
    - ORM: SQLAlchemy, Prisma, TypeORM, GORM, Diesel, ActiveRecord
    - Migration tools: Alembic, Prisma migrate, knex, golang-migrate
    - Directories: migrations/, db/migrate/, prisma/migrations/
    - Schema files: schema.prisma, models.py, schema.rb

15. **Local Dev Dependencies**:
    - Docker Compose services needed for dev
    - Database/cache: postgres, redis, elasticsearch
    - Ports commonly used

16. **Linter & Formatter Configs**:
    - JS/TS: .eslintrc._, prettier.config._, biome.json
    - Python: ruff.toml, pyproject.toml [tool.ruff], .flake8, .pylintrc
    - Go: .golangci.yml
    - Rust: rustfmt.toml, clippy.toml
    - Extract key rules/style choices

17. **Pre-commit Hooks**:
    - .pre-commit-config.yaml
    - husky config in package.json or .husky/
    - lint-staged config
    - List hooks that run on commit

18. **Type Checking Setup**:
    - TypeScript: tsconfig.json strict mode, paths
    - Python: mypy.ini, pyproject.toml [tool.mypy], pyrightconfig.json
    - Note strictness level

19. **API Routes & Endpoints**:
    - Routing patterns: routes/, api/, handlers/, controllers/
    - Framework-specific: FastAPI routers, Express routes, Gin handlers
    - Note: RESTful vs GraphQL vs gRPC
    - List main endpoint groups/domains

20. **Database Models & Schemas**:
    - Model locations: models/, entities/, schemas/
    - Patterns: single file vs file-per-model
    - Schema files: OpenAPI, GraphQL SDL, Protobuf

21. **Service Boundaries**:
    - Service/module boundaries
    - Layered architecture: controllers → services → repositories
    - Domain boundaries if DDD patterns present

22. **Folder Structure Patterns**:
    - Analyze existing folder organization
    - Naming conventions per directory (kebab-case, snake_case, PascalCase)
    - Required companion files (index.ts barrel, **init**.py)
    - Map: folder type → file patterns

23. **File Naming Patterns**:
    - Per-directory file naming analysis
    - Suffixes: .controller.ts, .service.ts, \_test.py, .spec.js
    - Prefixes: test\_, use (hooks)
    - Companion patterns: Button.tsx + Button.module.css + Button.test.tsx

24. **Key Dependencies**:
    - Extract major libraries from package.json/pyproject.toml/go.mod
    - Categorize: framework, UI, state, HTTP, DB, testing, utils
    - Note versions for major deps

25. **Internal vs External Dependencies**:
    - Workspace packages (monorepo internal)
    - Local file references
    - Private registry packages

26. **Dependency Graph** (lightweight):
    - Main entry points
    - Key module relationships

27. **Auth Patterns**:
    - Auth libraries: passport, next-auth, authlib, jwt
    - Auth middleware/decorators
    - Auth flow: session, JWT, OAuth

28. **Secrets Management**:
    - .env patterns and required secrets
    - Vault integration hints: HashiCorp, AWS Secrets Manager, doppler
    - Note: never output actual secret values

29. **Security Scanning**:
    - SAST: semgrep, bandit, gosec, brakeman
    - Dependency scanning: dependabot.yml, renovate.json, snyk
    - Security-focused CI jobs

30. **Git Hooks**:
    - .husky/ directory
    - pre-commit, pre-push, commit-msg hooks
    - Hook purposes

31. **Editor Configs**:
    - .editorconfig settings
    - .vscode/settings.json, .vscode/extensions.json
    - Recommended extensions

32. **License Detection**:
    - LICENSE file type: MIT, Apache-2.0, GPL, proprietary
    - SPDX identifier if present

**For Non-Coding Projects:**

1. **README**: Read README.md for purpose

2. **Folder Structure**:
   - List all directories with `find . -maxdepth 3 -type d`
   - Infer purpose from names

3. **File Location Rules**:
   - Analyze existing file distribution
   - Group by file type and folder

4. **Naming Conventions**:
   - Check for patterns: kebab-case, snake_case, dates (YYYYMMDD)
   - Check markdown heading style (Title Case vs Sentence case)

5. **Metadata Standards**:
   - If markdown files exist, check first 3 for frontmatter
   - Extract common fields

### 3. Check Existing AGENTS.md

If AGENTS.md exists:

1. Read file content
2. Find `<!-- AUTO-GENERATED` and `<!-- END AUTO-GENERATED -->` markers
3. Preserve everything outside these markers
4. Replace content between markers with new detection
5. If markers malformed or missing → warn user, regenerate full file

If no AGENTS.md:

- Generate full template

If `--force` in $ARGUMENTS:

- Regenerate full file without preserving

### 4. Generate Output

**Coding Projects Template:**

````markdown
# AGENTS.md

<!-- AUTO-GENERATED: run /init to refresh -->

## Project Overview

{1-3 sentences from README, or "No README.md found - add project description"}

## Installation

```bash
{detected install commands}
```

{special setup steps like .env configuration}

## Commands

{For each concept group with commands, create a subsection:}

### Development

| Command     | Definition   |
| ----------- | ------------ |
| `{command}` | {definition} |

### Build

| Command     | Definition   |
| ----------- | ------------ |
| `{command}` | {definition} |

### Test

| Command     | Definition   |
| ----------- | ------------ |
| `{command}` | {definition} |

### Lint/Format

| Command     | Definition   |
| ----------- | ------------ |
| `{command}` | {definition} |

{Include only groups that have detected commands. Omit empty groups.}

## Workflows

Common development tasks:

- **Run locally**: {command}
- **Run tests**: {command}
- **Deploy**: {command or "N/A"}

## Environments

{If multiple environments detected, create subsections:}

### Local Development

**Prerequisites:**

- {required tool} {version}+
- {service via Docker or local}

**Setup:**

```bash
# Clone and install
git clone <repo> && cd <project>
{install command}

# Environment
cp .env.example .env.local
# Edit .env.local with your settings

# Database (if applicable)
{docker-compose up -d db command}
{migration command}
{seed command}
```

**Running:**

```bash
{dev command}          # {description}
                       # Available at {url}
```

**Common tasks:**

```bash
{db reset command}     # Reset database
{test command}         # Run tests
{debug command}        # Debug mode
{logs command}         # View logs
```

### Staging

**Access:** {staging URL}
**Deploy:** {deploy method}
**Config:** {config location}

### Production

**Access:** {production URL}
**Deploy:** {deploy method}
**Config:** {config location}

{Include only environments that are detected. Omit section if only single implicit local environment.}

## Architecture

**Tech Stack**: {language} | {framework} | {package manager}

**Structure**:

```
{directory tree, 3 levels, key folders only}
```

{If has infra:}
**Infra Components**:

- Docker: {docker files}
- Terraform: {tf directories}
- K8s: {k8s manifests}

**API Structure**: {REST/GraphQL/gRPC}

- Routes: `{routes path}`
- Controllers: `{controllers path}`

**Data Layer**:

- Models: `{models path}`
- Schemas: `{schemas path}`

**Service Boundaries**:
{list of main services/domains}

{If sub-projects found in Step 1:}

## Sub-projects

{Brief overview: X packages in apps/, Y in packages/, Z shared libraries}

### Shared Configuration

**Workspace Install:**

```bash
{root install command}
```

**Shared Commands** (run from root):
| Command | Definition | Scope |
|---------|------------|-------|
| `{command}` | {definition} | all packages / specific packages |

**Shared Dependencies:**

- {dependency} - used by: {list of packages}

**Shared Env Vars:**
| Variable | Purpose | Used By |
|----------|---------|---------|
| `{VAR}` | {purpose} | all / {packages} |

---

{For each sub-project, create a subsection:}

### `{path}` - {name}

{1-2 sentence description from README or package.json}

**Tech Stack:** {language} | {framework} {if different from root}

**Installation:**
{If handled by root workspace: "Handled by root `{command}`"}
{Else:}

```bash
cd {path}
{install command}
```

**Commands:**
| Command | Definition |
|---------|------------|
| `{command}` | {definition} |

{If runnable service:}
**Run Locally:**

```bash
{start command}  # Available at {url}:{port}
```

**Requires:** {dependent services}

{If has tests:}
**Testing:**

- Framework: {test framework}
- Run: `{test command}`
- Coverage: `{coverage command}`

{If has database:}
**Database:**

- ORM: {orm}
- Migrations: `{migration path}`
- Run: `{migration command}`

{If has API:}
**API Structure:**

- Routes: `{routes path}`
- Type: {REST/GraphQL/gRPC}

{If has environment:}
**Environment:**

- File: `{env file path}`
- Variables:
  | Variable | Purpose |
  |----------|---------|
  | `{VAR}` | {purpose} |

**Key Dependencies:**
{List only sub-project-specific dependencies, not shared ones}

- {dependency}: {version} - {purpose}

**Internal Dependencies:**
{List workspace package dependencies}

- `{package-name}` - {purpose}

---

{Repeat for each sub-project}

{End monorepo section}

## Development Setup

**Testing**:

- Framework: {detected}
- Run: `{test command}`
- Coverage: `{coverage command}`

**Database**:

- ORM: {detected}
- Migrations: `{migration command}`

**Local Services**:

```bash
{docker-compose or service start commands}
```

## Code Quality

**Linting/Formatting**:

```bash
{lint command}
{format command}
```

**Pre-commit**: {hooks summary}
**Type Checking**: {strict/standard} with {tool}

## Detected Patterns

**Folder Patterns**:
| Directory | Naming | Notes |
|-----------|--------|-------|
| `{path}` | {convention} | {observed patterns} |

**File Patterns**:
| Directory | Pattern | Companion Files |
|-----------|---------|-----------------|
| `{path}` | {naming} | {related files} |

## Dependencies

**Key Libraries**:

- Framework: {libraries}
- UI: {libraries}
- State: {libraries}
- Testing: {libraries}

**Internal Packages**: {list if monorepo}

## Security

**Auth**: {pattern detected}
**Secrets**: {management approach}
**Scanning**: {tools in use}

## CI/CD

{list of workflow files with purpose, or omit section}

## Environment

{Required variables from .env.example, or omit section}

## Editor Setup

{.editorconfig summary}
**Recommended extensions**: {list}

## Git Hooks

{Pre-commit hooks and their purposes}

## License

{License type: MIT, Apache-2.0, etc.}

## Adding New Items

{For each detected domain:}
**Add new {domain item}**:

1. Create file in `{path}/`
2. {additional steps}
3. Update tests in `{test path}/`

## Documentation

Keep updated when changing:

| Area        | Update      |
| ----------- | ----------- |
| {code area} | {doc files} |

<!-- END AUTO-GENERATED -->

## Notes

{preserved or empty for user content}
````

**Non-Coding Projects Template:**

````markdown
# AGENTS.md

<!-- AUTO-GENERATED: run /init to refresh -->

## Project Overview

{1-3 sentences from README, or "No README.md found - add project description"}

## Folder Structure

```
{directory tree with inline purpose comments}
```

## File Location Rules

New files by content type:

- {inferred category}: `{folder}/`

## Naming Conventions

**Files**: {detected pattern or "No strict conventions detected"}
**Markdown headings**: {Title Case / Sentence case}

## Metadata Standards

{frontmatter fields if markdown files, or "N/A"}

<!-- END AUTO-GENERATED -->

## Notes

{preserved or empty}
````

### 5. Write File (Incremental)

Do NOT generate the entire file at once. Use an incremental phased approach:

**Phase 0: Cleanup**

1. Read existing `AGENTS.md` (if exists)
2. Find `<!-- AUTO-GENERATED` and `<!-- END AUTO-GENERATED -->` markers
3. Delete everything between markers (preserve content outside)
4. If no file exists, create with empty markers:

   ```markdown
   # AGENTS.md

   <!-- AUTO-GENERATED: run /init to refresh -->
   <!-- END AUTO-GENERATED -->

   ## Notes
   ```

**Phase 1-N: Incremental Additions**

For each gathering step (1-32), execute in order:

1. **Execute the step** - gather the specific information
2. **Decide additions** - determine what content to add to AGENTS.md
3. **Edit the file** - insert content BEFORE the `<!-- END AUTO-GENERATED -->` marker
4. **Continue** - proceed to next step

Example flow:

```
Step 1 (README) → Add "## Project Overview" section → Edit file
Step 2 (Installation) → Add "## Installation" section → Edit file
Step 3 (Commands) → Add "## Commands" section → Edit file
...
Step 6 (Sub-projects) → Add "## Sub-projects" section with each sub-project → Edit file
...
```

**Edit pattern:**

```markdown
{existing content above END marker}

## New Section

{new content}

<!-- END AUTO-GENERATED -->
```

**If a step finds nothing explicit, infer and document what you can.**

## Rules

- **Verbose over concise** - include all useful information, even if it seems obvious
- **Never skip sections** - if no explicit data, infer from context or note "Not detected - requires manual configuration"
- **Preserve user content** outside AUTO-GENERATED block
- If no README exists: infer project purpose from folder name, package.json description, or code analysis
- If markers malformed: regenerate with warning
- Empty/new project: generate scaffold with inferred structure and placeholders marked for completion
- For monorepos: document ALL sub-projects found with full details
- **When in doubt, include it** - redundant info is better than missing info

## Completion Requirement

**CRITICAL: The command is NOT complete until AGENTS.md is written.**

Before finishing:

1. Verify `AGENTS.md` exists in project root
2. Verify content is between `<!-- AUTO-GENERATED` and `<!-- END AUTO-GENERATED -->` markers
3. Verify all gathered information has been written to the file
4. If any step was skipped or failed, note it in the file with "TODO: [reason]"

**Do NOT:**

- End with just analysis or recommendations
- Report what "would be" generated without writing it
- Skip the file write step for any reason

**The command succeeds ONLY when AGENTS.md contains the generated content.**

## Examples

```
/init
```

Generates AGENTS.md with auto-detected context.

```
/init --force
```

Regenerates AGENTS.md without preserving user additions.
