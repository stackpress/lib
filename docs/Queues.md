# Queues

Priority-based queue implementations for managing items and tasks with FIFO ordering. Includes both generic item queues and specialized task queues with priority-based ordering, FIFO ordering within same priority levels, task execution with before/after hooks, and chainable API for queue operations.

When an event is triggered, Stackpress doesn't just fire off listeners blindly. Instead, it organizes them into a `TaskQueue`, which then consumes items sequentially by priority. Because events can be defined anywhere, event priority allows you to structure execution like a series of steps—making the flow of your application predictable and easy to follow.

Even better, the `TaskQueue` makes the `EventEmitter` a true **plugin system**: you can insert new code between existing listeners without rewriting or restructuring what's already there. This means features, extensions, or third-party modules can seamlessly "hook into" the event pipeline without breaking your core logic.

```typescript
const itemQueue = new ItemQueue<string>();
const taskQueue = new TaskQueue<[number]>();
```

## 1. ItemQueue

An item queue that orders and consumes items sequentially based on priority with FIFO ordering by default. The ItemQueue provides the foundation for priority-based processing where items with higher priority values are processed before items with lower priority values.

### 1.1. Properties

The following properties are available when instantiating an ItemQueue.

| Property | Type | Description |
|----------|------|-------------|
| `queue` | `Item<I>[]` | The internal queue array (readonly) |
| `size` | `number` | The number of items in the queue |

### 1.2. Adding Items with Priority

The following example shows how to add items with specific priority levels for controlled execution order.

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

### 1.3. Adding Items to Bottom

The following example shows how to add items to the bottom of the queue with the lowest priority.

```typescript
queue.push('bottom-item');
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `item` | `I` | The item to add to the bottom of the queue |

**Returns**

The ItemQueue instance to allow method chaining.

### 1.4. Adding Items to Top

The following example shows how to add items to the top of the queue with the highest priority.

```typescript
queue.shift('top-item');
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `item` | `I` | The item to add to the top of the queue |

**Returns**

The ItemQueue instance to allow method chaining.

### 1.5. Consuming Items

The following example shows how to consume items one at a time in priority order.

```typescript
const item = queue.consume(); // Returns highest priority item
console.log(item); // 'top-item'
```

**Returns**

The next item in the queue, or `undefined` if the queue is empty.

## 2. TaskQueue

A task queue that extends ItemQueue specifically for executing functions sequentially with priority-based ordering. The TaskQueue provides advanced features like before/after hooks, execution control, and status reporting for complex task management scenarios.

```typescript
const queue = new TaskQueue<[number]>();
queue.push(async (x) => console.log(x + 1));
queue.shift(async (x) => console.log(x + 2));
queue.add(async (x) => console.log(x + 3), 10);
await queue.run(5);
```

### 2.1. Properties

The following properties are available when instantiating a TaskQueue.

| Property | Type | Description |
|----------|------|-------------|
| `after` | `TaskAction<A>` | Hook called after each task execution |
| `before` | `TaskAction<A>` | Hook called before each task execution |
| `queue` | `Item<TaskAction<A>>[]` | The internal queue array (inherited) |
| `size` | `number` | The number of tasks in the queue (inherited) |

### 2.2. Running Tasks

The following example shows how to execute all tasks in the queue sequentially with proper error handling.

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

### 2.3. Adding Tasks with Priority

The following example shows how to add tasks with specific priority levels for controlled execution order.

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

### 2.4. Adding Tasks to Bottom

The following example shows how to add tasks to the bottom of the queue with the lowest priority.

```typescript
queue.push(async (x) => console.log('low priority', x));
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `item` | `TaskAction<A>` | The task function to add to the bottom |

**Returns**

The TaskQueue instance to allow method chaining.

### 2.5. Adding Tasks to Top

The following example shows how to add tasks to the top of the queue with the highest priority.

```typescript
queue.shift(async (x) => console.log('high priority', x));
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `item` | `TaskAction<A>` | The task function to add to the top |

**Returns**

The TaskQueue instance to allow method chaining.

### 2.6. Setting Hooks

The following example shows how to set before and after hooks for task execution monitoring and control.

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

## 3. Task Execution Flow

The following describes the sequential execution flow when running tasks in a TaskQueue. Understanding this flow is essential for implementing proper error handling and execution control in your applications.

### 3.1. Execution Steps

The task execution follows a predictable sequence that allows for monitoring and control at each stage.

 1. **Before Hook** — Called before each task (if set)
 2. **Task Execution** — The actual task function is called
 3. **After Hook** — Called after each task (if set)

### 3.2. Execution Control

If any step returns `false`, execution is aborted and the queue returns `Status.ABORT`. This provides fine-grained control over task execution flow.

 - **Continue Execution** — Return `true` or any truthy value
 - **Abort Execution** — Return `false` to stop processing remaining tasks

## 4. Status Codes

The following status codes are returned by TaskQueue operations to indicate the result of task execution. These codes follow HTTP status code conventions for consistency across the Stackpress ecosystem.

### 4.1. Success Codes

 - **Status.OK (200)** — All tasks completed successfully
 - **Status.NOT_FOUND (404)** — No tasks in the queue

### 4.2. Error Codes

 - **Status.ABORT (309)** — Execution was aborted by a task or hook
