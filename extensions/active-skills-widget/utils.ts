export function buildSkillsLabel(skills: string[]): string {
	return skills.length > 0 ? `Skills: ${skills.join(", ")}` : "No skill loaded";
}