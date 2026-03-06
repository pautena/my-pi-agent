import type { ExtensionContext } from "@mariozechner/pi-coding-agent";
import { describe, expect, it, vi } from "vitest";

import { updateStatus } from "./ui.js";
describe("ui.updateStatus", () => {
	it("should set status with formatted label when UI is present", () => {
		const setStatus = vi.fn();
		const fg = vi.fn((_, txt) => `dim:${txt}`);
		const ctx: ExtensionContext = {
			hasUI: true,
			ui: {
				setStatus,
				theme: { fg },
			},
		};

		updateStatus(["skillA", "skillB"], ctx);

		expect(fg).toHaveBeenCalledWith("dim", "Skills: skillA, skillB");
		expect(setStatus).toHaveBeenCalledWith(
			"active-skills",
			"dim:Skills: skillA, skillB",
		);
	});

	it("should not call setStatus when UI is absent", () => {
		const setStatus = vi.fn();
		const ctx = {
			hasUI: false,
			ui: { setStatus },
		};

		updateStatus(["skillA"], ctx);
		expect(setStatus).not.toHaveBeenCalled();
	});
});
