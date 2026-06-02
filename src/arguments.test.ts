import { describe, expect, it } from "vitest";

import { parseArguments } from "./arguments.js";

describe(parseArguments, () => {
	it("returns the command tokens when a command follows the separator", () => {
		const settings = parseArguments(["--", "npx", "eslint", "--fix"]);

		expect(settings.command).toEqual(["npx", "eslint", "--fix"]);
	});

	it("parses the ref when --since is provided before the separator", () => {
		const settings = parseArguments(["--since", "main", "--", "eslint"]);

		expect(settings.since).toBe("main");
	});

	it("collects globs when --files is provided more than once", () => {
		const settings = parseArguments([
			"--files",
			"src/**/*.ts",
			"--files",
			"test/**/*.ts",
			"--",
			"eslint",
		]);

		expect(settings.files).toEqual(["src/**/*.ts", "test/**/*.ts"]);
	});

	it("parses the path when --tsconfig is provided before the separator", () => {
		const settings = parseArguments([
			"--tsconfig",
			"configs/tsconfig.json",
			"--",
			"eslint",
		]);

		expect(settings.tsconfig).toBe("configs/tsconfig.json");
	});

	it("throws when there is no separator", () => {
		expect(() => parseArguments(["eslint"])).toThrow("Usage:");
	});

	it("throws when no command follows the separator", () => {
		expect(() => parseArguments(["--since", "main", "--"])).toThrow("Usage:");
	});
});
