# Session

Cookie-oriented session storage for requests and responses.

## Import

```ts
import type { CallableSession } from '@stackpress/lib';
import { session } from '@stackpress/lib/Session';
import { ReadSession, WriteSession } from '@stackpress/lib/Session';
```

`ReadSession`, `WriteSession`, and `session()` are package-exported by the `@stackpress/lib/Session` subpath. They are not re-exported from the root barrel.

## When To Use It

Use these APIs when you need one session abstraction for request reads and response-side cookie revisions.

## API

### ReadSession

`ReadSession` extends `ReadonlyMap<string, string | string[]>`.

#### Properties

| Name | Type | Notes |
| --- | --- | --- |
| `data` | `Record<string, string \| string[]>` | Plain-object snapshot of the session values. |
| `options` | `Record<string, CookieOptions>` | Plain-object snapshot of per-key cookie options. |

#### Methods

| Method | Returns | Notes |
| --- | --- | --- |
| `getOptions(name)` | `CookieOptions \| undefined` | Returns stored cookie options for one key. |

All `ReadonlyMap` methods such as `get`, `has`, `keys`, `values`, `find`, and `toObject` are also available.

### WriteSession

`WriteSession` extends `ReadSession`.

#### Properties

| Name | Type | Notes |
| --- | --- | --- |
| `revisions` | `Map<string, Revision>` | Tracks per-key `set` and `remove` operations for adapters. |

#### Methods

| Method | Returns | Notes |
| --- | --- | --- |
| `clear()` | `void` | Removes every key and records `remove` revisions. |
| `delete(name)` | `boolean` | Removes one key and records a `remove` revision. |
| `set(name, value, options?)` | `Map` return | Stores the value and records a `set` revision, including cookie options when present. |

### Callable Helper

```ts
import { session } from '@stackpress/lib/Session';

const store = session();
store.set('sessionId', 'abc123', { httpOnly: true });
store('sessionId');
store.get('sessionId');
```

`session(data?)` returns a `CallableSession` with these additional exposed properties:

- `data`
- `options`
- `revisions`
- `size`

## Example

```ts
import { session } from '@stackpress/lib/Session';

const store = session();
store.set('theme', 'dark', { path: '/', maxAge: 3600 });
store.set('token', 'abc123', { httpOnly: true, sameSite: 'strict' });

const token = store('token');
const pending = Array.from(store.revisions.entries());
```

## Related

- [Request](./Request.md)
- [Response](./Response.md)
- [cookie](../data/Cookie.md)
