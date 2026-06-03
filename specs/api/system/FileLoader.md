# FileLoader

Filesystem abstraction for path resolution, module lookup, imports, and relative-path generation.

## Import

```ts
import { FileLoader, NodeFS, esmImport, include } from '@stackpress/lib';
```

## When To Use It

Use `FileLoader` when you need path normalization, `node_modules` lookup, JSON or module loading, or build-time path rewrites without coupling directly to `node:fs`.

## API

### Constructor

```ts
const loader = new FileLoader(new NodeFS());
```

You can pass a custom `cwd` as the second argument.

### Properties

| Name | Type | Notes |
| --- | --- | --- |
| `cwd` | `string` | Loader working directory. |
| `fs` | `FileSystem` | Filesystem implementation used by the loader. |

### Methods

| Method | Returns | Notes |
| --- | --- | --- |
| `absolute(pathname, pwd = cwd)` | `Promise<string>` | Resolves `@/`, relative paths, absolute paths, and package names. |
| `basepath(pathname)` | `string` | Removes one file extension when present. |
| `import(pathname, getDefault = false)` | `Promise<T>` | Loads JSON or JS modules. |
| `lib(pwd = cwd)` | `Promise<string>` | Resolves the `node_modules` directory containing `@stackpress/lib`. |
| `modules(pathname, pwd = cwd, meta = true)` | `Promise<string>` | Resolves the `node_modules` directory containing a package. |
| `relative(pathname, require, withExtname = false)` | `string` | Relative import path from one file to another. |
| `resolve(pathname, pwd = cwd, exists = false)` | `Promise<string \| null>` | Resolves files or directories. |
| `resolveFile(pathname, extnames = ['.js', '.json'], pwd = cwd, exists = false)` | `Promise<string \| null>` | File-oriented resolution. Checks the path directly, then tries each extension and `index` file. |

### Exported Helpers

| Export | Purpose |
| --- | --- |
| `esmImport(modulePath)` | Dynamic `import()` wrapper used to preserve ESM imports in CJS builds. |
| `include(modulePath)` | Convenience wrapper around `esmImport()` that unwraps some nested default exports. |

## Example

```ts
import { FileLoader, NodeFS } from '@stackpress/lib';

const loader = new FileLoader(new NodeFS());

const source = await loader.absolute('@/src/index.ts');
const relative = loader.relative('/project/src/a.ts', '/project/src/utils/b.ts');
const resolved = await loader.resolveFile('./plugin/foo', ['.ts', '.js']);
const config = await loader.import<Record<string, unknown>>('./package.json');
```

## Related

- [NodeFS](./NodeFS.md)
- [Types](../types/README.md)
