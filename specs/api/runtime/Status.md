# Status

Named status constants plus lookup helpers for numeric codes and status text.

## Import

```ts
import { Status, codes } from '@stackpress/lib';
```

## When To Use It

Use `Status` when you need stable named `ResponseStatus` objects in emitters, queues, routers, or response helpers.

## API

### Exports

| Export | Notes |
| --- | --- |
| `codes` | Full `Record<string, ResponseStatus>` table keyed by status constant name. |
| `Status` | Named constants plus lookup helpers. |

### `Status` Members

`Status` exposes named `ResponseStatus` objects such as:

- `OK`
- `CREATED`
- `NOT_FOUND`
- `ABORT`
- `BAD_REQUEST`
- `ERROR`

The full list mirrors the `codes` object.

### Methods

| Method | Returns | Notes |
| --- | --- | --- |
| `Status.find(status)` | `ResponseStatus \| undefined` | Finds the first status object with the matching status text. |
| `Status.get(code)` | `ResponseStatus \| undefined` | Finds the first status object with the matching numeric code. |

## Example

```ts
import { Status } from '@stackpress/lib';

const ok = Status.OK;
const aborted = Status.ABORT;
const notFound = Status.get(404);
```

## Related

- [Exception](./Exception.md)
- [TaskQueue](../queue/TaskQueue.md)
- [Response](../router/Response.md)
