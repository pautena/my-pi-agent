import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		globals: true,
		environment: "node",
		setupFiles: ["./tests/setup.ts"],
		include: ["tests/**/*.test.ts"],
		exclude: ["node_modules", "dist"],
		coverage: {
			provider: "v8",
			reporter: ["text", "json", "html"],
			include: ["extensions/**/*.ts"],
			exclude: ["node_modules", "tests"],
		},
	},
	resolve: {
		alias: {
			"@tests": resolve(__dirname, "./tests"),
		},
	},
});
