# Router

Route-aware event emitter that resolves `Request` and `Response` objects.

## Import

```ts
import { Router } from '@stackpress/lib';
```

## When To Use It

Use `Router` when your handlers should receive typed request and response wrappers and you want route patterns, priorities, status responses, and emitter composition in one class.

## API

### Constructor

```ts
type Req = { userId: string };
type Res = { statusCode: number };

const router = new Router<Req, Res>();
```

### Properties

| Name | Type | Notes |
| --- | --- | --- |
| `routes` | `Map<string, Route>` | Generated event-key to route metadata map. |
| `expressions` | `Map<string, EventExpression>` | Inherited pattern registry. |

### Methods

| Method | Returns | Notes |
| --- | --- | --- |
| `emit(event, req, res)` | `Promise<ResponseStatus>` | Executes the route queue for an already-built event name. |
| `request(init?)` | `Request<R>` | Convenience factory. |
| `response(init?)` | `Response<S>` | Convenience factory. |
| `route(method, path, action, priority = 0)` | `this` | Registers a route handler. |
| `resolve(event, request?, response?)` | `Promise<Partial<StatusResponse<T>>>` | Resolves a raw event name. |
| `resolve(method, path, request?, response?)` | `Promise<Partial<StatusResponse<T>>>` | Resolves a route by method and path. |
| `use(emitter)` | `this` | Merges routes, patterns, and listeners from another router-compatible emitter. |

### Route Patterns

`Router` inherits path matching rules from `ExpressEmitter`:

- `:id` for named params
- `*` for one wildcard segment
- `**` for multiple segments
- `ANY` to match every HTTP method

Route parameters are exposed through `router.event?.data.params` during handler execution.

## Example

```ts
import { Router } from '@stackpress/lib';

const router = new Router();

router.route('GET', '/users/:id', async (req, res, ctx) => {
  const id = ctx.event?.data.params.id;
  res.results({ id });
});

const response = await router.resolve<{ id: string }>('GET', '/users/42');
```

## Related

- [Request](./Request.md)
- [Response](./Response.md)
- [RouteEmitter](../events/RouteEmitter.md)
