import { Type } from "@sinclair/typebox";

export function truncate(text: string, maxLength = 2000): string {
	if (text.length <= maxLength) {
		return text;
	}
	return `${text.slice(0, maxLength)}…`;
}

export function toErrorResponse(message: string) {
	return {
		content: [{ type: "text", text: message }],
		details: { error: message },
		isError: true,
	} as const;
}

export function toSuccessResponse(data: unknown) {
	return {
		content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
		details: { data },
	} as const;
}

export const webSearchTool = {
	name: "web_search",
	label: "Web Search",
	description:
		"Search the web for information. Use this tool to find relevant web pages, articles, documentation, or answers to questions. For fetching/downloading the full content of a specific webpage, use the appropriate web fetch tool instead.",
	parameters: Type.Object({
		query: Type.String({ description: "Search query" }),
		maxResults: Type.Optional(
			Type.Integer({ description: "Max results (default: 3)", minimum: 1 }),
		),
	}),
};

export const webFetchTool = {
	name: "web_fetch",
	label: "Web Fetch",
	description:
		"Fetch the full content of a web page by URL. Use this to retrieve the complete content of a specific page. For searching the web to find relevant pages, use the web_search tool instead.",
	parameters: Type.Object({
		url: Type.String({ description: "Absolute URL to fetch" }),
	}),
};