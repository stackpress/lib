# Response

Generic response wrapper with status helpers, body helpers, error conversion, and dispatch support.

## Import

```ts
import { Response } from '@stackpress/lib';
```

## When To Use It

Use `Response` when you want transport-agnostic response building and a consistent status/result payload shape across adapters.

## API

### Constructor

```ts
const res = new Response({
  headers: { 'x-request-id': 'abc123' },
  data: { source: 'api' }
});
```

`ResponseOptions<S>` accepts partial initialization for `body`, `data`, `headers`, `mimetype`, and `resource`.

### Properties

| Name | Type | Notes |
| --- | --- | --- |
| `body` | `Body \| null` | Response payload. |
| `code` | `number` | Status code. Assigning this also resolves the status message through `Status.get()`. |
| `data` | `CallableNest` | Extra response metadata storage. |
| `dispatcher` | `ResponseDispatcher<S>` | Optional transport adapter used by `dispatch()`. |
| `error` | `string \| undefined` | Primary error string. |
| `errors` | `CallableNest<NestedObject<string \| string[]>>` | Validation-style error details. |
| `headers` | `CallableMap<string, string \| string[]>` | Response headers. |
| `mimetype` | `string \| undefined` | Response content type. |
| `redirected` | `boolean` | True when `Location` is set. |
| `resource` | `S` | Original transport resource. |
| `sent` | `boolean` | True after `dispatch()` or `stop()`. |
| `session` | `CallableSession` | Session changes to be written by an adapter. |
| `stack` | `Trace[] \| undefined` | Error trace data. |
| `status` | `string` | Status message. |
| `total` | `number` | Total items for list-style responses. |
| `type` | `string` | Body type such as `object`, `array`, `string`, `buffer`, or `null`. |

### Methods

| Method | Returns | Notes |
| --- | --- | --- |
| `dispatch()` | `Promise<S>` | Runs the dispatcher once, marks the response sent, and returns the native resource. |
| `fromException(exception)` | `this` | Copies exception code, error message, errors, and stack. |
| `fromStatusResponse(response)` | `this` | Copies a status-response object into the wrapper. |
| `redirect(url, code = 302, status?)` | `this` | Sets the `Location` header and status. |
| `set(type, body, code = 200, status?)` | `this` | Low-level setter for body and mime type. |
| `setError(error, errors = {}, stack = [], code = 400, status?)` | `this` | Accepts either a string or an `ErrorResponse`. |
| `html(body, code = 200, status?)` | `this` | Shortcut for `text/html`. |
| `json(body, code = 200, status?)` | `this` | Serializes objects to pretty JSON strings. |
| `results(body, code = 200, status?)` | `this` | Sets one JSON result and `total = 1`. |
| `rows(body, total = 0, code = 200, status?)` | `this` | Sets a JSON array result plus total count. |
| `statusCode(code, message?)` | `this` | Updates code and status. |
| `xml(body, code = 200, status?)` | `this` | Shortcut for `text/xml`. |
| `stop()` | `this` | Marks the response sent without dispatching. |
| `toException(message?)` | `Exception` | Rebuilds the response as an `Exception`. |
| `toStatusResponse()` | `Partial<StatusResponse<T>>` | Serializes the wrapper into the library response shape. |

## Example

```ts
import { Response } from '@stackpress/lib';

const res = new Response();

res.headers.set('x-request-id', 'abc123');
res.rows([{ id: 1 }, { id: 2 }], 2);

const payload = res.toStatusResponse<{ id: number }[]>();
```

## Related

- [Request](./Request.md)
- [Router](./Router.md)
- [Exception](../runtime/Exception.md)
- [Status](../runtime/Status.md)
