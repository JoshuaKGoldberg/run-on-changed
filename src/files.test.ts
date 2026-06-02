import { execFile } from "node:child_process";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";

import { enumerateProjectFiles } from "./files.js";
import { gitMaxBuffer } from "./git.js";

vi.mock("node:child_process", () => ({ execFile: vi.fn() }));

const cwd = "/project";

function mockGit(stdout: string) {
	vi.mocked(execFile).mockImplementation(((...args: unknown[]) => {
		const callback = args.at(-1) as (
			error: null,
			result: { stderr: string; stdout: string },
		) => void;
		callback(null, { stderr: "", stdout });
	}) as unknown as typeof execFile);
}

describe(enumerateProjectFiles, () => {
	it("returns absolute paths to tracked JS/TS files when no files glob is provided", async () => {
		mockGit("src/a.ts\nREADME.md\n");

		const files = await enumerateProjectFiles({ command: [], cwd });

		expect(files).toEqual([path.resolve(cwd, "src/a.ts")]);
	});

	it("passes an unbounded maxBuffer to git so large repositories do not overflow", async () => {
		mockGit("src/a.ts\n");

		await enumerateProjectFiles({ command: [], cwd });

		expect(vi.mocked(execFile).mock.calls[0][2]).toEqual({
			cwd,
			maxBuffer: gitMaxBuffer,
		});
	});
});
