# ItemQueue

Priority queue with FIFO ordering inside the same priority.

## Import

```ts
import { ItemQueue } from '@stackpress/lib';
```

## When To Use It

Use `ItemQueue` when you need deterministic ordering with explicit priority but do not need task execution semantics.

## API

### Constructor

```ts
const queue = new ItemQueue<string>();
```

### Properties

| Name | Type | Notes |
| --- | --- | --- |
| `queue` | `Item<I>[]` | Raw queue storage. |
| `size` | `number` | Current queue length. |

### Methods

| Method | Returns | Notes |
| --- | --- | --- |
| `add(item, priority = 0)` | `this` | Adds an item and re-sorts the queue. Higher priority runs first. |
| `push(item)` | `this` | Adds below the current lowest priority. |
| `shift(item)` | `this` | Adds above the current highest priority. |
| `consume()` | `I \| undefined` | Removes and returns the next item. |

## Example

```ts
import { ItemQueue } from '@stackpress/lib';

const queue = new ItemQueue<string>();
queue.add('normal', 0);
queue.add('high', 10);
queue.push('bottom');

const next = queue.consume();
```

## Related

- [TaskQueue](./TaskQueue.md)
