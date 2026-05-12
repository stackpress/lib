# AGENTS.md

Working rules for `@stackpress/lib`.

## Repo role

`@stackpress/lib` is the shared low-level TypeScript utility package for
Stackpress projects. It is a standalone package repo, not the main monorepo.

## Layout

- `src/`: source of truth
- `tests/`: mocha/ts-mocha tests
- `docs/`: API docs
- `cjs/`, `esm/`: generated build output
- `tsconfig/`: published presets
- `src/index.ts`: public re-export surface
- `src/types.ts`: shared types
- `package.json`: exports, scripts, publish surface

## Main areas

- `src/data/`: nested data, readonly wrappers, parsers
- `src/emitter/`: event emitters
- `src/queue/`: queue primitives
- `src/router/`: request, response, session, terminal, router
- `src/system/`: filesystem and module loading

If a change is public, check `src/index.ts` and `package.json` exports.

## Runtime and commands

Use Node.js `>=22`. Do not assume the default `node` on `PATH` qualifies.
Prefer this lookup order before running Node commands:

1. Check `nvm`.
2. Prefer a Node `22+` binary from the NVM versions directory.
3. If needed, use `nvm` itself to inspect/select Node `22+`.
4. Fall back to common install paths.
5. Inspect `PATH`, `NVM_DIR`, and related env vars.
6. If no Node `22+` is found, stop and ask the user.

Use `yarn`, not `npm`, unless the user explicitly asks otherwise.

Key commands:

- `yarn test`
- `yarn build`
- `yarn build:tsc:cjs`
- `yarn build:tsc:esm`

Tests run with `ts-mocha -r tsx`. Tests import from `../src/...` without
extensions. Source files use local ESM imports with `.js` extensions.

## Edit rules

- Edit `src/`, `tests/`, `docs/`, and package metadata as needed.
- Do not hand-edit `cjs/` or `esm/`; regenerate them with `yarn build`.
- Keep `src/index.ts`, `package.json` exports, and `typesVersions` aligned.
- Preserve the existing subsystem layout. Put new code in the closest module.

## Repo conventions

- Prefer small focused classes and helpers.
- Comments should be sparse and only explain non-obvious behavior.
- Behavioral changes usually need matching tests.

## Testing expectations

When behavior changes:

- add or update targeted tests in `tests/`
- run `yarn test`
- run `yarn build` if exports, types, or module wiring changed

Be careful around:

- `src/types.ts`
- `src/index.ts`
- `package.json` exports
- router/emitter interactions
- parsers in `src/data/processors/`

## Navigation

Start here by topic:

- data: `src/data/Nest.ts`, `src/data/Map.ts`, `src/data/Set.ts`
- routing: `src/router/Router.ts`, `src/router/Request.ts`, `src/router/Response.ts`
- events: `src/emitter/EventEmitter.ts`, `src/emitter/ExpressEmitter.ts`, `src/emitter/RouteEmitter.ts`
- file loading: `src/system/FileLoader.ts`, `src/system/NodeFS.ts`
- public API: `src/index.ts`, `package.json`

Helpful tests:

- `tests/Router.test.ts`
- `tests/EventEmitter.test.ts`
- `tests/FileLoader.test.ts`
- `tests/Nest.test.ts`

## Agent checklist

- Check `git status` before editing.
- Avoid overwriting unrelated local work.
- Prefer minimal changes with matching tests over broad refactors.
- If you add a public entry point, update docs and exports in the same pass.
- If docs and code disagree, trust tests and source first.
