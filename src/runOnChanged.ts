import { enumerateProjectFiles } from "./files.js";
import { getChangedFiles } from "./git.js";
import { buildDependencyGraph, reverseGraph } from "./graph.js";
import { collectImpactedFiles } from "./impacted.js";
import { parseFileSpecifiers } from "./parse.js";
import { createResolveSpecifier } from "./resolve.js";
import { runCommand } from "./run.js";
import { RunOnChangedDependencies, RunOnChangedSettings } from "./types.js";

export async function runOnChanged(
	settings: RunOnChangedSettings,
	dependencies?: Partial<RunOnChangedDependencies>,
): Promise<number> {
	const deps = { ...createDefaultDependencies(settings), ...dependencies };

	const changedFiles = await deps.getChangedFiles(settings);
	if (!changedFiles.length) {
		console.log("No changed JS/TS files. Skipping.");
		return 0;
	}

	const projectFiles = await deps.enumerateProjectFiles(settings);
	const fileSpecifiers = await Promise.all(
		projectFiles.map(deps.parseFileSpecifiers),
	);

	const graph = buildDependencyGraph(fileSpecifiers, deps.resolveSpecifier);
	const dependents = reverseGraph(graph);
	const impacted = collectImpactedFiles(changedFiles, dependents);

	const [command, ...commandArgs] = settings.command;

	return deps.runCommand(command, [...commandArgs, ...[...impacted].sort()]);
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
