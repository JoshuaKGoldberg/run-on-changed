import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";
import { glob } from "tinyglobby";

import { gitMaxBuffer, isJsTsFile } from "./git.js";
import { RunOnChangedSettings } from "./types.js";

const execFileAsync = promisify(execFile);

export async function enumerateProjectFiles(
	settings: RunOnChangedSettings,
): Promise<string[]> {
	const { cwd, files } = settings;

	if (files?.length) {
		return glob(files, { absolute: true, cwd });
	}

	const { stdout } = await execFileAsync("git", ["ls-files"], {
		cwd,
		maxBuffer: gitMaxBuffer,
	});

	return stdout
		.split("\n")
		.filter(Boolean)
		.filter(isJsTsFile)
		.map((relativePath) => path.resolve(cwd, relativePath));
}
