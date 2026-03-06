import { describe, expect, it } from "vitest";
import { buildSkillsLabel } from "./utils.js";

describe("utils", () => {
	describe("buildSkillsLabel", () => {
		it("should return 'No skill loaded' for empty array", () => {
			expect(buildSkillsLabel([])).toBe("No skill loaded");
		});

		it("should return single skill label for one skill", () => {
			expect(buildSkillsLabel(["skill1"])).toBe("Skills: skill1");
		});

		it("should join multiple skills with commas", () => {
			expect(buildSkillsLabel(["skill1", "skill2", "skill3"])).toBe(
				"Skills: skill1, skill2, skill3",
			);
		});
	});
});