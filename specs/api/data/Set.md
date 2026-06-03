# Set

Extended `Set` utilities plus callable and readonly wrappers.

## Import

```ts
import { DataSet, ReadonlySet, set } from '@stackpress/lib';
```

## When To Use It

Use `DataSet` when you want `Set` uniqueness with indexed read helpers and transformation methods. Use `ReadonlySet` when you want read-only access. Use `set()` when a callable index-based getter is convenient.

## API

### Constructor

```ts
const tags = new DataSet<string>(['api', 'router', 'queue']);
```

`ReadonlySet` accepts the same initial array.

### DataSet Methods

| Method | Returns | Notes |
| --- | --- | --- |
| `filter(callback)` | new `DataSet` subclass | Filters values by value and insertion index. |
| `find(callback)` | `[number, V] \| undefined` | First matching `[index, value]`. |
| `findIndex(callback)` | `number` | Returns `-1` when no value matches. |
| `findValue(callback)` | `V \| undefined` | First matching value. |
| `first()` | `V \| undefined` | Alias for `index(0)`. |
| `index(index)` | `V \| undefined` | Value by insertion order. |
| `last()` | `V \| undefined` | Value at `size - 1`. |
| `map(callback)` | new `DataSet<T>` | Maps each value into a new set. |
| `toArray()` | `V[]` | Array snapshot. |
| `toString(replacer?, space?)` | `string` | JSON string of `toArray()`. |

### ReadonlySet Methods

`ReadonlySet` exposes the read side of the collection:

- `entries()`
- `filter(callback)`
- `find(callback)`
- `findIndex(callback)`
- `findValue(callback)`
- `forEach(iterator)`
- `has(value)`
- `index(index)`
- `keys()`
- `map(callback)`
- `size`
- `toArray()`
- `toString(replacer?, space?)`
- `values()`

### Callable Helper

```ts
const queue = set(['first', 'second']);

queue(0);
queue.index(1);
queue.add('third');
```

`set(data?)` returns a `CallableSet<V>` with the `DataSet` method surface plus a function signature for indexed reads.

## Example

```ts
import { DataSet } from '@stackpress/lib';

const flags = new DataSet<number>();
flags.add(1);
flags.add(2);
flags.add(3);

const doubled = flags.map(value => value * 2);
const second = flags.index(1);
const found = flags.findValue(value => value === 3);
```

## Related

- [Map](./Map.md)
- [Nest](./Nest.md)
- [Types](../types/README.md)
