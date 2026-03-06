/**
 * Type definitions for @mariozechner/pi-coding-agent
 */

export interface ExtensionContext {
	hasUI: boolean;
	sessionManager: {
		getEntries(): SessionEntry[];
	};
	ui: {
		setStatus(id: string, content: string): void;
		theme: {
			fg(color: string, text: string): string;
		};
	};
}

export interface ExtensionAPI {
	on(event: string, handler: EventHandler): void;
	appendEntry(type: string, data: unknown): void;
	registerTool<P extends Record<string, unknown>>(
		tool: ToolDefinition<P>,
	): void;
}

export type EventHandler = (
	event: unknown,
	ctx: ExtensionContext,
	// biome-ignore lint/suspicious/noConfusingVoidType: void is valid here for handlers that don't return a value
) => void | HandlerResult;

export interface InputEvent {
	source: string;
	text: string;
}

export interface HandlerResult {
	action: "continue" | "stop";
}

export interface SessionEntry {
	type: string;
	customType?: string;
	data?: unknown;
}

export interface ToolDefinition<
	P extends Record<string, unknown> = Record<string, unknown>,
> {
	name: string;
	label: string;
	description: string;
	parameters: unknown;
	execute: ToolExecutor<P>;
}

export type ToolExecutor<
	P extends Record<string, unknown> = Record<string, unknown>,
> = (
	toolCallId: string,
	params: P,
	signal?: AbortSignal,
) => Promise<ToolResult>;

export interface ToolResult {
	content: readonly { type: "text"; text: string }[];
	isError?: boolean;
	details?: Record<string, unknown>;
}
