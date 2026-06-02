import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";

import { RunOnChangedSettings } from "./types.js";

const execFileAsync = promisify(execFile);

// `git ls-files` and `git diff` output scales with the size of the repository and can
// exceed Node's default 1MB execFile maxBuffer on large repositories. Opt out of the limit.
export const gitMaxBuffer = Infinity;

const jsTsExtensions = new Set([
	".cjs",
	".cts",
	".js",
	".jsx",
	".mjs",
	".mts",
	".ts",
	".tsx",
]);

export async function getChangedFiles(
	settings: RunOnChangedSettings,
): Promise<string[]> {
	const { cwd, since } = settings;

	const relativePaths = since
		? await git(cwd, ["diff", "--name-only", "--diff-filter=d", since])
		: [
				...(await git(cwd, ["diff", "--name-only", "--diff-filter=d", "HEAD"])),
				...(await git(cwd, ["ls-files", "--others", "--exclude-standard"])),
			];

	return [...new Set(relativePaths)]
		.filter(isJsTsFile)
		.map((relativePath) => path.resolve(cwd, relativePath));
}

export function isJsTsFile(filePath: string): boolean {
	return jsTsExtensions.has(path.extname(filePath));
}

async function git(cwd: string, args: string[]): Promise<string[]> {
	const { stdout } = await execFileAsync("git", args, {
		cwd,
		maxBuffer: gitMaxBuffer,
	});

	return stdout.split("\n").filter(Boolean);
}
