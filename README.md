<h1 align="center">Run on Changed</h1>

<p align="center">
	Runs a command on all files transitively impacted by changes in JS/TS files.
	🎯
</p>

<p align="center">
	<!-- prettier-ignore-start -->
	<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
	<a href="#contributors" target="_blank"><img alt="👪 All Contributors: 1" src="https://img.shields.io/badge/%F0%9F%91%AA_all_contributors-1-21bb42.svg" /></a>
<!-- ALL-CONTRIBUTORS-BADGE:END -->
	<!-- prettier-ignore-end -->
	<a href="https://github.com/JoshuaKGoldberg/run-on-changed/blob/main/.github/CODE_OF_CONDUCT.md" target="_blank"><img alt="🤝 Code of Conduct: Kept" src="https://img.shields.io/badge/%F0%9F%A4%9D_code_of_conduct-kept-21bb42" /></a>
	<a href="https://codecov.io/gh/JoshuaKGoldberg/run-on-changed" target="_blank"><img alt="🧪 Coverage" src="https://img.shields.io/codecov/c/github/JoshuaKGoldberg/run-on-changed?label=%F0%9F%A7%AA%20coverage" /></a>
	<a href="https://github.com/JoshuaKGoldberg/run-on-changed/blob/main/LICENSE.md" target="_blank"><img alt="📝 License: MIT" src="https://img.shields.io/badge/%F0%9F%93%9D_license-MIT-21bb42.svg" /></a>
	<a href="http://npmjs.com/package/run-on-changed" target="_blank"><img alt="📦 npm version" src="https://img.shields.io/npm/v/run-on-changed?color=21bb42&label=%F0%9F%93%A6%20npm" /></a>
	<img alt="💪 TypeScript: Strict" src="https://img.shields.io/badge/%F0%9F%92%AA_typescript-strict-21bb42.svg" />
</p>

## Usage

Run a command on every file transitively impacted by your changed JS/TS files.
The import/export graph is parsed in-memory with the native [oxc](https://oxc.rs) parser and resolver, so a file is included whenever it (transitively) imports something you changed — exactly what typed linting needs.

### CLI

Pass the command to run after `--`; impacted file paths are appended as arguments:

```shell
npx run-on-changed -- npx eslint --fix
```

By default it uses your working-tree changes.
Diff against a base ref instead with `--since`, and override which files form the graph with one or more `--files` globs:

```shell
npx run-on-changed --since origin/main -- npx eslint
npx run-on-changed --files "src/**/*.ts" -- npx prettier --write
```

TypeScript path aliases (`compilerOptions.paths`) are resolved from a `tsconfig.json` in the current directory, so aliased imports are followed just like relative ones.
Point at a different config with `--tsconfig`:

```shell
npx run-on-changed --tsconfig configs/tsconfig.json -- npx eslint
```

### Node.js API

```ts
import { runOnChanged } from "run-on-changed";

const exitCode = await runOnChanged({
	command: ["npx", "eslint", "--fix"],
	cwd: process.cwd(),
	since: "origin/main", // optional
	files: ["src/**/*.ts"], // optional
	tsconfig: "configs/tsconfig.json", // optional
});
```

### Debugging

run-on-changed logs what it decides through [`debug-for-file`](https://github.com/JoshuaKGoldberg/debug-for-file).
Set the `DEBUG` environment variable to see the changed files, the project-file count, and the full list of impacted files handed to your command:

```shell
DEBUG=run-on-changed:* npx run-on-changed --since origin/main -- eslint
```

`runOnChanged` returns the spawned command's exit code, or `0` when nothing is impacted.
Lower-level building blocks (`buildDependencyGraph`, `reverseGraph`, `collectImpactedFiles`, `parseFileSpecifiers`, `createResolveSpecifier`, `getChangedFiles`, `enumerateProjectFiles`) are exported too.

## Development

See [`.github/CONTRIBUTING.md`](./.github/CONTRIBUTING.md), then [`.github/DEVELOPMENT.md`](./.github/DEVELOPMENT.md).
Thanks! 🎯

## Contributors

<!-- spellchecker: disable -->
<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center"><a href="http://www.joshuakgoldberg.com"><img src="https://avatars.githubusercontent.com/u/3335181?v=4?s=100" width="100px;" alt="Josh Goldberg ✨"/><br /><sub><b>Josh Goldberg ✨</b></sub></a><br /><a href="https://github.com/JoshuaKGoldberg/run-on-changed/commits?author=JoshuaKGoldberg" title="Code">💻</a> <a href="#content-JoshuaKGoldberg" title="Content">🖋</a> <a href="https://github.com/JoshuaKGoldberg/run-on-changed/commits?author=JoshuaKGoldberg" title="Documentation">📖</a> <a href="#ideas-JoshuaKGoldberg" title="Ideas, Planning, & Feedback">🤔</a> <a href="#infra-JoshuaKGoldberg" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="#maintenance-JoshuaKGoldberg" title="Maintenance">🚧</a> <a href="#projectManagement-JoshuaKGoldberg" title="Project Management">📆</a> <a href="#tool-JoshuaKGoldberg" title="Tools">🔧</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->
<!-- spellchecker: enable -->

> 💝 This package was templated with [`create-typescript-app`](https://github.com/JoshuaKGoldberg/create-typescript-app) using the [Bingo framework](https://create.bingo).
