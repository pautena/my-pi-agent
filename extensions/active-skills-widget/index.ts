import type {
	ExtensionAPI,
	ExtensionContext,
	InputEvent,
} from "@mariozechner/pi-coding-agent";

const ENTRY_TYPE = "active-skill";
const STATUS_ID = "active-skills";

function buildSkillsLabel(skills: string[]): string {
	return skills.length > 0 ? `Skills: ${skills.join(", ")}` : "No skill loaded";
}

function updateStatus(skills: string[], ctx: ExtensionContext) {
	if (!ctx.hasUI) {
		return;
	}

	const label = buildSkillsLabel(skills);
	ctx.ui.setStatus(STATUS_ID, ctx.ui.theme.fg("dim", label));
}

export default function (pi: ExtensionAPI) {
	let loadedSkills = new Set<string>();

	const refreshFromSession = (ctx: ExtensionContext) => {
		loadedSkills = new Set();
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
	};

	const addSkill = (name: string, ctx: ExtensionContext) => {
		if (loadedSkills.has(name)) {
			return;
		}
		loadedSkills.add(name);
		pi.appendEntry(ENTRY_TYPE, { name });
		updateStatus(Array.from(loadedSkills), ctx);
	};

	pi.on("session_start", (_event: unknown, ctx: ExtensionContext) => {
		refreshFromSession(ctx);
	});

	pi.on("session_switch", (_event: unknown, ctx: ExtensionContext) => {
		refreshFromSession(ctx);
	});

	pi.on("input", (event: unknown, ctx: ExtensionContext) => {
		const inputEvent = event as InputEvent;
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
			addSkill(name, ctx);
		}

		return { action: "continue" };
	});
}
