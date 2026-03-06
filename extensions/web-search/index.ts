import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { requestJson } from "./handlers.js";
import {
	toErrorResponse,
	toSuccessResponse,
	webSearchTool,
	webFetchTool,
} from "./utils.js";

export default function registerWebSearch(pi: ExtensionAPI) {
	pi.registerTool({
		...webSearchTool,
		async execute(
			_toolCallId: string,
			params: { query: string; maxResults?: number },
			signal?: AbortSignal,
		) {
			const maxResults = params.maxResults ?? 3;
			const response = await requestJson(
				"/api/web_search",
				{ query: params.query, max_results: maxResults },
				signal,
			);

			if (!response.ok) {
				return toErrorResponse(response.message);
			}

			return toSuccessResponse(response.data);
		},
	});

	pi.registerTool({
		...webFetchTool,
		async execute(
			_toolCallId: string,
			params: { url: string },
			signal?: AbortSignal,
		) {
			const response = await requestJson(
				"/api/web_fetch",
				{ url: params.url },
				signal,
			);

			if (!response.ok) {
				return toErrorResponse(response.message);
			}

			return toSuccessResponse(response.data);
		},
	});
}