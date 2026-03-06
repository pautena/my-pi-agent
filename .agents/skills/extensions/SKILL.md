---
name: extensions
description: Create and maintain Pi agent extensions with a consistent 4-5 file structure that separates concerns and improves code organization.
---

# Extension Structure Skill

Create and maintain Pi agent extensions with a consistent, clean file structure that separates concerns and improves code organization.

## When to Use This Skill

Use this skill when:

- Creating new Pi agent extensions
- Refactoring existing extensions
- Understanding the extension architecture
- Ensuring consistency across extensions
- Debugging extension organization issues

## Extension Structure Overview

All extensions follow a **consistent 4-5 file structure**:

| File              | Purpose           | Contains                                         |
| ----------------- | ----------------- | ------------------------------------------------ |
| **`index.ts`**    | PI registrations  | Only `pi.registerTool()` or `pi.on()` calls      |
| **`types.ts`**    | Constants + Types | Constants, type definitions, config functions    |
| **`utils.ts`**    | Utilities + Tools | Helper functions, tool definitions/schemas       |
| **`handlers.ts`** | Core logic        | Request handlers, event handlers, business logic |
| **`ui.ts`**       | UI functions      | UI-specific functions (only when needed)         |

## Directory Structure

```
extensions/
├── extension-name/
│   ├── index.ts        # PI registrations (entry point)
│   ├── types.ts        # Constants + Types
│   ├── utils.ts        # Utilities + Tools
│   ├── handlers.ts     # Core logic
│   └── ui.ts           # UI functions (optional)
```

## File Responsibilities

### `index.ts` - PI Registrations

**Purpose**: Entry point for the extension. Contains ONLY registration calls.

**For Tool Extensions**:

```typescript
import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { executeHandler } from "./handlers.js";
import { toolDefinition } from "./utils.js";

export default function registerExtension(pi: ExtensionAPI) {
  pi.registerTool({
    ...toolDefinition,
    async execute(toolCallId, params, signal) {
      return executeHandler(params, signal);
    },
  });
}
```

**For Event Extensions**:

```typescript
import type {
  ExtensionAPI,
  ExtensionContext,
} from "@mariozechner/pi-coding-agent";
import { handleCustomEvent } from "./handlers.js";

export default function (pi: ExtensionAPI) {
  pi.on("event_name", (event: unknown, ctx: ExtensionContext) => {
    return handleCustomEvent(event, ctx);
  });
}
```

**Guidelines**:

- Keep this file minimal - only registrations
- Import handlers from `handlers.ts`
- Import tool definitions from `utils.ts`
- No business logic in this file

### `types.ts` - Constants + Types

**Purpose**: Define constants, types, and configuration functions.

```typescript
// Constants
export const DEFAULT_BASE_URL = "https://api.example.com";
export const ENTRY_TYPE = "custom-entry";
export const STATUS_ID = "status-id";

// Types
export type RequestResult =
  | { ok: true; data: unknown }
  | { ok: false; message: string };

// Config functions
export function resolveBaseUrl(): string {
  return process.env.API_URL ?? DEFAULT_BASE_URL;
}

export function getApiKey(): string | null {
  return process.env.API_KEY ?? null;
}
```

**Guidelines**:

- Export all constants with `export const`
- Export all types with `export type`
- Config functions that read from `process.env` belong here
- No dependencies on other extension files

### `utils.ts` - Utilities + Tools

**Purpose**: Utility functions and tool definitions/schemas.

```typescript
import { Type } from "@sinclair/typebox";

// Utility functions
export function truncate(text: string, maxLength = 2000): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}…`;
}

export function formatResponse(data: unknown) {
  return {
    content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
  };
}

// Tool definitions (for tools extensions)
export const searchTool = {
  name: "search",
  label: "Search",
  description: "Search for information",
  parameters: Type.Object({
    query: Type.String({ description: "Search query" }),
  }),
};
```

**Guidelines**:

- Pure utility functions with no side effects
- Tool schemas and definitions using TypeBox
- Response formatting helpers
- No API calls or external dependencies

### `handlers.ts` - Core Logic

**Purpose**: Business logic, API interactions, event handlers.

```typescript
import type { RequestResult } from "./types.js";
import { resolveBaseUrl, getApiKey } from "./types.js";
import { formatResponse } from "./utils.js";

