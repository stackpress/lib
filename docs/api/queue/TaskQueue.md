# TaskQueue

Sequential async task runner built on `ItemQueue`.

## Import

```ts
import { TaskQueue } from '@stackpress/lib';
```

## When To Use It

Use `TaskQueue` when each queue item is a function and you want ordered execution plus a `ResponseStatus` result.

## API

### Constructor

```ts
const queue = new TaskQueue<[number]>();
```

### Properties

| Name | Type | Notes |
| --- | --- | --- |
| `after` | `TaskAction<A>` | Runs after each task. Returning `false` aborts execution. |
| `before` | `TaskAction<A>` | Runs before each task. Returning `false` aborts execution. |
| `queue` | `Item<TaskAction<A>>[]` | Inherited raw queue storage. |
| `size` | `number` | Inherited item count. |

### Methods

| Method | Returns | Notes |
| --- | --- | --- |
| `add(task, priority = 0)` | `this` | Inherited from `ItemQueue`. |
| `push(task)` | `this` | Inherited from `ItemQueue`. |
| `shift(task)` | `this` | Inherited from `ItemQueue`. |
| `run(...args)` | `Promise<ResponseStatus>` | Returns `Status.NOT_FOUND`, `Status.ABORT`, or `Status.OK`. |

Each task receives the same `...args` passed to `run()`. Returning `false` from a task, `before`, or `after` stops the queue.

## Example

```ts
import { TaskQueue } from '@stackpress/lib';

const queue = new TaskQueue<[number]>();

queue.before = async value => {
  console.log('before', value);
};

queue.add(async value => {
  console.log(value + 1);
}, 5);

queue.push(async value => {
  console.log(value + 2);
});

const status = await queue.run(10);
```

## Related

- [ItemQueue](./ItemQueue.md)
- [EventEmitter](../events/EventEmitter.md)
- [Status](../runtime/Status.md)
