import { beforeEach, describe, expect, it, vi } from "vitest";
import { requestJson } from "./handlers.js";
import type { RequestResult } from "./types.js";

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("handlers", () => {
	beforeEach(() => {
		vi.resetModules();
		vi.clearAllMocks();
		process.env.OLLAMA_API_KEY = "test-api-key";
		process.env.OLLAMA_WEB_SEARCH_BASE_URL = "https://test.ollama.com";
	});

	describe("requestJson", () => {
		it("should return error when API key is not set", async () => {
			Reflect.deleteProperty(process.env, "OLLAMA_API_KEY");

			const result = await requestJson("/api/web_search", { query: "test" });

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.message).toContain("OLLAMA_API_KEY is not set");
			}
		});

		it("should make POST request with correct parameters", async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				text: async () => JSON.stringify({ results: ["result1"] }),
			});

			await requestJson("/api/web_search", { query: "test", max_results: 5 });

			expect(mockFetch).toHaveBeenCalledWith(
				"https://test.ollama.com/api/web_search",
				expect.objectContaining({
					method: "POST",
					headers: expect.objectContaining({
						"Content-Type": "application/json",
						Authorization: "Bearer test-api-key",
					}),
					body: JSON.stringify({ query: "test", max_results: 5 }),
				}),
			);
		});

		it("should return success response for valid JSON", async () => {
			const testData = { results: ["result1", "result2"] };
			mockFetch.mockResolvedValueOnce({
				ok: true,
				text: async () => JSON.stringify(testData),
			});

			const result = (await requestJson("/api/web_search", {
				query: "test",
			})) as RequestResult;

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.data).toEqual(testData);
			}
		});

		it("should return error for non-ok response", async () => {
			mockFetch.mockResolvedValueOnce({
				ok: false,
				status: 404,
				statusText: "Not Found",
				text: async () => "Page not found",
			});

			const result = await requestJson("/api/web_search", { query: "test" });

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.message).toContain("404");
				expect(result.message).toContain("Not Found");
			}
		});

		it("should return error for empty response", async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				text: async () => "",
			});

			const result = await requestJson("/api/web_search", { query: "test" });

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.message).toContain("empty response");
			}
		});

		it("should return error for invalid JSON", async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				text: async () => "not valid json",
			});

			const result = await requestJson("/api/web_search", { query: "test" });

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.message).toContain("Failed to parse JSON");
			}
		});

		it("should return error on fetch failure", async () => {
			mockFetch.mockRejectedValueOnce(new Error("Network error"));

			const result = await requestJson("/api/web_search", { query: "test" });

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.message).toContain("Failed to reach");
			}
		});

		it("should pass abort signal to fetch", async () => {
			const controller = new AbortController();
			mockFetch.mockResolvedValueOnce({
				ok: true,
				text: async () => JSON.stringify({ data: "test" }),
			});

			await requestJson("/api/web_search", { query: "test" }, controller.signal);

			expect(mockFetch).toHaveBeenCalledWith(
				expect.any(String),
				expect.objectContaining({
					signal: controller.signal,
				}),
			);
		});
	});
});