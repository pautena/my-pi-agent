import { describe, expect, it } from "vitest";
import { toErrorResponse, toSuccessResponse, truncate } from "./utils.js";

describe("utils", () => {
	describe("truncate", () => {
		it("should return text unchanged if shorter than max length", () => {
			expect(truncate("short text")).toBe("short text");
		});

		it("should truncate text longer than max length", () => {
			const longText = "a".repeat(3000);
			const result = truncate(longText);
			expect(result.length).toBe(2001); // 2000 chars + 1 ellipsis
			expect(result.endsWith("…")).toBe(true);
		});

		it("should respect custom max length", () => {
			const text = "a".repeat(100);
			const result = truncate(text, 50);
			expect(result.length).toBe(51); // 50 chars + 1 ellipsis
		});
	});

	describe("toErrorResponse", () => {
		it("should create error response with message", () => {
			const response = toErrorResponse("Something went wrong");

			expect(response.isError).toBe(true);
			expect(response.content).toEqual([
				{ type: "text", text: "Something went wrong" },
			]);
			expect(response.details.error).toBe("Something went wrong");
		});
	});

	describe("toSuccessResponse", () => {
		it("should create success response with data", () => {
			const data = { key: "value" };
			const response = toSuccessResponse(data);

			expect(response.content).toEqual([
				{ type: "text", text: JSON.stringify(data, null, 2) },
			]);
			expect(response.details.data).toEqual(data);
		});

		it("should stringify arrays properly", () => {
			const data = ["item1", "item2"];
			const response = toSuccessResponse(data);

			expect(response.content[0].text).toBe(JSON.stringify(data, null, 2));
		});
	});
});
