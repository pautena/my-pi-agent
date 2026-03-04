import type { ExtensionAPI, ExtensionContext } from "@mariozechner/pi-coding-agent";
import { Type } from "@sinclair/typebox";

const DEFAULT_BASE_URL = "https://ollama.com";

function resolveBaseUrl(): string {
  const envBaseUrl = process.env.OLLAMA_WEB_SEARCH_BASE_URL;
  return (envBaseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, "");
}

function getApiKey(): string | null {
  return process.env.OLLAMA_API_KEY ?? null;
}

function truncate(text: string, maxLength = 2000): string {
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, maxLength)}…`;
}

type RequestResult =
  | { ok: true; data: unknown }
  | { ok: false; message: string };

async function requestJson(
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

function toErrorResponse(message: string) {
  return {
    content: [{ type: "text", text: message }],
    details: { error: message },
    isError: true,
  } as const;
}

function toSuccessResponse(data: unknown) {
  return {
    content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    details: { data },
  } as const;
}

export default function registerOllamaWebSearch(pi: ExtensionAPI) {
  pi.registerTool({
    name: "ollama_web_search",
    label: "Ollama Web Search",
    description:
      "Search the web via Ollama's hosted search API (requires OLLAMA_API_KEY).",
    parameters: Type.Object({
      query: Type.String({ description: "Search query" }),
      maxResults: Type.Optional(
        Type.Integer({ description: "Max results (default: 3)", minimum: 1 }),
      ),
    }),
    async execute(_toolCallId, params, signal) {
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
    name: "ollama_web_fetch",
    label: "Ollama Web Fetch",
    description:
      "Fetch a web page via Ollama's hosted web fetch API (requires OLLAMA_API_KEY).",
    parameters: Type.Object({
      url: Type.String({ description: "Absolute URL to fetch" }),
    }),
    async execute(_toolCallId, params, signal) {
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
