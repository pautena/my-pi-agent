export const DEFAULT_BASE_URL = "https://ollama.com";

export type RequestResult =
	| { ok: true; data: unknown }
	| { ok: false; message: string };

export function resolveBaseUrl(): string {
	const envBaseUrl = process.env.OLLAMA_WEB_SEARCH_BASE_URL;
	return (envBaseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, "");
}

export function getApiKey(): string | null {
	return process.env.OLLAMA_API_KEY ?? null;
}
