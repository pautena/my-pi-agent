import type { ExtensionAPI, ExtensionContext } from "@mariozechner/pi-coding-agent";
import { refreshFromSession, handleInput } from "./handlers.js";

export default function (pi: ExtensionAPI) {
	let loadedSkills = new Set<string>();

	pi.on("session_start", (_event: unknown, ctx: ExtensionContext) => {
		loadedSkills = refreshFromSession(ctx, pi);
	});

	pi.on("session_switch", (_event: unknown, ctx: ExtensionContext) => {
		loadedSkills = refreshFromSession(ctx, pi);
	});

	pi.on("input", (event: unknown, ctx: ExtensionContext) => {
		return handleInput(event, ctx, pi, loadedSkills);
	});
}