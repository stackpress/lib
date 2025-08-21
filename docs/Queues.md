# Queue

Priority-based queue implementations for managing items and tasks with FIFO ordering.

When an event is triggered, Stackpress doesn’t just fire off listeners blindly. Instead, it organizes them into a `TaskQueue`, which then consumes items sequentially by priority. 

Because events can be defined anywhere, event priority allows you to structure execution like a series of steps—making the flow of your application predictable and easy to follow.

Even better, the `TaskQueue` makes the `EventEmitter` a true **plugin system**: you can insert new code between existing listeners without rewriting or restructuring what’s already there. This means features, extensions, or third-party modules can seamlessly “hook into” the event pipeline without breaking your core logic.

<img width="192" height="108" alt="image" src="https://github.com/user-attachments/assets/b313723b-618f-4911-8820-82ff8ab0998d" />

```typescript
const itemQueue = new ItemQueue<string>();
const taskQueue = new TaskQueue<[number]>();
```

## ItemQueue

An item queue that orders and consumes items sequentially based on priority (FIFO by default).

### Properties

The following properties are available when instantiating an ItemQueue.

| Property | Type | Description |
|----------|------|-------------|
| `queue` | `Item<I>[]` | The internal queue array (readonly) |
| `size` | `number` | The number of items in the queue |

### Methods

The following methods are available when instantiating an ItemQueue.

#### Adding Items with Priority

The following example shows how to add items with specific priority levels.

```typescript
const queue = new ItemQueue<string>();
queue.add('medium', 5);
queue.add('high', 10);
queue.add('low', 1);
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `item` | `I` | The item to add to the queue |
| `priority` | `number` | Priority level (higher numbers execute first, default: 0) |

**Returns**

The ItemQueue instance to allow method chaining.

#### Adding Items to Bottom

The following example shows how to add items to the bottom of the queue (lowest priority).

```typescript
queue.push('bottom-item');
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `item` | `I` | The item to add to the bottom of the queue |

**Returns**

The ItemQueue instance to allow method chaining.

#### Adding Items to Top

The following example shows how to add items to the top of the queue (highest priority).

```typescript
queue.shift('top-item');
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `item` | `I` | The item to add to the top of the queue |

**Returns**

The ItemQueue instance to allow method chaining.

#### Consuming Items

The following example shows how to consume items one at a time in priority order.

```typescript
const item = queue.consume(); // Returns highest priority item
console.log(item); // 'top-item'
```

**Returns**

The next item in the queue, or `undefined` if the queue is empty.

## TaskQueue

A task queue that extends ItemQueue specifically for executing functions sequentially.

```typescript
const queue = new TaskQueue<[number]>();
queue.push(async (x) => console.log(x + 1));
queue.shift(async (x) => console.log(x + 2));
queue.add(async (x) => console.log(x + 3), 10);
await queue.run(5);
```

### Properties

The following properties are available when instantiating a TaskQueue.

| Property | Type | Description |
|----------|------|-------------|
| `after` | `TaskAction<A>` | Hook called after each task execution |
| `before` | `TaskAction<A>` | Hook called before each task execution |
| `queue` | `Item<TaskAction<A>>[]` | The internal queue array (inherited) |
| `size` | `number` | The number of tasks in the queue (inherited) |

### Methods

The following methods are available when instantiating a TaskQueue.

#### Running Tasks

The following example shows how to execute all tasks in the queue sequentially.

```typescript
const queue = new TaskQueue<[number]>();
queue.push(async (x) => {
  console.log(x + 1);
  return true; // Continue execution
});
queue.add(async (x) => {
  console.log(x + 2);
  return false; // Abort execution
}, 10);

const result = await queue.run(5);
console.log(result.code); // 309 (ABORT) or 200 (OK)
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `...args` | `A` | Arguments to pass to each task function |

**Returns**

A promise that resolves to a ResponseStatus indicating success, abort, or not found.

#### Adding Tasks with Priority

The following example shows how to add tasks with specific priority levels.

```typescript
queue.add(async (x) => console.log('high priority', x), 10);
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `item` | `TaskAction<A>` | The task function to add |
| `priority` | `number` | Priority level (higher numbers execute first, default: 0) |

**Returns**

The TaskQueue instance to allow method chaining.

#### Adding Tasks to Bottom

The following example shows how to add tasks to the bottom of the queue.

```typescript
queue.push(async (x) => console.log('low priority', x));
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `item` | `TaskAction<A>` | The task function to add to the bottom |

**Returns**

The TaskQueue instance to allow method chaining.

#### Adding Tasks to Top

The following example shows how to add tasks to the top of the queue.

```typescript
queue.shift(async (x) => console.log('high priority', x));
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `item` | `TaskAction<A>` | The task function to add to the top |

**Returns**

The TaskQueue instance to allow method chaining.

#### Setting Hooks

The following example shows how to set before and after hooks for task execution.

```typescript
queue.before = async (x) => {
  console.log('Before task:', x);
  return true; // Continue execution
};

queue.after = async (x) => {
  console.log('After task:', x);
  return true; // Continue execution
};
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `...args` | `A` | Arguments passed to the hook function |

**Returns**

For hooks: `false` to abort execution, any other value to continue.

### Task Execution Flow

1. **Before Hook**: Called before each task (if set)
2. **Task Execution**: The actual task function is called
3. **After Hook**: Called after each task (if set)

If any step returns `false`, execution is aborted and the queue returns `Status.ABORT`.

### Status Codes

- `Status.OK` (200): All tasks completed successfully
- `Status.ABORT` (309): Execution was aborted by a task or hook
- `Status.NOT_FOUND` (404): No tasks in the queue
