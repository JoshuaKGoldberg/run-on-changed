import { existsSync } from "node:fs";
import path from "node:path";
import { ResolverFactory } from "oxc-resolver";

import { ResolveSpecifier } from "./types.js";

export interface CreateResolveSpecifierSettings {
	cwd: string;
	tsconfig?: string;
}

export function createResolveSpecifier(
	settings: CreateResolveSpecifierSettings = { cwd: process.cwd() },
): ResolveSpecifier {
	const configFile = resolveConfigFile(settings);

	const resolver = new ResolverFactory({
		conditionNames: ["node", "import", "default"],
		extensionAlias: {
			".cjs": [".cts", ".cjs"],
			".js": [".ts", ".tsx", ".js"],
			".mjs": [".mts", ".mjs"],
		},
		extensions: [".ts", ".tsx", ".mts", ".cts", ".js", ".jsx", ".mjs", ".cjs"],
		// Honoring tsconfig's `compilerOptions.paths` lets us follow aliased imports
		// (e.g. `import x from "app/utils/foo"`), not just relative ones.
		...(configFile && { tsconfig: { configFile, references: "auto" } }),
	});

	return (fromDirectory, specifier) => {
		const { path } = resolver.sync(fromDirectory, specifier);
		if (!path || path.includes("node_modules")) {
			return undefined;
		}

		return path;
	};
}

function resolveConfigFile({
	cwd,
	tsconfig,
}: CreateResolveSpecifierSettings): string | undefined {
	const configFile = tsconfig
		? path.resolve(cwd, tsconfig)
		: path.join(cwd, "tsconfig.json");

	return existsSync(configFile) ? configFile : undefined;
}
