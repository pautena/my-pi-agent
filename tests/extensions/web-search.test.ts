import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import {
	type MockRegisterTool,
	createErrorResponse,
	createMockExtensionAPI,
	createSuccessResponse,
} from "@tests/mocks";
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
		const extension = await import("../../extensions/web-search/index.ts");
		expect(extension.default).toBeTypeOf("function");
	});

	it("should register web_search and web_fetch tools", async () => {
		const mockApi = createMockExtensionAPI();

		const extension = await import("../../extensions/web-search/index.ts");
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

	it("should return error when API key is not set", async () => {
		// Clear the API key for this specific test
		Reflect.deleteProperty(process.env, "OLLAMA_API_KEY");

		const mockApi = createMockExtensionAPI();

		const extension = await import("../../extensions/web-search/index.ts");
		extension.default(mockApi);

		const mockApiWithCalls = mockApi as unknown as MockRegisterTool;
		const calls = mockApiWithCalls.registerTool.mock.calls;
		const searchTool = calls.find(
			(call) => call[0]?.name === "web_search",
		)?.[0];

		const result = await searchTool?.execute(
			"tool-call-id",
			{ query: "test" },
			undefined,
		);

		expect(result?.isError).toBe(true);
		expect(result?.content[0].text).toContain("OLLAMA_API_KEY is not set");
	});

	it("should call web search API with correct parameters", async () => {
		mockFetch.mockResolvedValueOnce(
			createSuccessResponse({ results: ["result1", "result2"] }),
		);

		const mockApi = createMockExtensionAPI();

		const extension = await import("../../extensions/web-search/index.ts");
		extension.default(mockApi);

		const mockApiWithCalls = mockApi as unknown as MockRegisterTool;
		const calls = mockApiWithCalls.registerTool.mock.calls;
		const searchTool = calls.find(
			(call) => call[0]?.name === "web_search",
		)?.[0];

		await searchTool?.execute(
			"tool-call-id",
			{ query: "test query", maxResults: 5 },
			undefined,
		);

		expect(mockFetch).toHaveBeenCalledWith(
			"https://test.ollama.com/api/web_search",
			expect.objectContaining({
				method: "POST",
				headers: expect.objectContaining({
					"Content-Type": "application/json",
					Authorization: "Bearer test-api-key",
				}),
				body: JSON.stringify({ query: "test query", max_results: 5 }),
			}),
		);
	});

	it("should call web fetch API with correct parameters", async () => {
		mockFetch.mockResolvedValueOnce(
			createSuccessResponse({ content: "page content" }),
		);

		const mockApi = createMockExtensionAPI();

		const extension = await import("../../extensions/web-search/index.ts");
		extension.default(mockApi);

		const mockApiWithCalls = mockApi as unknown as MockRegisterTool;
		const calls = mockApiWithCalls.registerTool.mock.calls;
		const fetchTool = calls.find((call) => call[0]?.name === "web_fetch")?.[0];

		await fetchTool?.execute(
			"tool-call-id",
			{ url: "https://example.com" },
			undefined,
		);

		expect(mockFetch).toHaveBeenCalledWith(
			"https://test.ollama.com/api/web_fetch",
			expect.objectContaining({
				method: "POST",
				body: JSON.stringify({ url: "https://example.com" }),
			}),
		);
	});

	it("should handle API errors gracefully", async () => {
		mockFetch.mockResolvedValueOnce(createErrorResponse(404, "Not Found"));

		const mockApi = createMockExtensionAPI();

		const extension = await import("../../extensions/web-search/index.ts");
		extension.default(mockApi);

		const mockApiWithCalls = mockApi as unknown as MockRegisterTool;
		const calls = mockApiWithCalls.registerTool.mock.calls;
		const searchTool = calls.find(
			(call) => call[0]?.name === "web_search",
		)?.[0];

		const result = await searchTool?.execute(
			"tool-call-id",
			{ query: "test" },
			undefined,
		);

		expect(result?.isError).toBe(true);
		expect(result?.content[0].text).toContain("404");
	});
});
