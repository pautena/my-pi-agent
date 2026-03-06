import type {
	ExtensionAPI,
	ExtensionContext,
} from "@mariozechner/pi-coding-agent";
import { ENTRY_TYPE } from "./types.js";
import { updateStatus } from "./ui.js";

export function refreshFromSession(
	ctx: ExtensionContext,
	pi: ExtensionAPI,
): Set<string> {
	const loadedSkills = new Set<string>();
	for (const entry of ctx.sessionManager.getEntries()) {
		if (entry.type === "custom" && entry.customType === ENTRY_TYPE) {
			const data = entry.data as { name?: string } | undefined;
			const name = data?.name;
			if (typeof name === "string" && name.trim().length > 0) {
				loadedSkills.add(name);
			}
		}
	}
	updateStatus(Array.from(loadedSkills), ctx);
	return loadedSkills;
}

export function addSkill(
	name: string,
	loadedSkills: Set<string>,
	ctx: ExtensionContext,
	pi: ExtensionAPI,
): Set<string> {
	if (loadedSkills.has(name)) {
		return loadedSkills;
	}
	loadedSkills.add(name);
	pi.appendEntry(ENTRY_TYPE, { name });
	updateStatus(Array.from(loadedSkills), ctx);
	return loadedSkills;
}

export function handleInput(
	event: unknown,
	ctx: ExtensionContext,
	pi: ExtensionAPI,
	loadedSkills: Set<string>,
): { action: "continue" } {
	const inputEvent = event as { source?: string; text: string };
	if (inputEvent.source === "extension") {
		return { action: "continue" };
	}

	const prefix = "/skill:";
	if (!inputEvent.text.startsWith(prefix)) {
		return { action: "continue" };
	}

	const remainder = inputEvent.text.slice(prefix.length).trim();
	if (!remainder) {
		return { action: "continue" };
	}

	const name = remainder.split(/\s+/)[0];
	if (name) {
		addSkill(name, loadedSkills, ctx, pi);
	}

	return { action: "continue" };
}
