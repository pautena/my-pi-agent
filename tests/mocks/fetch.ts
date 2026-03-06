import { vi } from "vitest";

/**
 * Create a mock fetch function for testing API calls
 */
export function createMockFetch() {
	return vi.fn();
}

/**
 * Setup global fetch mock
 * Returns the mock function for use in tests
 */
export function setupMockFetch() {
	const mockFetch = createMockFetch();
	global.fetch = mockFetch;
	return mockFetch;
}

/**
 * Create a successful fetch response
 */
export function createSuccessResponse(data: unknown) {
	return {
		ok: true,
		text: async () => JSON.stringify(data),
	};
}

/**
 * Create an error fetch response
 */
export function createErrorResponse(
	status: number,
	statusText: string,
	body?: string,
) {
	return {
		ok: false,
		status,
		statusText,
		text: async () => body ?? statusText,
	};
}
