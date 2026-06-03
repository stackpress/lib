# RouteEmitter

HTTP-style route emitter built on `ExpressEmitter`.

## Import

```ts
import { RouteEmitter } from '@stackpress/lib';
```

## When To Use It

Use `RouteEmitter` when your events are method-plus-path routes but you do not need the full `Request` and `Response` wrappers from `Router`.

## API

### Constructor

```ts
const emitter = new RouteEmitter();
```

### Properties

| Name | Type | Notes |
| --- | --- | --- |
| `routes` | `Map<string, Route>` | Maps generated event keys back to `{ method, path }`. |

### Methods

| Method | Returns | Notes |
| --- | --- | --- |
| `route(method, path, action, priority = 0)` | `this` | Registers a route listener. |
| `use(emitter)` | `this` | Merges listeners, patterns, and route metadata from another `RouteEmitter`. |

Routes support exact paths, `:params`, `*`, `**`, and the special `ANY` method.

## Example

```ts
import { RouteEmitter } from '@stackpress/lib';

const emitter = new RouteEmitter();

emitter.route('GET', '/users/:id', async (req, res) => {
  console.log(req, res);
});
```

## Related

- [ExpressEmitter](./ExpressEmitter.md)
- [Router](../router/Router.md)
