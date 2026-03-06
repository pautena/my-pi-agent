---
name: testing
description: Write and run tests for Pi agent extensions using Vitest with reusable mock factories and coverage reports.
---

# Testing Skill

Write and run tests for Pi agent extensions using Vitest. This skill provides patterns for testing extensions with reusable mock factories and coverage reporting.

## When to Use This Skill

Use this skill when:

- Writing tests for new or existing extensions
- Understanding the testing infrastructure
- Creating reusable mock factories
- Setting up test coverage reporting
- Debugging test failures

## Running Tests

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

**Note**: Type errors related to `@mariozechner/pi-coding-agent` are expected. This package provides types at runtime through the Pi agent, not as a local dependency.

## Test Structure

Tests are placed alongside the source files they test for better discoverability:

```
tests/
├── setup.ts                      # Global test setup (environment variables)
└── mocks/                        # Reusable mock factories
    ├── index.ts                  # Export all mocks
    ├── pi.ts                     # Pi extension mocks (API, Context)
    └── fetch.ts                  # Fetch API mocks

extensions/
├── active-skills-widget/
│   ├── index.ts                  + index.test.ts
│   ├── handlers.ts               + handlers.test.ts
│   ├── utils.ts                  + utils.test.ts
│   ├── ui.ts
│   └── types.ts
└── web-search/
    ├── index.ts                  + index.test.ts
    ├── handlers.ts               + handlers.test.ts
    ├── utils.ts                  + utils.test.ts
    └── types.ts
```

The `tests/` folder contains only shared infrastructure (setup and mocks), while individual test files live next to their corresponding source modules.

## Setup Global Environment

The test suite uses a global setup file for test isolation:

**tests/setup.ts**

```typescript
import { beforeEach, afterEach } from "vitest";

beforeEach(() => {
  // Set up environment variables for testing
  process.env.OLLAMA_API_KEY = "test-api-key";
  process.env.OLLAMA_WEB_SEARCH_BASE_URL = "https://test.ollama.com";
});

afterEach(() => {
  // Clean up environment variables
  Reflect.deleteProperty(process.env, "OLLAMA_API_KEY");
  Reflect.deleteProperty(process.env, "OLLAMA_WEB_SEARCH_BASE_URL");
});
```

This ensures consistent test isolation and avoids duplication across test files.

## Reusable Mocks

The `tests/mocks/` folder provides reusable mock factories for testing Pi extensions.

### Pi Extension Mocks

**tests/mocks/pi.ts**

```typescript
import type {
  ExtensionAPI,
  ExtensionContext,
} from "@mariozechner/pi-coding-agent";
import { vi } from "vitest";

/**
 * Mock ExtensionAPI for testing Pi extensions
 */
export function createMockExtensionAPI(): ExtensionAPI {
  return {
    on: vi.fn(),
    appendEntry: vi.fn(),
    registerTool: vi.fn(),
  } as unknown as ExtensionAPI;
}

/**
 * Mock ExtensionContext for testing Pi extensions
 */
export function createMockExtensionContext(options?: {
  hasUI?: boolean;
  entries?: Array<{ type: string; customType?: string; data?: unknown }>;
}): ExtensionContext {
  const entries = options?.entries ?? [];
  return {
    hasUI: options?.hasUI ?? true,
    sessionManager: {
      getEntries: vi.fn(() => entries),
    },
    ui: {
      setStatus: vi.fn(),
      theme: {
        fg: vi.fn((color: string, text: string) => text),
      },
    },
  } as unknown as ExtensionContext;
}

/**
 * Type helper for accessing registerTool mock calls
 */
export type MockRegisterTool = {
  registerTool: ReturnType<typeof vi.fn>;
};
```

### Fetch Mocks

**tests/mocks/fetch.ts**

```typescript
import { vi } from "vitest";

/**
 * Create a mock fetch function for testing API calls
 */
export function createMockFetch() {
  return vi.fn();
}

/**
 * Setup global fetch mock
 */
export function setupMockFetch() {
  const mockFetch = createMockFetch();
  global.fetch = mockFetch;
  return mockFetch;
}

/**
 * Create a successful fetch response
 */
export function createSuccessResponse(data: unknown) {
  return {
    ok: true,
    text: async () => JSON.stringify(data),
  };
}

/**
 * Create an error fetch response
 */
export function createErrorResponse(
  status: number,
  statusText: string,
  body?: string,
) {
  return {
    ok: false,
    status,
    statusText,
    text: async () => body ?? statusText,
  };
}
```

## Writing Tests

### Basic Test Pattern

Use the AAA (Arrange-Act-Assert) pattern with Vitest:

```typescript
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createMockExtensionAPI } from "../../tests/mocks";

describe("my-extension", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should register tools", async () => {
    // Arrange
    const mockApi = createMockExtensionAPI();
    const extension = await import("./index.js");

    // Act
    extension.default(mockApi);

    // Assert
    expect(mockApi.registerTool).toHaveBeenCalled();
  });
});
```

**Note**: Use the `../../tests/mocks` path to import mocks from test files. Source modules are imported relative to the test file (e.g., `./index.js` for a test file named `index.test.ts`).

