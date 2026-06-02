export type DependencyGraph = Map<string, Set<string>>;

export type DependentsGraph = Map<string, Set<string>>;

export interface FileSpecifiers {
	filePath: string;
	specifiers: string[];
}

export type ResolveSpecifier = (
	fromDirectory: string,
	specifier: string,
) => string | undefined;

export interface RunOnChangedDependencies {
	enumerateProjectFiles: (settings: RunOnChangedSettings) => Promise<string[]>;
	getChangedFiles: (settings: RunOnChangedSettings) => Promise<string[]>;
	parseFileSpecifiers: (filePath: string) => Promise<FileSpecifiers>;
	resolveSpecifier: ResolveSpecifier;
	runCommand: (command: string, args: string[]) => Promise<number>;
}

export interface RunOnChangedSettings {
	command: string[];
	cwd: string;
	files?: string[];
	since?: string;
	tsconfig?: string;
}
