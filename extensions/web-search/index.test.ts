import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import {
	type MockRegisterTool,
	createMockExtensionAPI,
	createSuccessResponse,
} from "../../tests/mocks";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("web-search", () => {
	beforeEach(() => {
		vi.resetModules();
		vi.clearAllMocks();
	});

	it("should export a default function", async () => {
		const extension = await import("./index.js");
		expect(extension.default).toBeTypeOf("function");
	});

	it("should register web_search and web_fetch tools", async () => {
		process.env.OLLAMA_API_KEY = "test-api-key";
		process.env.OLLAMA_WEB_SEARCH_BASE_URL = "https://test.ollama.com";

		const mockApi = createMockExtensionAPI();

		const extension = await import("./index.js");
		extension.default(mockApi);

		expect(mockApi.registerTool).toHaveBeenCalledTimes(2);

		// Check web_search tool
		const mockApiWithCalls = mockApi as unknown as MockRegisterTool;
		const calls = mockApiWithCalls.registerTool.mock.calls;
		const searchCall = calls.find((call) => call[0]?.name === "web_search");
		expect(searchCall).toBeDefined();
		expect(searchCall?.[0].name).toBe("web_search");
		expect(searchCall?.[0].label).toBe("Web Search");
		expect(searchCall?.[0].description).toContain("Search the web");

		// Check web_fetch tool
		const fetchCall = calls.find((call) => call[0]?.name === "web_fetch");
		expect(fetchCall).toBeDefined();
		expect(fetchCall?.[0].name).toBe("web_fetch");
		expect(fetchCall?.[0].label).toBe("Web Fetch");
		expect(fetchCall?.[0].description).toContain("Fetch the full content");
	});
});