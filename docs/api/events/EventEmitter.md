# EventEmitter

Priority-aware async event emitter built on `TaskQueue`.

## Import

```ts
import { EventEmitter } from '@stackpress/lib';
```

## When To Use It

Use `EventEmitter` when your event names are exact strings and you want ordered async listeners, before/after hooks, and status results instead of fire-and-forget callbacks.

## API

### Constructor

```ts
type Events = {
  'user.created': [string];
  'user.deleted': [string, boolean];
};

const emitter = new EventEmitter<Events>();
```

### Properties

| Name | Type | Notes |
| --- | --- | --- |
| `after` | `EventHook<M[keyof M]>` | Runs after each task. Returning `false` aborts the queue. |
| `before` | `EventHook<M[keyof M]>` | Runs before each task. Returning `false` aborts the queue. |
| `event` | current `Event` | Metadata for the task being executed. |
| `listeners` | frozen shallow copy | Raw listener registry keyed by event name. |

### Methods

| Method | Returns | Notes |
| --- | --- | --- |
| `clear(event)` | `this` | Removes all listeners for one event. |
| `emit(event, ...args)` | `Promise<ResponseStatus>` | Returns `Status.NOT_FOUND`, `Status.ABORT`, or `Status.OK`. |
| `makeQueue()` | `TaskQueue` | Overridable queue factory. |
| `match(event)` | `Map<string, EventMatch>` | Exact-match lookup in the base class. |
| `on(event, action, priority = 0)` | `this` | Adds a listener. Higher priority runs first. |
| `tasks(event)` | `TaskQueue` | Materializes the matching listeners into a queue. |
| `unbind(event, action)` | `this` | Removes one listener function. |
| `use(emitter)` | `this` | Merges listeners from another emitter. |

## Example

```ts
import { EventEmitter } from '@stackpress/lib';

type Events = {
  saved: [string];
};

const emitter = new EventEmitter<Events>();

emitter.before = async event => {
  console.log('before', event.event);
};

emitter.on('saved', async id => {
  console.log('saved', id);
}, 10);

await emitter.emit('saved', 'abc123');
```

## Related

- [ExpressEmitter](./ExpressEmitter.md)
- [TaskQueue](../queue/TaskQueue.md)
- [Status](../runtime/Status.md)
