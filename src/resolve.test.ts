import { mkdir, mkdtemp, realpath, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { createResolveSpecifier } from "./resolve.js";

let directory: string;

beforeAll(async () => {
	directory = await realpath(
		await mkdtemp(path.join(tmpdir(), "run-on-changed-")),
	);
	await writeFile(path.join(directory, "target.ts"), "export const value = 1;");
});

afterAll(async () => {
	await rm(directory, { force: true, recursive: true });
});

describe(createResolveSpecifier, () => {
	it("resolves a .js specifier to its .ts source when the source exists", () => {
		const resolveSpecifier = createResolveSpecifier();

		const resolved = resolveSpecifier(directory, "./target.js");

		expect(resolved).toBe(path.join(directory, "target.ts"));
	});

	it("returns undefined when a relative specifier cannot be resolved", () => {
		const resolveSpecifier = createResolveSpecifier();

		const resolved = resolveSpecifier(directory, "./missing.js");

		expect(resolved).toBeUndefined();
	});

	it("returns undefined when a bare specifier resolves into node_modules", () => {
		const resolveSpecifier = createResolveSpecifier();

		const resolved = resolveSpecifier(process.cwd(), "oxc-parser");

		expect(resolved).toBeUndefined();
	});
});

describe("createResolveSpecifier with tsconfig path aliases", () => {
	let aliasDirectory: string;
	let plainDirectory: string;

	beforeAll(async () => {
		aliasDirectory = await realpath(
			await mkdtemp(path.join(tmpdir(), "run-on-changed-alias-")),
		);
		await mkdir(path.join(aliasDirectory, "src"));
		await writeFile(
			path.join(aliasDirectory, "src", "target.ts"),
			"export const value = 1;",
		);
		await writeFile(
			path.join(aliasDirectory, "tsconfig.json"),
			JSON.stringify({
				compilerOptions: { paths: { "alias/*": ["./src/*"] } },
			}),
		);

		plainDirectory = await realpath(
			await mkdtemp(path.join(tmpdir(), "run-on-changed-plain-")),
		);
	});

	afterAll(async () => {
		await rm(aliasDirectory, { force: true, recursive: true });
		await rm(plainDirectory, { force: true, recursive: true });
	});

	it("resolves an aliased specifier using the tsconfig found in cwd", () => {
		const resolveSpecifier = createResolveSpecifier({ cwd: aliasDirectory });

		const resolved = resolveSpecifier(aliasDirectory, "alias/target");

		expect(resolved).toBe(path.join(aliasDirectory, "src", "target.ts"));
	});

	it("resolves an aliased specifier using an explicitly provided tsconfig path", () => {
		const resolveSpecifier = createResolveSpecifier({
			cwd: aliasDirectory,
			tsconfig: "tsconfig.json",
		});

		const resolved = resolveSpecifier(aliasDirectory, "alias/target");

		expect(resolved).toBe(path.join(aliasDirectory, "src", "target.ts"));
	});

	it("returns undefined for an aliased specifier when cwd has no tsconfig", () => {
		const resolveSpecifier = createResolveSpecifier({ cwd: plainDirectory });

		const resolved = resolveSpecifier(plainDirectory, "alias/target");

		expect(resolved).toBeUndefined();
	});
});
