# Nest

Typed nested-object helpers for reading, writing, parsing, and traversing object-shaped data.

## Import

```ts
import {
  Nest,
  ReadonlyNest,
  ReadonlyPath,
  nest,
  formDataToObject,
  isObject,
  makeArray,
  makeObject,
  objectFromArgs,
  objectFromFormData,
  objectFromJson,
  objectFromQuery,
  shouldBeAnArray
} from '@stackpress/lib';
```

## When To Use It

Use `Nest` when your data is object-shaped, path-driven, or assembled from query strings, CLI args, or form payloads. Use `ReadonlyNest` when callers should only read. Use `ReadonlyPath` or `withPath` when dot notation is more convenient than variadic keys.

## API

### Constructor

```ts
const config = new Nest({
  database: {
    host: 'localhost',
    port: 5432
  }
});
```

`Nest.load(data?)` starts a typed builder chain and narrows the stored type as `.set()` calls are added.

### Properties

| Name | Type | Notes |
| --- | --- | --- |
| `data` | `M` | Raw nested object. `Nest` enforces plain-object assignment. |
| `size` | `number` | Top-level key count. |
| `withArgs` | `ArgString` | Parses CLI-style arguments into the same store. |
| `withFormData` | `FormData` | Parses multipart payloads into the same store. |
| `withPath` | `PathString` on `Nest`, `ReadonlyPath` on `ReadonlyNest` | Dot-path access helpers. |
| `withQuery` | `QueryString` | Parses query strings into the same store. |

### ReadonlyNest Methods

| Method | Returns | Notes |
| --- | --- | --- |
| `entries()` | `[string, unknown][]` | Top-level entries. |
| `forEach(...path, callback)` | `Promise<boolean>` | Iterates arrays, objects, or strings at a path. Stops early when the callback returns `false`. |
| `get(...path)` | typed value | Returns `undefined` when the path is missing. |
| `has(...path)` | `boolean` | Tests whether a path is set. |
| `keys()` | `string[]` | Top-level keys. |
| `path(notation, defaults?)` | typed value | Dot-path read helper. |
| `toString(expand = true, ...path)` | `string` | JSON output for the whole store or a subpath. |
| `values()` | `unknown[]` | Top-level values. |

### Nest Methods

| Method | Returns | Notes |
| --- | --- | --- |
| `clear()` | `Nest<{}>` | Resets the store to an empty object. |
| `delete(...path)` | `this` | Removes one path if it exists. |
| `set(object)` | narrowed `Nest` | Merges top-level keys from a plain object. |
| `set(...path, value)` | narrowed `Nest` | Writes a nested value. Empty-string or `null` path segments append array items. |

### Path Helpers

`ReadonlyPath` provides:

- `get(notation, separator = '.')`
- `has(notation, separator = '.')`
- `forEach(notation, callback, separator = '.')`

`PathString` adds:

- `set(notation, value, separator = '.')`
- `delete(notation, separator = '.')`

### Callable Helper

`nest(data?)` returns a callable store:

```ts
const store = nest({ user: { name: 'Ada' } });

store('user', 'name');
store.get('user', 'name');
store.set('user', 'active', true);
```

The callable form keeps the `Nest` methods and reads through function invocation.

### Exported Utilities

| Export | Purpose |
| --- | --- |
| `formDataToObject(type, body)` | Converts JSON, urlencoded, or multipart bodies into a plain object. |
| `isObject(value)` | Tests for plain JavaScript objects. |
| `makeArray(object)` | Converts object-like numeric keys to an array. |
| `makeObject(array)` | Converts an array to an object with numeric keys. |
| `objectFromArgs(args)` | Parses CLI args to a plain object. |
| `objectFromJson(json)` | Parses JSON safely. |
| `objectFromQuery(query)` | Parses query strings to nested objects. |
| `objectFromFormData(data)` | Parses multipart form data to nested objects. |
| `shouldBeAnArray(object)` | Detects when a nested object should be normalized to an array. |

## Example

```ts
import { Nest } from '@stackpress/lib';

const request = new Nest();

request.withQuery.set('filter[type]=user&tags[]=one&tags[]=two');
request.set('meta', 'loaded', true);
request.withPath.set('profile.name', 'Ada');

const type = request.get('filter', 'type');
const firstTag = request.path<string>('tags.0');
const profile = request.get('profile');
```

## Related

- [Parsers](./Parsers.md)
- [Map](./Map.md)
- [Set](./Set.md)
- [Types](../types/README.md)
