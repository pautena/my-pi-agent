import type { ExtensionContext } from "@mariozechner/pi-coding-agent";
import { STATUS_ID } from "./types.js";
import { buildSkillsLabel } from "./utils.js";

export function updateStatus(skills: string[], ctx: ExtensionContext): void {
	if (!ctx.hasUI) {
		return;
	}

	const label = buildSkillsLabel(skills);
	ctx.ui.setStatus(STATUS_ID, ctx.ui.theme.fg("dim", label));
}
