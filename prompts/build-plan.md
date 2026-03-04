---
description: Execute a plan file phase by phase with test validation
---

You will read and execute a plan file phase by phase.

## Input

User provides plan via:

- File path argument: `/build-plan path/to/plan.md`
- Context: Plan content in conversation
- Interactive: List plans from `.agents/plans/` (if exists)

## Process

1. **Get plan content**:
   - If path provided: read that file
   - If content in context: use it
   - Else: list `.agents/plans/` and ask:

     **SELECT PLAN TO EXECUTE:**
     {numbered list of available plans}

     Enter plan number or path:

2. **Check for existing progress**:
   - Look for phase completion markers: `- [x] Phase {n}:` or `✓ Phase {n}:`
   - If completed phases found:
     - Output:

       ```
       Resuming plan: {goal}

       Completed:
       - Phase {n}: {name}
       ...

       Remaining:
       - Phase {m}: {name}
       ...
       ```

     - Skip to first incomplete phase

   - Else: start from beginning

3. **Parse and summarize**:
   - Extract goal/objective
   - Extract all phases with tasks
   - Output:

     ```
     Plan: {goal}

     Phases:

     1. {phase name} - {brief description}
     2. {phase name} - {brief description}
     ...
     ```

4. **Execute phases**:
   - For each phase:
     - Ask permission: **EXECUTE PHASE {n}: {name}? (y/n)**
     - If no: update plan file with completion status, stop
     - If yes: complete all tasks
     - Run tests if project has them
     - Fix test failures (max 3 iterations)
     - If >3 iterations: write error summary, delegate to user, stop
     - **Mark phase as complete in plan file**: add `✓` or `[x]` before phase
     - **Phase summary** - show:

       **A. Code Changes**
       - List all modified files with paths
       - Brief description of key changes

       **B. Test Execution Results**
       - For each project/test suite:
         ```
         Project: {project_name}
         Command: {test command}
         Result: PASS/FAIL
         Tests: {passed}/{total}
         ```
       - If no tests: state "No tests executed"

       **C. New/Updated Test Files**
       - New test files with test functions listed
       - Modified test files with changes

       **D. Phase Completion**
       - Confirm phase objectives met
       - Note any deviations

     - **Phase review** - ask:

       **PHASE {n} COMPLETE - CHOOSE ACTION:**
       1. Pause (iterate on fixes)
       2. Revert (undo phase changes)
       3. Commit and continue
       4. Commit and pause
       5. Continue (no commit)
       - If 1: pause, wait for user fixes
       - If 2: revert changes with `git checkout`
       - If 3: generate commit, continue
       - If 4: generate commit, pause
       - If 5: continue to next phase

5. **After completion**:
   - Ensure the plan file is fully updated with completed phases and final status
   - Do not write any separate summary/session output file

## Testing Strategy

1. **Detect project structure**:
   - Identify if monorepo
   - List all projects that need testing

2. **Detect test commands**:
   - Check Makefile, package.json, pytest.ini, etc.

3. **Run available tests**:
   - Python: `pytest` or `make test-*`
   - JS/TS: `npm test`
   - Go: `go test ./...`
   - Rust: `cargo test`

## Rules

- Extremely concise
- No emojis
- Max 3 test fix attempts per phase
- Stop on user "no" or test delegation
- **All questions to user**: use uppercase and bold

## Plan File Format

```markdown
# Goal

Brief description

## Phases

- [ ] Phase 1: {name}
  - Task details

- [ ] Phase 2: {name}
  - Task details
```

Completed phases marked as `- [x]` or with `✓` prefix.

## Example Usage

```
User: /build-plan .agents/plans/20251114_refactoring.md
User: /build-plan
User: /build-plan {paste plan content}
```