export async function fetchData(
  endpoint: string,
  params: Record<string, unknown>,
  signal?: AbortSignal,
): Promise<RequestResult> {
  const apiKey = getApiKey();
  if (!apiKey) {
    return { ok: false, message: "API key not configured" };
  }

  const url = `${resolveBaseUrl()}${endpoint}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify(params),
    signal,
  });

  // ... handle response
  return { ok: true, data: await response.json() };
}

export async function executeHandler(
  params: { query: string },
  signal?: AbortSignal,
) {
  const result = await fetchData("/search", { query: params.query }, signal);

  if (!result.ok) {
    return { isError: true, content: [{ type: "text", text: result.message }] };
  }

  return formatResponse(result.data);
}
```

**Guidelines**:

- Handle all external API calls
- Implement business logic
- Process and transform data
- Handle errors gracefully
- Import types from `types.ts`
- Import utilities from `utils.ts`

### `ui.ts` - UI Functions (Optional)

**Purpose**: UI-specific functions for extensions with user interface components.

```typescript
import type { ExtensionContext } from "@mariozechner/pi-coding-agent";
import { STATUS_ID } from "./types.js";

export function updateStatus(message: string, ctx: ExtensionContext): void {
  if (!ctx.hasUI) return;

  ctx.ui.setStatus(STATUS_ID, ctx.ui.theme.fg("dim", message));
}

export function displayError(error: string, ctx: ExtensionContext): void {
  if (!ctx.hasUI) return;

  ctx.ui.setStatus(STATUS_ID, ctx.ui.theme.fg("red", error));
}
```

**Guidelines**:

- Only include when extension has UI components
- Always check `ctx.hasUI` before calling UI methods
- Use theme functions for consistent styling
- Keep UI logic separate from business logic

## Example Extensions

### Tool Extension: `web-search`

```
extensions/web-search/
├── index.ts        # Tool registration
├── types.ts        # RequestResult type, config functions
├── utils.ts        # truncate, toErrorResponse, webSearchTool schema
└── handlers.ts     # requestJson API handler
```

**Key Points**:

- No `ui.ts` needed (no UI components)
- Tool schemas in `utils.ts`
- API request logic in `handlers.ts`
- Config functions (`getApiKey`, `resolveBaseUrl`) in `types.ts`

### Event Extension: `active-skills-widget`

```
extensions/active-skills-widget/
├── index.ts        # Event registrations (session_start, input, etc.)
├── types.ts        # ENTRY_TYPE, STATUS_ID constants
├── utils.ts        # buildSkillsLabel helper
├── handlers.ts     # refreshFromSession, addSkill, handleInput
└── ui.ts           # updateStatus UI function
```

**Key Points**:

- Has `ui.ts` for UI status updates
- Constants in `types.ts`
- Event handlers in `handlers.ts`
- UI logic in `ui.ts`

## Creating a New Extension

### Step 1: Create Extension Directory

```bash
mkdir extensions/my-extension
```

### Step 2: Create `types.ts`

```typescript
// Define constants
export const MY_CONSTANT = "value";

// Define types
export type MyData = {
  id: string;
  name: string;
};

// Define config functions if needed
export function getConfig(): string | null {
  return process.env.MY_CONFIG ?? null;
}
```

### Step 3: Create `utils.ts`

```typescript
import { Type } from "@sinclair/typebox";

export function helperFunction(data: MyData): string {
  return data.name;
}

// For tool extensions
export const myTool = {
  name: "my_tool",
  label: "My Tool",
  description: "Does something useful",
  parameters: Type.Object({
    input: Type.String(),
  }),
};
```

### Step 4: Create `handlers.ts`

```typescript
export async function handleRequest(params: { input: string }) {
  // Implement core logic
  return { result: "processed" };
}
```

### Step 5: Create `index.ts`

**For Tools**:

```typescript
import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { handleRequest } from "./handlers.js";
import { myTool } from "./utils.js";

export default function register(pi: ExtensionAPI) {
  pi.registerTool({
    ...myTool,
    async execute(_id, params, signal) {
      return handleRequest(params);
    },
  });
}
```

**For Events**:

```typescript
import type {
  ExtensionAPI,
  ExtensionContext,
} from "@mariozechner/pi-coding-agent";
import { handleRequest } from "./handlers.js";

export default function register(pi: ExtensionAPI) {
  pi.on("event_name", (event, ctx: ExtensionContext) => {
    return handleRequest(event, ctx);
  });
}
```

### Step 6: Add UI if Needed

Only create `ui.ts` if your extension has UI components.

### Step 7: Test

```bash
npm test
npx tsc --noEmit
```

## Refactoring Existing Extensions

When refactoring an existing extension to this structure:

1. **Identify**: Group existing code by responsibility
2. **Extract**: Move constants/types to `types.ts`
3. **Organize**: Move utilities and tool definitions to `utils.ts`
4. **Separate**: Move handlers/logic to `handlers.ts`
5. **Isolate UI**: If applicable, move UI functions to `ui.ts`
6. **Clean**: Keep only registrations in `index.ts`

## Best Practices

1. **Single Responsibility**: Each file has one clear purpose
2. **Dependency Direction**:
   - `index.ts` → depends on all
   - `handlers.ts` → depends on `types.ts`, `utils.ts`
   - `utils.ts` → depends on nothing (pure)
   - `types.ts` → depends on nothing
   - `ui.ts` → depends on `types.ts`
3. **No Circular Dependencies**: Keep dependency tree clean
4. **Consistent Naming**: Use descriptive function names
5. **Type Safety**: Always use TypeScript types
6. **Error Handling**: Handle errors in handlers, not in utils

## Common Patterns

### Tool with API Call

- `types.ts` - API response types
- `utils.ts` - Tool schema, response formatters
- `handlers.ts` - API request logic
- `index.ts` - Tool registration

### Event Handler with State

- `types.ts` - Constants, state types
- `handlers.ts` - Event processing, state management
- `ui.ts` - Status updates (if needed)
- `index.ts` - Event registrations

### Multiple Tools

- `utils.ts` - All tool schemas
- `handlers.ts` - Handler for each tool
- `index.ts` - Register all tools

## Debugging

### Type Errors

```bash
# Check for type errors
npx tsc --noEmit
```

### Import Issues

- Use `.js` extension in imports: `import { x } from "./file.js"`
- Check file exists in correct location
- Verify export is present

### Structure Issues

- Ensure each file has single responsibility
- Check dependency direction doesn't create cycles
- Verify `index.ts` only has registrations

## References

- Extension examples: `extensions/web-search/`, `extensions/active-skills-widget/`
- Type definitions: `@mariozechner/pi-coding-agent`
- Testing guide: `.agents/skills/testing/SKILL.md`
