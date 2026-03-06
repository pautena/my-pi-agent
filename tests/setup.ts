import { afterEach, beforeEach } from "vitest";

beforeEach(() => {
	// Set up environment variables for testing
	process.env.OLLAMA_API_KEY = "test-api-key";
	process.env.OLLAMA_WEB_SEARCH_BASE_URL = "https://test.ollama.com";
});

afterEach(() => {
	// Clean up environment variables
	Reflect.deleteProperty(process.env, "OLLAMA_API_KEY");
	Reflect.deleteProperty(process.env, "OLLAMA_WEB_SEARCH_BASE_URL");
});
