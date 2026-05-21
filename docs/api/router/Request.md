# Request

Generic request wrapper for headers, query data, post data, session data, and optional body loading.

## Import

```ts
import { Request, withUnknownHost } from '@stackpress/lib';
```

## When To Use It

Use `Request` when you want one request shape across HTTP servers, terminal adapters, or custom transports.

## API

### Constructor

```ts
const req = new Request({
  method: 'POST',
  url: 'http://localhost/users?page=1',
  headers: { 'Content-Type': 'application/json' },
  post: { name: 'Ada' }
});
```

`RequestOptions<R>` accepts partial initialization for:

- `body`
- `data`
- `headers`
- `loader`
- `method`
- `mimetype`
- `post`
- `query`
- `resource`
- `session`
- `url`

### Properties

| Name | Type | Notes |
| --- | --- | --- |
| `body` | `Body \| null` | Raw body or loaded body. |
| `data` | `CallableNest` | Combined view of query, post, and extra `data`. |
| `headers` | `CallableMap<string, string \| string[]>` | Header map. |
| `loaded` | `boolean` | Whether `load()` has already run. |
| `method` | `Method` | Defaults to `GET`. |
| `mimetype` | `string` | Defaults to `text/plain`. |
| `post` | `CallableNest` | Parsed post data only. |
| `query` | `CallableNest` | Parsed query data only. |
| `resource` | `R` | Original request resource, if any. |
| `session` | `CallableSession` | Session store. Defaults from `cookie` header when explicit session data is missing. |
| `type` | `string` | Body type such as `string`, `object`, `array`, `buffer`, `uint8array`, or `null`. |
| `url` | `URL` | Parsed URL object. |

### Methods

| Method | Returns | Notes |
| --- | --- | --- |
| `load()` | `Promise<this>` | Runs the configured loader once and merges returned `post` data into both `post` and `data`. |

### Exported Helper

`withUnknownHost(url)` prefixes relative paths with `http://unknownhost` so `new URL()` can accept them.

## Example

```ts
import { Request } from '@stackpress/lib';

const req = new Request({
  url: 'http://localhost/users?active=true',
  headers: {
    cookie: 'sessionId=abc123'
  },
  data: {
    source: 'api'
  }
});

const active = req.query('active');
const sessionId = req.session('sessionId');
const source = req.data('source');
```

## Related

- [Response](./Response.md)
- [Router](./Router.md)
- [Session](./Session.md)
