import { debugForFile } from "debug-for-file";

import { enumerateProjectFiles } from "./files.js";
import { getChangedFiles } from "./git.js";
import { buildDependencyGraph, reverseGraph } from "./graph.js";
import { collectImpactedFiles } from "./impacted.js";
import { parseFileSpecifiers } from "./parse.js";
import { createResolveSpecifier } from "./resolve.js";
import { runCommand } from "./run.js";
import { RunOnChangedDependencies, RunOnChangedSettings } from "./types.js";

const log = debugForFile(import.meta.url);

export async function runOnChanged(
	settings: RunOnChangedSettings,
	dependencies?: Partial<RunOnChangedDependencies>,
): Promise<number> {
	const deps = { ...createDefaultDependencies(settings), ...dependencies };

	const changedFiles = await deps.getChangedFiles(settings);
	log("%d changed file(s): %O", changedFiles.length, changedFiles);
	if (!changedFiles.length) {
		console.log("No changed files. Skipping.");
		return 0;
	}

	const projectFiles = await deps.enumerateProjectFiles(settings);
	log("%d project file(s) in the dependency graph", projectFiles.length);

	const fileSpecifiers = await Promise.all(
		projectFiles.map(deps.parseFileSpecifiers),
	);

	const graph = buildDependencyGraph(fileSpecifiers, deps.resolveSpecifier);
	const dependents = reverseGraph(graph);
	const impactedFiles = [
		...collectImpactedFiles(changedFiles, dependents),
	].sort();
	log(
		"%d impacted file(s):\n%s",
		impactedFiles.length,
		impactedFiles.join("\n"),
	);

	const [command, ...commandArgs] = settings.command;
	log("running: %s %O", command, commandArgs);

	return deps.runCommand(command, [...commandArgs, ...impactedFiles]);
}

function createDefaultDependencies(
	settings: RunOnChangedSettings,
): RunOnChangedDependencies {
	return {
		enumerateProjectFiles,
		getChangedFiles,
		parseFileSpecifiers,
		resolveSpecifier: createResolveSpecifier(settings),
		runCommand,
	};
}
