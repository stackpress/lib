# Map

Extended `Map` utilities plus callable and readonly wrappers.

## Import

```ts
import { DataMap, ReadonlyMap, map } from '@stackpress/lib';
```

## When To Use It

Use `DataMap` when you want native `Map` semantics with collection helpers. Use `ReadonlyMap` when a consumer should not mutate the store. Use `map()` when you want a callable getter plus `Map` methods on one value.

## API

### Constructor

```ts
const users = new DataMap<string, number>([
  ['ada', 1],
  ['grace', 2]
]);
```

`ReadonlyMap` takes the same entry-array shape.

### DataMap Methods

| Method | Returns | Notes |
| --- | --- | --- |
| `filter(callback)` | new `DataMap` subclass | Filters entries by value and key. |
| `find(callback)` | `[K, V] \| undefined` | First matching entry. |
| `findKey(callback)` | `K \| undefined` | First matching key. |
| `findValue(callback)` | `V \| undefined` | First matching value. |
| `first()` | `V \| undefined` | Alias for `index(0)`. |
| `index(index)` | `V \| undefined` | Value by insertion order. |
| `last()` | `V \| undefined` | Value at `size - 1`. |
| `map(callback)` | new `DataMap<K, T>` | Maps values while preserving keys. |
| `toArray()` | `V[]` | Values only. |
| `toObject()` | `Record<string, V>` | Converts entries to a plain object. |
| `toString(replacer?, space?)` | `string` | JSON string of `toObject()`. |

### ReadonlyMap Methods

`ReadonlyMap` exposes read and transform helpers over an internal `DataMap`:

- `entries()`
- `filter(callback)`
- `find(callback)`
- `findKey(callback)`
- `findValue(callback)`
- `forEach(iterator)`
- `get(key)`
- `has(key)`
- `keys()`
- `map(callback)`
- `size`
- `toObject()`
- `toString(replacer?, space?)`
- `values()`

### Callable Helper

```ts
const headers = map<string, string>();

headers.set('content-type', 'application/json');
headers('content-type');
headers.get('content-type');
```

`map(data?)` returns a callable `CallableMap<K, V>`. It supports normal `DataMap` methods and a getter function signature.

## Example

```ts
import { DataMap } from '@stackpress/lib';

const scores = new DataMap<string, number>();
scores.set('one', 1);
scores.set('two', 2);
scores.set('three', 3);

const passing = scores.filter(value => value >= 2);
const first = scores.first();
const serialized = scores.toString();
```

## Related

- [Set](./Set.md)
- [Nest](./Nest.md)
- [Types](../types/README.md)
