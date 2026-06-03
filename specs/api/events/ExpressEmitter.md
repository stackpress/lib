# ExpressEmitter

Pattern-matching event emitter for route-like event names.

## Import

```ts
import { ExpressEmitter } from '@stackpress/lib';
```

## When To Use It

Use `ExpressEmitter` when event names carry parameters or wildcard segments. It extends `EventEmitter` with string-pattern and `RegExp` listeners plus extracted params and args.

## API

### Constructor

```ts
const emitter = new ExpressEmitter('/');
```

`separator` defaults to `'/'`.

### Properties

| Name | Type | Notes |
| --- | --- | --- |
| `separator` | `string` | Segment separator used when building route fragments. |
| `expressions` | `Map<string, EventExpression>` | Registered pattern expressions. |

### Methods

| Method | Returns | Notes |
| --- | --- | --- |
| `match(event)` | `Map<string, EventMatch>` | Includes exact matches and computed expression matches. |
| `on(eventOrRegExp, action, priority = 0)` | `this` | Accepts exact strings, `:params`, `*`, `**`, or raw `RegExp`. |
| `use(emitter)` | `this` | Merges expression metadata and listeners. |

### Pattern Rules

- `:name` captures one segment into `event.data.params.name`
- `*` captures one segment into `event.data.args`
- `**` captures multiple segments into `event.data.args`
- `RegExp` listeners keep `pattern` empty and expose match groups through `data.args`

The constants `VARIABLE_NAME` and `EVENT_PATTERNS` are also exported from the module for pattern parsing.

## Example

```ts
import { ExpressEmitter } from '@stackpress/lib';

type Events = {
  [key: string]: [string];
};

const emitter = new ExpressEmitter<Events>();

emitter.on('user/:id', async value => {
  console.log(value);
});

await emitter.emit('user/42', 'loaded');

const match = emitter.match('user/42').values().next().value;
match?.data.params.id;
```

## Related

- [EventEmitter](./EventEmitter.md)
- [RouteEmitter](./RouteEmitter.md)
- [Router](../router/Router.md)
