import { type Mock, beforeEach, describe, expect, it, vi } from "vitest";
import { mockActiveSkillsWidget } from "../../tests/mocks";

describe("active-skills-widget", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should register event listeners on initialization", async () => {
		const { mockApi } = mockActiveSkillsWidget();
		const extension = await import("./index.js");

		extension.default(mockApi);

		expect(mockApi.on).toHaveBeenCalledTimes(3);
		expect(mockApi.on).toHaveBeenCalledWith(
			"session_start",
			expect.any(Function),
		);
		expect(mockApi.on).toHaveBeenCalledWith(
			"session_switch",
			expect.any(Function),
		);
		expect(mockApi.on).toHaveBeenCalledWith("input", expect.any(Function));
	});

	it("should update status when a skill is loaded via /skill: command", async () => {
		const { mockApi, mockContext } = mockActiveSkillsWidget();
		const extension = await import("./index.js");

		extension.default(mockApi);

		// Get the input handler
		const inputHandler = (mockApi.on as Mock).mock.calls.find(
			(call) => call[0] === "input",
		)?.[1];

		expect(inputHandler).toBeDefined();

		// Simulate input with /skill: command
		const result = inputHandler(
			{ source: "user", text: "/skill:test-skill" },
			mockContext,
		);

		expect(result).toEqual({ action: "continue" });
		expect(mockApi.appendEntry).toHaveBeenCalledWith("active-skill", {
			name: "test-skill",
		});
		expect(mockContext.ui.setStatus).toHaveBeenCalled();
	});

	it("should ignore input from extensions", async () => {
		const { mockApi, mockContext } = mockActiveSkillsWidget();
		const extension = await import("./index.js");

		extension.default(mockApi);

		const inputHandler = (mockApi.on as Mock).mock.calls.find(
			(call) => call[0] === "input",
		)?.[1];

		const result = inputHandler(
			{ source: "extension", text: "/skill:test-skill" },
			mockContext,
		);

		expect(result).toEqual({ action: "continue" });
		expect(mockApi.appendEntry).not.toHaveBeenCalled();
	});

	it("should not process commands without /skill: prefix", async () => {
		const { mockApi, mockContext } = mockActiveSkillsWidget();
		const extension = await import("./index.js");

		extension.default(mockApi);

		const inputHandler = (mockApi.on as Mock).mock.calls.find(
			(call) => call[0] === "input",
		)?.[1];

		const result = inputHandler(
			{ source: "user", text: "regular input" },
			mockContext,
		);

		expect(result).toEqual({ action: "continue" });
		expect(mockApi.appendEntry).not.toHaveBeenCalled();
	});
});
