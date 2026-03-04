---
description: Save implementation plan to .agents/plans/ with standard template
---

Save the current plan to `.agents/plans/` using the standard template format.

## Input

- `/save-plan feature-name` - Save plan with given name
- `/save-plan` - Prompt for plan name

Plan name provided: $ARGUMENTS

## Process

1. **Get plan name**:
   - If `$ARGUMENTS` provided: use as filename base
   - Else: ask user for descriptive name (e.g., "user-auth", "api-refactor")

2. **Gather plan content**:
   - Extract from conversation context:
     - Overview/purpose
     - Current state analysis
     - Target state/specification
     - Reference data (IDs, paths)
     - Workflow steps
     - Execution phases with tasks
     - Open questions/decisions

3. **Generate plan file**:
   - Filename: `YYYYMMDD_{name}.md` (today's date)
   - Path: `.agents/plans/`
   - Create directory if missing

4. **Write using template**:

```markdown
# [Plan Title]

## Overview
[Purpose in 1-3 sentences - what this plan achieves and why]

## Current State
[What exists now, gaps identified, scope of work with counts]

## Target State / Specification
[Schema, conventions, format definitions, data model mappings]

## Reference Data
[ID mappings, file paths, quick lookup tables for execution]

## Workflow
[Step-by-step repeatable process per item]

## Execution Phases
[Ordered work breakdown - simple to complex, small to large]

### Phase 1 - [Name] (Priority/Size indicator)
- [ ] Task A
- [ ] Task B

### Phase 2 - [Name]
- [ ] Task C
- [ ] Task D

## Status Table
| ID | Name | Expected | Actual | Status |
|----|------|----------|--------|--------|
| 1  | Item A | 0 | 0 | Pending |

**Status icons**: Complete | Partial | Pending | In Progress | Blocked

## Progress Log
[To be filled during execution - dates, totals, artifacts created]

## Notes

### Decisions Made
[Document rationale for key choices]

### Open Questions
[Unresolved items requiring user input]

---
*Created: YYYY-MM-DD*
```

5. **Confirm save**:
   ```
   Plan saved: .agents/plans/YYYYMMDD_feature-name.md

   Sections:
   - Overview
   - Current State
   - Target State
   - Reference Data
   - Workflow
   - Execution Phases (N phases, M tasks)
   - Status Table
   - Notes

   Open questions: [list any unresolved items]

   Ready to execute with: /build-plan .agents/plans/YYYYMMDD_feature-name.md
   ```

## Rules

- Use today's date for timestamp prefix
- Slugify plan name (lowercase, hyphens)
- Include all sections even if minimal content
- List open questions prominently
- Omit sections only if truly not applicable
- No emojis in plan content

## Section Guidelines

| Section | Required | Purpose |
|---------|----------|---------|
| Overview | Yes | 1-3 sentences on what and why |
| Current State | Yes | Baseline, gaps, scope with counts |
| Target State | If applicable | Schema, format, conventions |
| Reference Data | If applicable | IDs, paths, lookup tables |
| Workflow | Yes | Repeatable per-item process |
| Execution Phases | Yes | Ordered tasks with checkboxes |
| Status Table | For multi-item work | Progress tracking |
| Progress Log | Yes (empty) | Filled during execution |
| Notes | Yes | Decisions and open questions |

## Example

```
User: /save-plan auth-migration

AI: Saved plan to .agents/plans/20251220_auth-migration.md

   Sections populated:
   - Overview: Migrate auth from JWT to session-based
   - Current State: 3 services using JWT, 15 endpoints
   - Target State: Session cookies, Redis store
   - Workflow: 5-step migration per service
   - Phases: 4 phases, 12 tasks

   Open questions:
   - Session timeout duration?
   - Keep JWT as fallback?

   Execute with: /build-plan .agents/plans/20251220_auth-migration.md
```
