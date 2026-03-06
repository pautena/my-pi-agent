import type { ExtensionAPI, ExtensionContext } from "@mariozechner/pi-coding-agent";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { refreshFromSession, addSkill, handleInput } from "./handlers.js";
import { ENTRY_TYPE } from "./types.js";

describe("handlers", () => {
	describe("refreshFromSession", () => {
		let mockApi: ExtensionAPI;
		let mockContext: ExtensionContext;

		beforeEach(() => {
			mockApi = {
				appendEntry: vi.fn(),
			} as unknown as ExtensionAPI;

			mockContext = {
				sessionManager: {
					getEntries: vi.fn(),
				},
				ui: {
					setStatus: vi.fn(),
					theme: {
						fg: vi.fn((_, text) => text),
					},
				},
			} as unknown as ExtensionContext;
		});

		it("should return empty set when no skills are loaded", () => {
			(mockContext.sessionManager.getEntries as ReturnType<typeof vi.fn>).mockReturnValue([]);

			const result = refreshFromSession(mockContext, mockApi);

			expect(result.size).toBe(0);
		});

		it("should extract skill names from session entries", () => {
			const entries = [
				{ type: "custom", customType: ENTRY_TYPE, data: { name: "skill1" } },
				{ type: "custom", customType: ENTRY_TYPE, data: { name: "skill2" } },
				{ type: "other", data: {} },
			];
			(mockContext.sessionManager.getEntries as ReturnType<typeof vi.fn>).mockReturnValue(entries);

			const result = refreshFromSession(mockContext, mockApi);

			expect(result).toEqual(new Set(["skill1", "skill2"]));
		});

		it("should ignore entries without valid names", () => {
			const entries = [
				{ type: "custom", customType: ENTRY_TYPE, data: { name: "valid" } },
				{ type: "custom", customType: ENTRY_TYPE, data: { name: "" } },
				{ type: "custom", customType: ENTRY_TYPE, data: { name: "   " } },
				{ type: "custom", customType: ENTRY_TYPE, data: {} },
			];
			(mockContext.sessionManager.getEntries as ReturnType<typeof vi.fn>).mockReturnValue(entries);

			const result = refreshFromSession(mockContext, mockApi);

			expect(result).toEqual(new Set(["valid"]));
		});

		it("should update status after refreshing", () => {
			const entries = [
				{ type: "custom", customType: ENTRY_TYPE, data: { name: "skill1" } },
			];
			(mockContext.sessionManager.getEntries as ReturnType<typeof vi.fn>).mockReturnValue(entries);
			(mockContext as unknown as { hasUI: boolean }).hasUI = true;

			refreshFromSession(mockContext, mockApi);

			expect(mockContext.ui.setStatus).toHaveBeenCalled();
		});
	});

	describe("addSkill", () => {
		let mockApi: ExtensionAPI;
		let mockContext: ExtensionContext;

		beforeEach(() => {
			mockApi = {
				appendEntry: vi.fn(),
			} as unknown as ExtensionAPI;

			mockContext = {
				ui: {
					setStatus: vi.fn(),
					theme: {
						fg: vi.fn((_, text) => text),
					},
				},
			} as unknown as ExtensionContext;
		});

		it("should add a new skill to the set", () => {
			const loadedSkills = new Set<string>();

			const result = addSkill("new-skill", loadedSkills, mockContext, mockApi);

			expect(result.has("new-skill")).toBe(true);
			expect(mockApi.appendEntry).toHaveBeenCalledWith(ENTRY_TYPE, { name: "new-skill" });
		});

		it("should not add duplicate skills", () => {
			const loadedSkills = new Set(["existing-skill"]);

			const result = addSkill("existing-skill", loadedSkills, mockContext, mockApi);

			expect(result.size).toBe(1);
			expect(mockApi.appendEntry).not.toHaveBeenCalled();
		});

		it("should update status after adding", () => {
			const loadedSkills = new Set<string>();
			(mockContext as unknown as { hasUI: boolean }).hasUI = true;

			addSkill("new-skill", loadedSkills, mockContext, mockApi);

			expect(mockContext.ui.setStatus).toHaveBeenCalled();
		});
	});

	describe("handleInput", () => {
		let mockApi: ExtensionAPI;
		let mockContext: ExtensionContext;
		let loadedSkills: Set<string>;

		beforeEach(() => {
			mockApi = {
				appendEntry: vi.fn(),
			} as unknown as ExtensionAPI;

			mockContext = {
				ui: {
					setStatus: vi.fn(),
					theme: {
						fg: vi.fn((_, text) => text),
					},
				},
			} as unknown as ExtensionContext;

			loadedSkills = new Set<string>();
		});

		it("should return continue for all inputs", () => {
			const result1 = handleInput({ source: "user", text: "/skill:test" }, mockContext, mockApi, loadedSkills);
			const result2 = handleInput({ source: "user", text: "regular" }, mockContext, mockApi, loadedSkills);
			const result3 = handleInput({ source: "extension", text: "/skill:test" }, mockContext, mockApi, loadedSkills);

			expect(result1).toEqual({ action: "continue" });
			expect(result2).toEqual({ action: "continue" });
			expect(result3).toEqual({ action: "continue" });
		});

		it("should ignore input from extensions", () => {
			handleInput({ source: "extension", text: "/skill:test" }, mockContext, mockApi, loadedSkills);

			expect(mockApi.appendEntry).not.toHaveBeenCalled();
		});

		it("should ignore input without /skill: prefix", () => {
			handleInput({ source: "user", text: "regular input" }, mockContext, mockApi, loadedSkills);

			expect(mockApi.appendEntry).not.toHaveBeenCalled();
		});

		it("should add skill from /skill: command", () => {
			handleInput({ source: "user", text: "/skill:my-skill" }, mockContext, mockApi, loadedSkills);

			expect(mockApi.appendEntry).toHaveBeenCalledWith(ENTRY_TYPE, { name: "my-skill" });
		});

		it("should extract only first word after /skill:", () => {
			handleInput({ source: "user", text: "/skill:skill-name extra words" }, mockContext, mockApi, loadedSkills);

			expect(mockApi.appendEntry).toHaveBeenCalledWith(ENTRY_TYPE, { name: "skill-name" });
		});

		it("should handle empty /skill: command", () => {
			handleInput({ source: "user", text: "/skill:   " }, mockContext, mockApi, loadedSkills);

			expect(mockApi.appendEntry).not.toHaveBeenCalled();
		});
	});
});