### Testing with Environment Variables

For tests that need specific environment values:

```typescript
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createMockExtensionAPI } from "../../tests/mocks";

describe("extension with config", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("should handle missing API key", async () => {
    // Clear environment variable for this test
    Reflect.deleteProperty(process.env, "MY_API_KEY");

    const mockApi = createMockExtensionAPI();
    const extension = await import("./index.js");
    extension.default(mockApi);

    // Test behavior without API key
    const result = await extension.execute(/*...*/);
    expect(result.isError).toBe(true);
  });
});
```

### Testing API Calls

Use fetch mocks to test external API interactions:

```typescript
import { describe, expect, it, vi } from "vitest";
import {
  createMockExtensionAPI,
  type MockRegisterTool,
  createSuccessResponse,
  createErrorResponse,
} from "../../tests/mocks";

describe("web-api-extension", () => {
  const mockFetch = vi.fn();
  global.fetch = mockFetch;

  it("should call API with correct parameters", async () => {
    // Arrange
    mockFetch.mockResolvedValueOnce(createSuccessResponse({ data: "result" }));
    const mockApi = createMockExtensionAPI();
    const extension = await import("./index.js");
    extension.default(mockApi);

    // Act
    const tool = (mockApi as unknown as MockRegisterTool).registerTool.mock
      .calls[0][0];
    await tool.execute("id", { query: "test" }, undefined);

    // Assert
    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.example.com/endpoint",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ query: "test" }),
      }),
    );
  });

  it("should handle API errors", async () => {
    // Arrange
    mockFetch.mockResolvedValueOnce(createErrorResponse(404, "Not Found"));
    const mockApi = createMockExtensionAPI();
    const extension = await import("./index.js");
    extension.default(mockApi);

    // Act
    const tool = (mockApi as unknown as MockRegisterTool).registerTool.mock
      .calls[0][0];
    const result = await tool.execute("id", { query: "test" }, undefined);

    // Assert
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("404");
  });
});
```

## Test Coverage

Coverage reports are generated in multiple formats:

- **Text**: Displayed in terminal after running `npm run test:coverage`
- **HTML**: Viewable in browser at `coverage/index.html`
- **JSON**: Available at `coverage/coverage-final.json`

### Coverage Goals

Aim for:

- **Statements**: ≥80% coverage for critical paths
- **Branches**: ≥70% coverage for conditional logic
- **Functions**: ≥80% coverage for exported functions
- **Lines**: ≥80% coverage overall

### Excluding Files from Coverage

Update `vitest.config.ts` to exclude specific files:

```typescript
coverage: {
	provider: "v8",
	reporter: ["text", "json", "html"],
	include: ["extensions/**/*.ts"],
	exclude: ["node_modules", "tests", "**/*.test.ts", "**/*.d.ts"],
},
```

## Common Patterns

### Testing Event Handlers

```typescript
it("should handle input events", async () => {
  const mockApi = createMockExtensionAPI();
  extension.default(mockApi);

  // Get the event handler
  const inputHandler = mockApi.on.mock.calls.find(
    (call) => call[0] === "input",
  )?.[1];

  expect(inputHandler).toBeDefined();

  // Test the handler
  const result = inputHandler({ source: "user", text: "/cmd" }, mockContext);
  expect(result).toEqual({ action: "continue" });
});
```

### Testing Tool Registration

```typescript
it("should register tools", async () => {
  const mockApi = createMockExtensionAPI();
  extension.default(mockApi);

  expect(mockApi.registerTool).toHaveBeenCalledTimes(2);

  const calls = (mockApi as unknown as MockRegisterTool).registerTool.mock
    .calls;
  const searchTool = calls.find((call) => call[0]?.name === "web_search");

  expect(searchTool[0].name).toBe("web_search");
  expect(searchTool[0].label).toBe("Web Search");
  expect(searchTool[0].description).toContain("Search the web");
});
```

## Best Practices

1. **Use Descriptive Test Names**: Test names should describe the expected behavior
2. **Keep Tests Isolated**: Each test should be independent and not rely on other tests
3. **Mock External Dependencies**: All external calls should be mocked
4. **Test Edge Cases**: Include tests for error conditions and boundary values
5. **Use Type Helpers**: Use provided type helpers like `MockRegisterTool` for type safety
6. **Reset Modules**: Use `vi.resetModules()` when testing module-level state

## Debugging Tests

### Run Specific Tests

```bash
# Run specific test file
npm test active-skills-widget

# Run specific test suite
npm test -- -t "should register tools"
```

### Debug with Console

```typescript
it("debug test", async () => {
  const mockApi = createMockExtensionAPI();
  extension.default(mockApi);

  console.log("Mock calls:", mockApi.registerTool.mock.calls);
  // Vitest will show console output
});
```

## References

- [Vitest Documentation](https://vitest.dev/)
- [Testing Best Practices](https://testingjavascript.com/)
- Project mocks: `tests/mocks/` directory
- Project tests: alongside source files in `extensions/*/`
