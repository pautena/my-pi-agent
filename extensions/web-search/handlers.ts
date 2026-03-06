import type { RequestResult } from "./types.js";
import { getApiKey, resolveBaseUrl } from "./types.js";
import { truncate } from "./utils.js";

export async function requestJson(
	endpoint: string,
	body: Record<string, unknown>,
	signal?: AbortSignal,
): Promise<RequestResult> {
	const apiKey = getApiKey();
	if (!apiKey) {
		return {
			ok: false,
			message:
				"OLLAMA_API_KEY is not set. Configure it in your environment to use Ollama web search.",
		};
	}

	const url = `${resolveBaseUrl()}${endpoint}`;
	let response: Response;

	try {
		response = await fetch(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${apiKey}`,
			},
			body: JSON.stringify(body),
			signal,
		});
	} catch (error) {
		return {
			ok: false,
			message: `Failed to reach Ollama web search endpoint (${url}): ${String(error)}`,
		};
	}

	const text = await response.text();
	if (!response.ok) {
		const detail = text ? ` Response: ${truncate(text)}` : "";
		return {
			ok: false,
			message: `Ollama web search request failed (${response.status} ${response.statusText}).${detail}`,
		};
	}

	if (!text.trim()) {
		return {
			ok: false,
			message: `Ollama web search returned an empty response from ${url}.`,
		};
	}

	try {
		return { ok: true, data: JSON.parse(text) as unknown };
	} catch (error) {
		return {
			ok: false,
			message: `Failed to parse JSON response from ${url}: ${String(error)}. Raw: ${truncate(
				text,
			)}`,
		};
	}
}
