import { execFile } from "node:child_process";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";

import { getChangedFiles, gitMaxBuffer, isJsTsFile } from "./git.js";

vi.mock("node:child_process", () => ({ execFile: vi.fn() }));

const cwd = "/project";

function mockGit(outputs: Record<string, string>) {
	vi.mocked(execFile).mockImplementation(((...args: unknown[]) => {
		const gitArgs = args[1] as string[];
		const callback = args.at(-1) as (
			error: null,
			result: { stderr: string; stdout: string },
		) => void;
		callback(null, { stderr: "", stdout: outputs[gitArgs[0]] ?? "" });
	}) as unknown as typeof execFile);
}

describe(isJsTsFile, () => {
	it("returns true when the file has a JS or TS extension", () => {
		expect(isJsTsFile("a.tsx")).toBe(true);
	});

	it("returns false when the file is not JS or TS", () => {
		expect(isJsTsFile("a.json")).toBe(false);
	});
});

describe(getChangedFiles, () => {
	it("combines diffed and untracked files when no ref is provided", async () => {
		mockGit({ diff: "src/a.ts\n", "ls-files": "src/b.ts\n" });

		const changed = await getChangedFiles({ command: [], cwd });

		expect(changed).toEqual([
			path.resolve(cwd, "src/a.ts"),
			path.resolve(cwd, "src/b.ts"),
		]);
	});

	it("diffs against the ref when since is provided", async () => {
		mockGit({ diff: "src/a.ts\n" });

		const changed = await getChangedFiles({ command: [], cwd, since: "main" });

		expect(vi.mocked(execFile).mock.calls[0][1]).toEqual([
			"diff",
			"--name-only",
			"--diff-filter=d",
			"main",
		]);
		expect(changed).toEqual([path.resolve(cwd, "src/a.ts")]);
	});

	it("excludes files that are not JS or TS", async () => {
		mockGit({ diff: "src/a.ts\nREADME.md\n", "ls-files": "" });

		const changed = await getChangedFiles({ command: [], cwd });

		expect(changed).toEqual([path.resolve(cwd, "src/a.ts")]);
	});

	it("passes an unbounded maxBuffer to git so large repositories do not overflow", async () => {
		mockGit({ diff: "src/a.ts\n" });

		await getChangedFiles({ command: [], cwd, since: "main" });

		expect(vi.mocked(execFile).mock.calls[0][2]).toEqual({
			cwd,
			maxBuffer: gitMaxBuffer,
		});
	});
});
