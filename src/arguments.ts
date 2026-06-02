import { parseArgs } from "node:util";

import { RunOnChangedSettings } from "./types.js";

const usage =
	"Usage: run-on-changed [--since <ref>] [--files <glob>]... [--tsconfig <path>] -- <command>";

export function parseArguments(argv: string[]): RunOnChangedSettings {
	const separator = argv.indexOf("--");
	if (separator === -1 || separator === argv.length - 1) {
		throw new Error(usage);
	}

	const { values } = parseArgs({
		args: argv.slice(0, separator),
		options: {
			files: { multiple: true, type: "string" },
			since: { type: "string" },
			tsconfig: { type: "string" },
		},
	});

	return {
		command: argv.slice(separator + 1),
		cwd: process.cwd(),
		files: values.files,
		since: values.since,
		tsconfig: values.tsconfig,
	};
}
