import type {
	ExtensionAPI,
	ExtensionContext,
} from "@mariozechner/pi-coding-agent";
import { vi } from "vitest";

/**
 * Mock ExtensionAPI for testing Pi extensions
 */
export function createMockExtensionAPI(): ExtensionAPI {
	return {
		on: vi.fn(),
		appendEntry: vi.fn(),
		registerTool: vi.fn(),
	} as unknown as ExtensionAPI;
}

/**
 * Mock ExtensionContext for testing Pi extensions
 */
export function createMockExtensionContext(
	options: {
		hasUI?: boolean;
		entries?: Array<{
			type: string;
			customType?: string;
			data?: unknown;
		}>;
	} = {},
): ExtensionContext {
	const entries = options.entries ?? [];

	return {
		hasUI: options.hasUI ?? true,
		sessionManager: {
			getEntries: vi.fn(() => entries),
		},
		ui: {
			setStatus: vi.fn(),
			theme: {
				fg: vi.fn((color: string, text: string) => text),
			},
		},
	} as unknown as ExtensionContext;
}

/**
 * Complete mock setup for active-skills-widget tests
 * Returns both API and context mocks along with utility objects
 */
export function mockActiveSkillsWidget() {
	const loadedSkills = new Set<string>();
	const entries: Array<{
		type: string;
		customType?: string;
		data?: unknown;
	}> = [];

	const mockApi = {
		on: vi.fn(),
		appendEntry: vi.fn((type: string, data: unknown) => {
			entries.push({ type, customType: type, data });
		}),
		registerTool: vi.fn(),
	} as unknown as ExtensionAPI;

	const mockContext = {
		hasUI: true,
		sessionManager: {
			getEntries: vi.fn(() => entries),
		},
		ui: {
			setStatus: vi.fn(),
			theme: {
				fg: vi.fn((color: string, text: string) => text),
			},
		},
	} as unknown as ExtensionContext;

	return { mockApi, mockContext, entries, loadedSkills };
}

/**
 * Type helper to access mock calls from registerTool
 */
export type MockRegisterTool = {
	registerTool: ReturnType<typeof vi.fn>;
};
