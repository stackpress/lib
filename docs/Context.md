# 📖 Stackpress Library

Comprehensive API documentation for the Stackpress Library - a shared library used across Stackpress projects that standardizes type definitions and provides common utilities for developers.

## Installation

```bash
npm install @stackpress/lib
```

## API Reference

### Data Structures
Data structures in programming are specialized formats for organizing, processing, storing, and retrieving data within a computer's memory.  

**Key Features:**
- Type-safe nested object manipulation
- Path-based data access with dot notation
- Built-in parsers for query strings, form data, and arguments
- Chainable API for fluent data operations

### Events
Event driven designed to support event chain reactions.

**Key Features:**
- Priority-based event listeners
- Type-safe event maps with TypeScript generics
- Before/after hooks for event execution
- Task queue management for event handling

### Exception
Enhanced error handling with expressive error reporting and stack trace support. Provides better error information than standard JavaScript errors.

**Key Features:**
- Template-based error messages
- Validation error aggregation
- Enhanced stack trace parsing
- HTTP status code integration

### Queues
Priority-based queue implementations for managing items and tasks with FIFO ordering. Includes both generic item queues and specialized task queues.

**Key Features:**
- Priority-based ordering (higher numbers execute first)
- FIFO ordering within same priority levels
- Task execution with before/after hooks
- Chainable API for queue operations

### Routing
Event-driven routing system with generic Request and Response wrappers that work across different platforms (HTTP, terminal, web sockets).

**Key Features:**
- Cross-platform request/response handling
- Parameter extraction from routes
- Event-driven architecture
- Generic type support for different mediums

### File System
Cross-platform file loading utilities for locating, loading, and importing files throughout your project and node_modules.

**Key Features:**
- Cross-platform path resolution
- Node modules discovery
- Dynamic import support
- Project root (@/) path shortcuts

## Type Safety

The library is built with TypeScript and provides comprehensive type definitions. All components support generic types for enhanced type safety:

```typescript
// Type-safe nested data
type ConfigMap = {
  database: { host: string; port: number };
  cache: { ttl: number };
};
const config = new Nest<ConfigMap>();

// Type-safe event handling
type EventMap = {
  'user-login': [string, Date];
  'data-update': [object];
};
const emitter = new EventEmitter<EventMap>();

// Type-safe queue operations
const queue = new TaskQueue<[number, string]>();
```

## Browser Compatibility

Most components work in both Node.js and browser environments:

- ✅ **Nest** - Full browser support
- ✅ **EventEmitter** - Full browser support  
- ✅ **Exception** - Full browser support
- ✅ **Queue** - Full browser support
- ⚠️ **FileLoader/NodeFS** - Node.js only

## Events

From browser clicks to CLI commands to backend routing, Stackpress treats everything as an event that flows seamlessly through your stack.

> Behind user experiences are a chain reaction of events.

At its core, all software exists for users to interact with it. These interactions—whether a mouse click in the browser, a command in the terminal, or a tap on a mobile app, are all actions. Actions are **events**. Software, in one way or another, is always waiting for certain actions to occur and then responding to them. This means every application has an inherent level of **event-driven design** ([IBM Developer](https://developer.ibm.com/articles/advantages-of-an-event-driven-architecture/?utm_source=chatgpt.com), [Wikipedia](https://en.wikipedia.org/wiki/Event-driven_architecture?utm_source=chatgpt.com)).

Modern event-driven systems are valued for being **responsive, loosely coupled, scalable, and resilient** ([Confluent](https://www.confluent.io/learn/event-driven-architecture/?utm_source=chatgpt.com), [PubNub](https://www.pubnub.com/blog/the-benefits-of-event-driven-architecture/?utm_source=chatgpt.com)). 

- **🔄 Responsive** — React immediately when an event occurs, instead of waiting on rigid request/response cycles. This enables real-time behavior, such as updating a UI the moment data changes or triggering backend workflows instantly.  
- **🧩 Loosely Coupled** — Components don’t need direct knowledge of each other; they communicate through events. This reduces dependencies, making systems easier to maintain and extend.  
- **📈 Scalable** — Events are asynchronous, which means they can be queued, processed in parallel, and distributed across workers or servers. This makes handling high loads far simpler.  
- **🛡️ Resilient** — Failures are isolated. If one listener fails, the rest of the system continues. Recovery strategies like retries or fallbacks can be added without rewriting business logic.  

Stackpress builds on these principles by making events not just a layer, but the **foundation** of software design. A user interaction starts at the edge (browser, CLI, mobile app), but in a fully event-driven design these same events can propagate through the backend—across servers, databases, sockets, etc. setting of a chain reaction of events where one event triggers actions, and those actions can emit more events in turn, and so on.

In Stackpress, even a router is a type of event emitter. By treating routes, sockets, and commands as events, Stackpress provides a unified, generically designed emitter that simplifies building across environments.


### EventEmitter

A class that implements the observer pattern for handling events with priority levels and task queues.

```typescript
type EventMap = Record<string, [number]> & {
  'trigger something': [number];
  'process data': [string, object];
};

const emitter = new EventEmitter<EventMap>();
```

#### Properties

The following properties are available when instantiating an EventEmitter.

| Property | Type | Description |
|----------|------|-------------|
| `after` | `EventHook<M[keyof M]>` | Hook called after each task execution |
| `before` | `EventHook<M[keyof M]>` | Hook called before each task execution |
| `event` | `Event<M[keyof M]>` | Current event match information |
| `listeners` | `object` | Frozen shallow copy of all event listeners |

#### Methods

The following methods are available when instantiating an EventEmitter.

##### Adding Event Listeners

The following example shows how to add event listeners with optional priority.

```typescript
emitter.on('trigger something', async (x) => {
  console.log('something triggered', x + 1);
});

emitter.on('trigger something', async (x) => {
  console.log('high priority', x + 2);
}, 2); // Higher priority executes first
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `event` | `N extends EventName<M>` | The event name to listen for |
| `action` | `TaskAction<M[N]>` | The callback function to execute |
| `priority` | `number` | Priority level (higher numbers execute first, default: 0) |

**Returns**

The EventEmitter instance to allow method chaining.

##### Emitting Events

The following example shows how to emit events and trigger all registered listeners.

```typescript
const result = await emitter.emit('trigger something', 42);
console.log(result.code); // 200 for success, 404 if no listeners
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `event` | `N extends EventName<M>` | The event name to emit |
| `...args` | `M[N]` | Arguments to pass to the event listeners |

**Returns**

A promise that resolves to a Status object indicating success or failure.

##### Removing Event Listeners

The following example shows how to remove a specific event listener.

```typescript
const handler = async (x) => console.log(x);
emitter.on('trigger something', handler);
emitter.unbind('trigger something', handler);
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `event` | `N extends EventName<M>` | The event name |
| `action` | `TaskAction<M[N]>` | The specific callback function to remove |

**Returns**

The EventEmitter instance to allow method chaining.

##### Clearing All Event Listeners

The following example shows how to clear all listeners for a specific event.

```typescript
emitter.clear('trigger something');
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `event` | `N extends EventName<M>` | The event name to clear |

**Returns**

The EventEmitter instance to allow method chaining.

##### Matching Events

The following example shows how to get possible event matches.

```typescript
const matches = emitter.match('trigger something');
console.log(matches.get('trigger something')?.pattern);
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `event` | `string` | The event name to match |

**Returns**

A Map of event matches with their patterns and data.

##### Getting Task Queue

The following example shows how to get a task queue for a specific event.

```typescript
const queue = emitter.tasks('trigger something');
console.log(queue.size); // Number of tasks for this event
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `event` | `N extends EventName<M>` | The event name |

**Returns**

A TaskQueue containing all tasks for the specified event.

##### Using Other Emitters

The following example shows how to merge listeners from another emitter.

```typescript
const emitter1 = new EventEmitter();
const emitter2 = new EventEmitter();

emitter2.on('shared event', async () => console.log('from emitter2'));
emitter1.use(emitter2); // emitter1 now has emitter2's listeners
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `emitter` | `EventEmitter<M>` | Another emitter to merge listeners from |

**Returns**

The EventEmitter instance to allow method chaining.

##### Creating Task Queues

The following example shows how to create a new task queue (can be overridden in subclasses).

```typescript
const queue = emitter.makeQueue();
```

**Returns**

A new TaskQueue instance for managing event tasks.

##### Setting Hooks

The following example shows how to set before and after hooks for event execution.

```typescript
emitter.before = async (event) => {
  console.log('Before:', event.event);
  return true; // Continue execution
};

emitter.after = async (event) => {
  console.log('After:', event.event);
};
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `event` | `Event<M[keyof M]>` | Event information including name, args, and metadata |

**Returns**

For `before` hook: `false` to stop execution, any other value to continue.
For `after` hook: return value is ignored.

### ExpressEmitter

Event emitter with regex pattern matching and parameter extraction capabilities, extending EventEmitter with Express-like routing patterns.

```typescript
type EventMap = {
  'user-login': [string, Date];
  'api-*': [object];
  ':method /api/users': [Request, Response];
};

const emitter = new ExpressEmitter<EventMap>('/');
```

#### Properties

The following properties are available when instantiating an ExpressEmitter.

| Property | Type | Description |
|----------|------|-------------|
| `separator` | `string` | Pattern separator character (default: '/') |
| `expressions` | `Map<string, EventExpression>` | Map of event names to regex expressions |
| `after` | `EventHook<M[keyof M]>` | Hook called after each task execution (inherited) |
| `before` | `EventHook<M[keyof M]>` | Hook called before each task execution (inherited) |
| `event` | `Event<M[keyof M]>` | Current event match information (inherited) |
| `listeners` | `object` | Frozen shallow copy of all event listeners (inherited) |

#### Methods

The following methods are available when instantiating an ExpressEmitter.

##### Adding Pattern-Based Event Listeners

The following example shows how to add event listeners with pattern matching.

```typescript
const emitter = new ExpressEmitter(' '); // Space separator

// Exact match
emitter.on('user login', async (data) => {
  console.log('User logged in:', data);
});

// Wildcard patterns
emitter.on('user *', async (data) => {
  console.log('User action:', data);
});

// Parameter extraction
emitter.on(':action user', async (data) => {
  console.log('Action on user:', emitter.event?.data.params.action);
});

// Multiple parameters
emitter.on(':method /api/:resource', async (req, res) => {
  const { method, resource } = emitter.event?.data.params || {};
  console.log(`${method} request for ${resource}`);
});
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `event` | `N\|RegExp` | Event name pattern or regular expression |
| `action` | `TaskAction<M[N]>` | The callback function to execute |
| `priority` | `number` | Priority level (higher numbers execute first, default: 0) |

**Returns**

The ExpressEmitter instance to allow method chaining.

##### Adding Regex Event Listeners

The following example shows how to add event listeners using regular expressions.

```typescript
// Global regex
emitter.on(/^user (.+)$/, async (data) => {
  const action = emitter.event?.data.args[0];
  console.log('User action:', action);
});

// Non-global regex
emitter.on(/user (login|logout)/i, async (data) => {
  const [action] = emitter.event?.data.args || [];
  console.log('User authentication:', action);
});
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `event` | `RegExp` | Regular expression pattern |
| `action` | `TaskAction<M[N]>` | The callback function to execute |
| `priority` | `number` | Priority level (higher numbers execute first, default: 0) |

**Returns**

The ExpressEmitter instance to allow method chaining.

##### Pattern Matching

The following example shows how to get all matching patterns for an event.

```typescript
emitter.on('user *', handler1);
emitter.on(':action user', handler2);
emitter.on(/user (.+)/, handler3);

const matches = emitter.match('user login');
// Returns Map with all matching patterns and their extracted data
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `event` | `string` | The event name to match against patterns |

**Returns**

A Map of event matches with their patterns, parameters, and arguments.

##### Using Other ExpressEmitters

The following example shows how to merge patterns and listeners from another emitter.

```typescript
const emitter1 = new ExpressEmitter('/');
const emitter2 = new ExpressEmitter('-');

emitter2.on('api-*', handler);
emitter2.on(':method-users', handler);

emitter1.use(emitter2); // Merges expressions and listeners
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `emitter` | `EventEmitter<M>` | Another emitter to merge patterns from |

**Returns**

The ExpressEmitter instance to allow method chaining.

#### Pattern Syntax

ExpressEmitter supports several pattern matching syntaxes:

##### Wildcard Patterns

```typescript
// Single wildcard - matches one segment
emitter.on('user *', handler); // Matches: 'user login', 'user logout'

// Double wildcard - matches multiple segments  
emitter.on('api **', handler); // Matches: 'api/users/123/posts'
```

##### Parameter Extraction

```typescript
// Named parameters
emitter.on(':method /api/users', handler);
// Matches: 'GET /api/users', 'POST /api/users'
// Extracts: { method: 'GET' }, { method: 'POST' }

// Multiple parameters
emitter.on(':method /api/:resource/:id', handler);
// Matches: 'GET /api/users/123'
// Extracts: { method: 'GET', resource: 'users', id: '123' }
```

##### Mixed Patterns

```typescript
// Parameters with wildcards
emitter.on(':action user *', handler);
// Matches: 'login user data', 'logout user session'
// Extracts: { action: 'login' }, args: ['data']

// Complex routing patterns
emitter.on(':method /api/:version/users/*', handler);
// Matches: 'GET /api/v1/users/profile'
// Extracts: { method: 'GET', version: 'v1' }, args: ['profile']
```

#### Event Data Structure

When patterns match, the event data contains:

```typescript
interface EventData {
  args: string[];        // Wildcard matches and regex groups
  params: object;        // Named parameter extractions
}

// Example for pattern ':method /api/:resource/*'
// Matching event 'GET /api/users/profile'
{
  args: ['profile'],           // Wildcard matches
  params: {                    // Named parameters
    method: 'GET',
    resource: 'users'
  }
}
```

#### Custom Separators

ExpressEmitter allows custom separators for different use cases:

```typescript
// File path patterns
const fileEmitter = new ExpressEmitter('/');
fileEmitter.on('/src/*/index.js', handler);

// Command patterns  
const cmdEmitter = new ExpressEmitter(' ');
cmdEmitter.on(':command --:flag', handler);

// API patterns
const apiEmitter = new ExpressEmitter('-');
apiEmitter.on('api-:version-users', handler);
```

#### Regular Expression Support

ExpressEmitter supports both global and non-global regular expressions:

```typescript
// Global regex - uses matchAll()
emitter.on(/user-(.+)/g, handler);

// Non-global regex - uses match()
emitter.on(/user-(.+)/, handler);

// Case insensitive
emitter.on(/USER-(.+)/i, handler);
```

#### Priority-Based Execution

Like EventEmitter, ExpressEmitter supports priority-based execution:

```typescript
emitter.on('user *', handler1, 1);      // Lower priority
emitter.on('user login', handler2, 5);  // Higher priority  
emitter.on(/user (.+)/, handler3, 3);   // Medium priority

// Execution order: handler2, handler3, handler1
await emitter.emit('user login', data);
```

### RouteEmitter

Event-driven routing system that extends ExpressEmitter for HTTP-like route handling.

```typescript
type RouteMap = {
  'GET /users': [Request, Response];
  'POST /users': [Request, Response];
  'GET /users/:id': [Request, Response];
};

const router = new RouteEmitter<Request, Response>();
```

#### Properties

The following properties are available when instantiating a RouteEmitter.

| Property | Type | Description |
|----------|------|-------------|
| `routes` | `Map<string, Route>` | Map of event names to route definitions |
| `separator` | `string` | Pattern separator (always '/') |
| `expressions` | `Map<string, EventExpression>` | Map of event names to regex expressions (inherited) |

#### Methods

The following methods are available when instantiating a RouteEmitter.

##### Defining Routes

The following example shows how to define HTTP-like routes.

```typescript
const router = new RouteEmitter();

// Basic routes
router.route('GET', '/users', async (req, res) => {
  // Handle GET /users
});

router.route('POST', '/users', async (req, res) => {
  // Handle POST /users  
});

// Routes with parameters
router.route('GET', '/users/:id', async (req, res) => {
  const userId = req.params.id; // Parameter extraction
});

// Wildcard routes
router.route('GET', '/api/*', async (req, res) => {
  // Handle any GET /api/* route
});

// Any method routes
router.route('ANY', '/health', async (req, res) => {
  // Handle any HTTP method to /health
});
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `method` | `string` | HTTP method (GET, POST, PUT, DELETE, ANY, etc.) |
| `path` | `string` | Route path with optional parameters |
| `action` | `RouteAction<R, S>` | Route handler function |
| `priority` | `number` | Priority level (default: 0) |

**Returns**

The RouteEmitter instance to allow method chaining.

##### Using Other RouteEmitters

The following example shows how to merge routes from another router.

```typescript
const apiRouter = new RouteEmitter();
apiRouter.route('GET', '/api/users', handler);
apiRouter.route('POST', '/api/users', handler);

const mainRouter = new RouteEmitter();
mainRouter.use(apiRouter); // Merges routes and listeners
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `emitter` | `EventEmitter<RouteMap<R, S>>` | Another router to merge routes from |

**Returns**

The RouteEmitter instance to allow method chaining.

#### Route Patterns

RouteEmitter supports Express-like route patterns:

##### Parameter Routes

```typescript
// Single parameter
router.route('GET', '/users/:id', handler);
// Matches: GET /users/123
// Extracts: { id: '123' }

// Multiple parameters  
router.route('GET', '/users/:userId/posts/:postId', handler);
// Matches: GET /users/123/posts/456
// Extracts: { userId: '123', postId: '456' }
```

##### Wildcard Routes

```typescript
// Single wildcard
router.route('GET', '/files/*', handler);
// Matches: GET /files/document.pdf

// Catch-all wildcard
router.route('GET', '/static/**', handler);  
// Matches: GET /static/css/main.css
```

##### Method Handling

```typescript
// Specific methods
router.route('GET', '/users', getUsers);
router.route('POST', '/users', createUser);
router.route('PUT', '/users/:id', updateUser);
router.route('DELETE', '/users/:id', deleteUser);

// Any method
router.route('ANY', '/health', healthCheck);
```

#### Event Generation

RouteEmitter automatically generates event names from routes:

```typescript
router.route('GET', '/users/:id', handler);
// Generates event: 'GET /users/:id'
// Can be emitted as: router.emit('GET /users/123', req, res)

router.route('ANY', '/api/*', handler);  
// Generates regex pattern for any method
// Matches: 'GET /api/users', 'POST /api/data', etc.
```

#### Integration with Router

RouteEmitter is used internally by the Router class but can be used standalone:

```typescript
const routeEmitter = new RouteEmitter<MyRequest, MyResponse>();

routeEmitter.route('GET', '/api/:resource', async (req, res) => {
  const resource = routeEmitter.event?.data.params.resource;
  // Handle API resource request
});

// Emit route events directly
await routeEmitter.emit('GET /api/users', request, response);
```

## Queue

Priority-based queue implementations for managing items and tasks with FIFO ordering.

When an event is triggered, Stackpress doesn’t just fire off listeners blindly. Instead, it organizes them into a `TaskQueue`, which then consumes items sequentially by priority. 

Because events can be defined anywhere, event priority allows you to structure execution like a series of steps—making the flow of your application predictable and easy to follow.

Even better, the `TaskQueue` makes the `EventEmitter` a true **plugin system**: you can insert new code between existing listeners without rewriting or restructuring what’s already there. This means features, extensions, or third-party modules can seamlessly “hook into” the event pipeline without breaking your core logic.

<img width="192" height="108" alt="image" src="https://github.com/user-attachments/assets/b313723b-618f-4911-8820-82ff8ab0998d" />

```typescript
const itemQueue = new ItemQueue<string>();
const taskQueue = new TaskQueue<[number]>();
```

### ItemQueue

An item queue that orders and consumes items sequentially based on priority (FIFO by default).

#### Properties

The following properties are available when instantiating an ItemQueue.

| Property | Type | Description |
|----------|------|-------------|
| `queue` | `Item<I>[]` | The internal queue array (readonly) |
| `size` | `number` | The number of items in the queue |

#### Methods

The following methods are available when instantiating an ItemQueue.

##### Adding Items with Priority

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

##### Adding Items to Bottom

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

##### Adding Items to Top

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

##### Consuming Items

The following example shows how to consume items one at a time in priority order.

```typescript
const item = queue.consume(); // Returns highest priority item
console.log(item); // 'top-item'
```

**Returns**

The next item in the queue, or `undefined` if the queue is empty.

### TaskQueue

A task queue that extends ItemQueue specifically for executing functions sequentially.

```typescript
const queue = new TaskQueue<[number]>();
queue.push(async (x) => console.log(x + 1));
queue.shift(async (x) => console.log(x + 2));
queue.add(async (x) => console.log(x + 3), 10);
await queue.run(5);
```

#### Properties

The following properties are available when instantiating a TaskQueue.

| Property | Type | Description |
|----------|------|-------------|
| `after` | `TaskAction<A>` | Hook called after each task execution |
| `before` | `TaskAction<A>` | Hook called before each task execution |
| `queue` | `Item<TaskAction<A>>[]` | The internal queue array (inherited) |
| `size` | `number` | The number of tasks in the queue (inherited) |

#### Methods

The following methods are available when instantiating a TaskQueue.

##### Running Tasks

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

##### Adding Tasks with Priority

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

##### Adding Tasks to Bottom

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

##### Adding Tasks to Top

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

##### Setting Hooks

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

#### Task Execution Flow

1. **Before Hook**: Called before each task (if set)
2. **Task Execution**: The actual task function is called
3. **After Hook**: Called after each task (if set)

If any step returns `false`, execution is aborted and the queue returns `Status.ABORT`.

#### Status Codes

- `Status.OK` (200): All tasks completed successfully
- `Status.ABORT` (309): Execution was aborted by a task or hook
- `Status.NOT_FOUND` (404): No tasks in the queue

## Routing

Event-driven routing system with generic Request and Response wrappers that work across different platforms (HTTP, terminal, web sockets).

```typescript
type RequestData = { userId: string };
type ResponseData = { message: string };

const router = new Router<RequestData, ResponseData>();

router.route('GET', '/users/:id', async (req, res, ctx) => {
  const userId = req.data.get('id');
  res.setJSON({ message: `User ${userId}` });
});
```

### Request

Generic request wrapper that works with IncomingMessage and WHATWG (Fetch) Request.

#### Properties

The following properties are available when instantiating a Request.

| Property | Type | Description |
|----------|------|-------------|
| `data` | `CallableNest` | Combined data from query, post, and additional data |
| `headers` | `CallableMap<string, string\|string[]>` | Request headers |
| `query` | `CallableNest` | URL query parameters |
| `post` | `CallableNest` | POST body data |
| `session` | `CallableSession` | Session data |
| `url` | `URL` | Request URL object |
| `method` | `Method` | HTTP method |
| `body` | `Body\|null` | Raw request body |
| `loaded` | `boolean` | Whether the body has been loaded |
| `mimetype` | `string` | Request body MIME type |
| `resource` | `R` | Original request resource |
| `type` | `string` | Type of body content |
| `loader` | `RequestLoader<R>` | Body loader function |

#### Methods

The following methods are available when instantiating a Request.

##### Loading Request Body

The following example shows how to load the request body asynchronously.

```typescript
const req = router.request({ 
  url: 'http://example.com/api',
  method: 'POST'
});

await req.load(); // Loads body using the configured loader
console.log(req.body); // Access the loaded body
```

**Returns**

The Request instance to allow method chaining.

### Response

Generic response wrapper that works with ServerResponse and WHATWG (Fetch) Response.

#### Properties

The following properties are available when instantiating a Response.

| Property | Type | Description |
|----------|------|-------------|
| `headers` | `CallableMap<string, string\|string[]>` | Response headers |
| `session` | `CallableSession` | Session data |
| `errors` | `CallableNest` | Validation errors |
| `data` | `CallableNest` | Response data |
| `body` | `Body\|null` | Response body |
| `code` | `number` | HTTP status code |
| `error` | `string\|undefined` | Error message |
| `redirected` | `boolean` | Whether response is a redirect |
| `sent` | `boolean` | Whether response has been sent |
| `stack` | `Trace[]\|undefined` | Stack trace for errors |
| `status` | `string` | HTTP status message |
| `total` | `number` | Total count of results |
| `mimetype` | `string\|undefined` | Response MIME type |
| `resource` | `S` | Original response resource |
| `type` | `string` | Type of body content |
| `dispatcher` | `ResponseDispatcher<S>` | Response dispatcher function |

#### Methods

The following methods are available when instantiating a Response.

##### Setting JSON Response

The following example shows how to set a JSON response.

```typescript
res.setJSON({ message: 'Success', data: results });
res.setJSON('{"message": "Success"}', 201, 'Created');
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `body` | `string\|NestedObject` | JSON data or string |
| `code` | `number` | HTTP status code (default: 200) |
| `status` | `string` | HTTP status message (optional) |

**Returns**

The Response instance to allow method chaining.

##### Setting HTML Response

The following example shows how to set an HTML response.

```typescript
res.setHTML('<h1>Welcome</h1>', 200, 'OK');
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `body` | `string` | HTML content |
| `code` | `number` | HTTP status code (default: 200) |
| `status` | `string` | HTTP status message (optional) |

**Returns**

The Response instance to allow method chaining.

##### Setting Error Response

The following example shows how to set an error response.

```typescript
res.setError('Invalid input', { name: 'required' }, [], 400, 'Bad Request');
res.setError({ 
  code: 404, 
  error: 'Not found', 
  errors: { id: 'invalid' } 
});
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `error` | `string\|ErrorResponse` | Error message or response object |
| `errors` | `NestedObject<string\|string[]>` | Validation errors (default: {}) |
| `stack` | `Trace[]` | Stack trace (default: []) |
| `code` | `number` | HTTP status code (default: 400) |
| `status` | `string` | HTTP status message (optional) |

**Returns**

The Response instance to allow method chaining.

##### Setting Results Response

The following example shows how to set a single result response.

```typescript
res.setResults({ id: 1, name: 'John' });
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `body` | `NestedObject` | Result object |
| `code` | `number` | HTTP status code (default: 200) |
| `status` | `string` | HTTP status message (optional) |

**Returns**

The Response instance to allow method chaining.

##### Setting Rows Response

The following example shows how to set a collection response with total count.

```typescript
res.setRows([{ id: 1 }, { id: 2 }], 100); // 2 items out of 100 total
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `body` | `NestedObject[]` | Array of result objects |
| `total` | `number` | Total count of possible results (default: 0) |
| `code` | `number` | HTTP status code (default: 200) |
| `status` | `string` | HTTP status message (optional) |

**Returns**

The Response instance to allow method chaining.

##### Redirecting

The following example shows how to redirect the response.

```typescript
res.redirect('/login', 302, 'Found');
res.redirect('https://example.com'); // Default 302
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `url` | `string` | Redirect URL |
| `code` | `number` | HTTP status code (default: 302) |
| `status` | `string` | HTTP status message (optional) |

**Returns**

The Response instance to allow method chaining.

##### Dispatching Response

The following example shows how to dispatch the response to the native resource.

```typescript
const nativeResponse = await res.dispatch();
```

**Returns**

The native response resource after dispatching.

##### Converting to Status Response

The following example shows how to convert the response to a status response object.

```typescript
const statusResponse = res.toStatusResponse();
// Returns: { code, status, error, errors, stack, results, total }
```

**Returns**

A StatusResponse object with all response details.

### Router

Event-driven router that extends ExpressEmitter for handling HTTP-like routing.

#### Properties

The following properties are available when instantiating a Router.

| Property | Type | Description |
|----------|------|-------------|
| `routes` | `Map<string, Route>` | Map of event names to route definitions |

#### Methods

The following methods are available when instantiating a Router.

##### Defining Routes

The following example shows how to define routes with different HTTP methods.

```typescript
router.route('GET', '/users/:id', async (req, res, ctx) => {
  const userId = req.data.get('id');
  res.setJSON({ id: userId, name: 'John' });
});

router.route('POST', '/users', async (req, res, ctx) => {
  const userData = req.data.get();
  // Create user logic
  res.setJSON(userData, 201, 'Created');
});
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `method` | `string` | HTTP method (GET, POST, PUT, DELETE, etc.) |
| `path` | `string` | Route path with optional parameters (:id) |
| `action` | `RouterAction<R, S, X>` | Route handler function |
| `priority` | `number` | Priority level (default: 0) |

**Returns**

The Router instance to allow method chaining.

##### Emitting Route Events

The following example shows how to emit route events directly.

```typescript
const req = router.request({ url: '/users/123' });
const res = router.response();

const status = await router.emit('GET /users/123', req, res);
console.log(status.code); // 200, 404, etc.
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `event` | `string` | Route event name (e.g., 'GET /users/123') |
| `req` | `Request<R>` | Request object |
| `res` | `Response<S>` | Response object |

**Returns**

A promise that resolves to a Status object indicating success or failure.

##### Resolving Routes

The following example shows how to resolve routes and get response data.

```typescript
// Resolve by method and path
const response = await router.resolve('GET', '/users/123', {
  headers: { 'Authorization': 'Bearer token' }
});

// Resolve by event name
const response = await router.resolve('user-created', userData);
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `methodOrEvent` | `string` | HTTP method or event name |
| `pathOrRequest` | `string\|Request<R>\|Record<string, any>` | Route path or request data |
| `requestOrResponse` | `Request<R>\|Record<string, any>\|Response<S>` | Request or response object |
| `response` | `Response<S>` | Response object (optional) |

**Returns**

A promise that resolves to a partial StatusResponse object.

##### Creating Request Objects

The following example shows how to create request objects.

```typescript
const req = router.request({
  url: 'http://example.com/api/users',
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  data: { name: 'John', email: 'john@example.com' }
});
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `init` | `Partial<RequestOptions<R>>` | Request initialization options |

**Returns**

A new Request instance.

##### Creating Response Objects

The following example shows how to create response objects.

```typescript
const res = router.response({
  headers: { 'Content-Type': 'application/json' },
  data: { message: 'Success' }
});
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `init` | `Partial<ResponseOptions<S>>` | Response initialization options |

**Returns**

A new Response instance.

##### Using Other Routers

The following example shows how to merge routes and listeners from another router.

```typescript
const apiRouter = new Router();
apiRouter.route('GET', '/api/users', handler);

const mainRouter = new Router();
mainRouter.use(apiRouter); // Merges routes and listeners
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `emitter` | `EventEmitter<RouterMap<R, S, X>>` | Another router or emitter to merge |

**Returns**

The Router instance to allow method chaining.

### Route Parameters

Routes support parameter extraction using colon notation:

```typescript
router.route('GET', '/users/:id/posts/:postId', (req, res) => {
  const userId = req.data.get('id');
  const postId = req.data.get('postId');
  // Parameters are automatically added to req.data
});
```

### Cross-Platform Usage

The Router system is designed to work across different platforms:

- **HTTP Servers**: Node.js IncomingMessage/ServerResponse
- **WHATWG Fetch**: Browser/Deno Request/Response
- **Terminal Applications**: Custom request/response objects
- **WebSockets**: Custom message handling

```typescript
// HTTP Server usage
const httpRouter = new Router<IncomingMessage, ServerResponse>();

// Terminal usage  
const terminalRouter = new Router<TerminalInput, TerminalOutput>();

// WebSocket usage
const wsRouter = new Router<WebSocketMessage, WebSocketResponse>();
```

## File System

Cross-platform file loading utilities for locating, loading, and importing files throughout your project and node_modules.

```typescript
import { NodeFS, FileLoader } from '@stackpress/lib';

const loader = new FileLoader(new NodeFS());
```

### Properties

The following properties are available when instantiating a FileLoader.

| Property | Type | Description |
|----------|------|-------------|
| `cwd` | `string` | Current working directory |
| `fs` | `FileSystem` | Filesystem interface being used |

### Methods

The following methods are available when instantiating a FileLoader.

#### Getting Absolute Paths

The following example shows how to get absolute paths from various path formats.

```typescript
// Project root paths (@ prefix)
const path1 = await loader.absolute('@/src/index.ts');
// Returns: /project/root/src/index.ts

// Relative paths
const path2 = await loader.absolute('./utils/helper.js');
// Returns: /current/directory/utils/helper.js

// Node modules
const path3 = await loader.absolute('@types/node');
// Returns: /project/node_modules/@types/node

// Absolute paths (unchanged)
const path4 = await loader.absolute('/usr/local/bin');
// Returns: /usr/local/bin
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `pathname` | `string` | Path to resolve (supports @/, ./, ../, and node_modules) |
| `pwd` | `string` | Working directory (default: current working directory) |

**Returns**

A promise that resolves to the absolute path string.

#### Getting Base Paths

The following example shows how to remove file extensions from paths.

```typescript
const basePath = loader.basepath('/path/to/file.js');
// Returns: '/path/to/file'

const noExt = loader.basepath('/path/to/file');
// Returns: '/path/to/file' (unchanged if no extension)
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `pathname` | `string` | Path to process |

**Returns**

The path without the file extension.

#### Locating Node Modules

The following example shows how to locate node_modules directories.

```typescript
// Find node_modules containing a specific package
const modulesPath = await loader.modules('@types/node');
// Returns: '/project/node_modules'

// Find node_modules from a specific directory
const modulesPath2 = await loader.modules('lodash', '/some/path');
// Returns: '/some/path/node_modules' or traverses up
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `pathname` | `string` | Package name to locate |
| `pwd` | `string` | Starting directory (default: current working directory) |
| `meta` | `boolean` | Use import.meta.resolve if available (default: true) |

**Returns**

A promise that resolves to the node_modules directory path.

#### Locating Library Path

The following example shows how to locate the @stackpress/lib installation.

```typescript
const libPath = await loader.lib();
// Returns: '/project/node_modules' (where @stackpress/lib is installed)

const libPath2 = await loader.lib('/custom/path');
// Returns: node_modules path containing @stackpress/lib from custom path
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `pwd` | `string` | Starting directory (default: current working directory) |

**Returns**

A promise that resolves to the node_modules directory containing @stackpress/lib.

#### Importing Files

The following example shows how to dynamically import various file types.

```typescript
// Import JavaScript/TypeScript modules
const module = await loader.import('./utils/helper.js');
console.log(module.default); // Default export
console.log(module.namedExport); // Named export

// Import JSON files
const config = await loader.import('./config.json');
console.log(config); // Parsed JSON object

// Import with default extraction
const defaultExport = await loader.import('./module.js', true);
// Returns only the default export
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `pathname` | `string` | Path to the file to import |
| `getDefault` | `boolean` | Return only the default export (default: false) |

**Returns**

A promise that resolves to the imported module or JSON data.

#### Getting Relative Paths

The following example shows how to get relative paths between files.

```typescript
// Get relative path from source to target
const relativePath = loader.relative(
  '/project/src/components/Button.js',
  '/project/src/utils/helper.js'
);
// Returns: '../utils/helper'

// Include file extension
const relativeWithExt = loader.relative(
  '/project/src/components/Button.js',
  '/project/src/utils/helper.js',
  true
);
// Returns: '../utils/helper.js'
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `pathname` | `string` | Source file path |
| `require` | `string` | Target file path |
| `withExtname` | `boolean` | Include file extension (default: false) |

**Returns**

The relative path from source to target.

#### Resolving Paths

The following example shows how to resolve and verify path existence.

```typescript
// Resolve path (returns null if not found)
const resolved = await loader.resolve('./config.json');
// Returns: '/project/config.json' or null

// Resolve with existence check (throws if not found)
try {
  const resolved = await loader.resolve('./config.json', process.cwd(), true);
  console.log('File exists:', resolved);
} catch (error) {
  console.log('File not found');
}

// Resolve from specific directory
const resolved2 = await loader.resolve('@/src/index.ts', '/custom/pwd');
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `pathname` | `string` | Path to resolve |
| `pwd` | `string` | Working directory (default: current working directory) |
| `exists` | `boolean` | Throw error if path doesn't exist (default: false) |

**Returns**

A promise that resolves to the absolute path or null if not found.

#### Resolving Files with Extensions

The following example shows how to resolve files with automatic extension detection.

```typescript
// Try multiple extensions
const file = await loader.resolveFile('./module', ['.js', '.ts', '.json']);
// Tries: ./module.js, ./module.ts, ./module.json, ./module/index.js, etc.

// Resolve with existence check
try {
  const file = await loader.resolveFile('./module', ['.js'], process.cwd(), true);
  console.log('Found file:', file);
} catch (error) {
  console.log('No file found with specified extensions');
}
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `pathname` | `string` | Path to resolve (without extension) |
| `extnames` | `string[]` | File extensions to try (default: ['.js', '.json']) |
| `pwd` | `string` | Working directory (default: current working directory) |
| `exists` | `boolean` | Throw error if file doesn't exist (default: false) |

**Returns**

A promise that resolves to the resolved file path or null if not found.

### Path Resolution Patterns

FileLoader supports several path resolution patterns:

#### Project Root Paths (@/)

```typescript
// @ refers to the project root (cwd)
await loader.absolute('@/src/index.ts');
await loader.absolute('@/config/database.json');
```

#### Relative Paths

```typescript
// Standard relative paths
await loader.absolute('./utils/helper.js');
await loader.absolute('../shared/constants.ts');
```

#### Node Modules

```typescript
// Automatically resolves from node_modules
await loader.absolute('lodash');
await loader.absolute('@types/node');
await loader.absolute('@company/private-package');
```

#### Absolute Paths

```typescript
// Absolute paths are returned as-is (with symlink resolution)
await loader.absolute('/usr/local/bin/node');
await loader.absolute('C:\\Program Files\\Node\\node.exe');
```

### File System Abstraction

FileLoader works with any FileSystem implementation:

```typescript
import { NodeFS } from '@stackpress/lib';

// Node.js filesystem
const nodeLoader = new FileLoader(new NodeFS());

// Custom filesystem (for testing, virtual fs, etc.)
class CustomFS implements FileSystem {
  // Implement required methods...
}
const customLoader = new FileLoader(new CustomFS());
```

### Cross-Platform Compatibility

FileLoader handles platform differences automatically:

- **Path separators**: Automatically uses correct separators (/ vs \\)
- **Symlinks**: Resolves symbolic links to real paths
- **Case sensitivity**: Respects filesystem case sensitivity rules
- **Module resolution**: Works with both CommonJS and ES modules

### Error Handling

FileLoader provides clear error messages for common issues:

```typescript
try {
  await loader.modules('non-existent-package');
} catch (error) {
  // Error: Cannot find non-existent-package in any node_modules
}

try {
  await loader.resolve('missing-file.js', process.cwd(), true);
} catch (error) {
  // Error: Cannot resolve 'missing-file.js'
}
```

### Usage Examples

#### Loading Configuration Files

```typescript
// Load config with fallbacks
const config = await loader.import('@/config.json').catch(() => ({}));

// Load environment-specific config
const env = process.env.NODE_ENV || 'development';
const envConfig = await loader.import(`@/config/${env}.json`);
```

#### Module Resolution

```typescript
// Resolve module paths for bundling
const modulePath = await loader.absolute('lodash');
const relativePath = loader.relative('./src/index.js', modulePath);

// Find all modules in a directory
const modules = await loader.modules('.');
```

#### Dynamic Imports

```typescript
// Dynamically import plugins
const pluginPath = await loader.resolveFile(`./plugins/${name}`, ['.js', '.ts']);
if (pluginPath) {
  const plugin = await loader.import(pluginPath, true);
  // Use plugin.default
}

## Data Structures

Data structures in programming are specialized formats for organizing, processing, storing, and retrieving data within a computer's memory. They define the relationships between data elements and the operations that can be performed on them. The choice of data structure significantly impacts the efficiency and performance of algorithms and overall program execution. 

### Nest

Hierarchical data management utilities for nested objects and arrays.

```typescript
import { nest, Nest, ReadonlyNest } from '@stackpress/lib';

type NestMap = {
  database: Record<string, { host: string, port: number}>
};

const callable = nest<NestMap>({
  database: {
    postgres: {
      host: 'localhost',
      port: 5432
    }
  }
});

const config = new Nest<NestMap>({
  database: {
    postgres: {
      host: 'localhost',
      port: 5432
    }
  }
});

const readonly = new ReadonlyNest<NestMap>({
  database: {
    postgres: {
      host: 'localhost',
      port: 5432
    }
  }
});
```

#### Properties

The following properties are available when instantiating a Nest.

| Property | Type | Description |
|----------|------|-------------|
| `data` | `M` | Raw nested data structure |
| `size` | `number` | Total number of top-level keys |
| `withArgs` | `ArgString` | Parser for terminal args |
| `withFormData` | `FormData` | Parser for multipart/form-data |
| `withPath` | `PathString` | Parser for path notations |
| `withQuery` | `QueryString` | Parser for query string |

#### Methods

The following methods are available when instantiating a Nest.

##### Retrieving Data

The following example shows how to retrieve data from a nest.

```typescript
config.get('database', 'postgres', 'port'); //--> 5432
config.get<number>('database', 'postgres', 'port'); //--> 5432
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `...path` | `Key[]` | A path of object keys leading to the value |

**Returns**

The value given the object key path. If you don't provide a generic, 
will follow the type map provided.

##### Setting Data

The following example shows how to add or update data in a nest.

```typescript
config.set('database', 'postgres', 'port', 5432); //--> Nest
config.set({ foo: 'bar', baz: 'qux' }); //--> Nest
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `...path` | `any[]` | A path of object keys leading to the value to be set, with the last argument being the value |

**Returns**

The nest object to allow chainability.

##### Checking For Data

The following example shows how to check if an object key path has been set.

```typescript
config.has('database', 'postgres', 'port'); //--> true
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `...path` | `Key[]` | A path of object keys leading to the value to check |

**Returns**

`true` if the object key path is set, `false` otherwise.

##### Deleting Data

The following example shows how to delete a value.

```typescript
config.delete('database', 'postgres', 'port'); //--> Nest
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `...path` | `Key[]` | A path of object keys leading to the value to be deleted |

**Returns**

The nest object to allow chainability.

##### Purging Data

The following example shows how to purge the nest.

```typescript
config.clear(); //--> Nest
```

**Returns**

The nest object to allow chainability.

##### Getting the Top-Level Keys

The following example shows how to get the top-level keys in a nest.

```typescript
config.keys(); //--> [ 'database' ]
```

**Returns**

An array of object key strings.

##### Getting the Top-Level Values

The following example shows how to get the top-level values in a nest.

```typescript
config.values(); //--> [ { postgres: { host: 'localhost', port: 5432 } } ]
```

**Returns**

An array of arbitrary values.

##### Getting the Top-Level Entries

The following example shows how to get the top-level entries in a nest.

```typescript
config.entries(); //--> [ ['database', { postgres: { host: 'localhost', port: 5432 } }] ]
```

**Returns**

An array of key-value pairs.

##### Retrieving Data Using a Key Path

The following example shows how to retrieve data from a nest using a key dot path.

```typescript
config.path('database.postgres.port'); //--> 5432
config.path<number>('database.postgres.port'); //--> 5432
config.path('database.mysql.port', 3306); //--> 3306
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `path` | `string` | An object key path separated by dots leading to the value |
| `defaults` | `TypeOf<T>` | Default value to return if path doesn't exist |

**Returns**

The value given the object key path. If you don't provide a generic, 
will follow the type map provided.

##### Iterating Over Data

The following example shows how to iterate over data at a specific path.

```typescript
await config.forEach('database', (value, key) => {
  console.log(key, value);
  return true; // continue iteration
});
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `...path` | `any[]` | A path of object keys leading to the data to iterate, with the last argument being the callback function |

**Returns**

A promise that resolves to `true` if all iterations completed, `false` if stopped early.

##### Converting a Nest to a JSON

The following example shows how to generate a JSON string from a nest.

```typescript
config.toString(); 
//--> { "database": { "postgres": { "host": "localhost", "port": 5432 } } }
config.toString(false); //--> {"database":{"postgres":{"host":"localhost","port":5432}}}
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `expand` | `boolean` | Whether to format the JSON with indentation (default: true) |
| `...path` | `Key[]` | Optional path to convert only a subset of the data |

**Returns**

A JSON string derived from the nest.

##### Callable Nest

Creates a callable Nest instance that can be invoked as a function to get nested values.

```typescript
import { nest } from '@stackpress/lib';

const config = nest<NestMap>({
  database: {
    postgres: {
      host: 'localhost',
      port: 5432
    }
  }
});

config('database', 'postgres', 'host'); // 'localhost'
config<string>('database', 'postgres', 'host'); // 'localhost'
```



### Maps

Creates a callable Map instance that can be invoked as a function to get values.

```typescript
import { map } from '@stackpress/lib';

const userMap = map<string, User>([
  ['john', { name: 'John', age: 30 }],
  ['jane', { name: 'Jane', age: 25 }]
]);

// Use as function to get values
const john = userMap('john'); // { name: 'John', age: 30 }

// Use as Map
userMap.set('bob', { name: 'Bob', age: 35 });
console.log(userMap.size); // 3
```

#### Properties

The following properties are available on a callable map.

| Property | Type | Description |
|----------|------|-------------|
| `size` | `number` | Number of key-value pairs in the map |

#### Methods

The following methods are available on a callable map.

##### Direct Invocation

The following example shows how to use the map as a function.

```typescript
const value = myMap('key'); // Equivalent to myMap.get('key')
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `key` | `K` | The key to retrieve the value for |

**Returns**

The value associated with the key, or `undefined` if not found.

##### Setting Values

The following example shows how to set key-value pairs.

```typescript
myMap.set('newKey', 'newValue');
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `key` | `K` | The key to set |
| `value` | `V` | The value to associate with the key |

**Returns**

The Map instance to allow method chaining.

##### Getting Values

The following example shows how to get values by key.

```typescript
const value = myMap.get('key');
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `key` | `K` | The key to retrieve the value for |

**Returns**

The value associated with the key, or `undefined` if not found.

##### Checking Key Existence

The following example shows how to check if a key exists.

```typescript
const exists = myMap.has('key'); // true or false
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `key` | `K` | The key to check for existence |

**Returns**

`true` if the key exists, `false` otherwise.

##### Deleting Keys

The following example shows how to delete a key-value pair.

```typescript
const deleted = myMap.delete('key'); // true if deleted, false if not found
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `key` | `K` | The key to delete |

**Returns**

`true` if the key was deleted, `false` if the key didn't exist.

##### Clearing All Data

The following example shows how to remove all key-value pairs.

```typescript
myMap.clear();
console.log(myMap.size); // 0
```

**Returns**

`undefined`

##### Iterating Over Entries

The following example shows how to iterate over all key-value pairs.

```typescript
for (const [key, value] of myMap.entries()) {
  console.log(key, value);
}
```

**Returns**

An iterator of `[key, value]` pairs.

##### Iterating Over Keys

The following example shows how to iterate over all keys.

```typescript
for (const key of myMap.keys()) {
  console.log(key);
}
```

**Returns**

An iterator of keys.

##### Iterating Over Values

The following example shows how to iterate over all values.

```typescript
for (const value of myMap.values()) {
  console.log(value);
}
```

**Returns**

An iterator of values.

##### Using forEach

The following example shows how to execute a function for each key-value pair.

```typescript
myMap.forEach((value, key, map) => {
  console.log(`${key}: ${value}`);
});
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `callback` | `(value: V, key: K, map: Map<K, V>) => void` | Function to execute for each element |

**Returns**

`undefined`







### Sets

Creates a callable Set instance that can be invoked as a function to get values by index.

```typescript
import { set } from '@stackpress/lib';

const tags = set(['javascript', 'typescript', 'node.js']);

// Use as function to get by index
const firstTag = tags(0); // 'javascript'
const secondTag = tags(1); // 'typescript'

// Use as Set
tags.add('react');
console.log(tags.size); // 4
```

#### Properties

The following properties are available on a callable set.

| Property | Type | Description |
|----------|------|-------------|
| `size` | `number` | Number of values in the set |

#### Methods

The following methods are available on a callable set.

##### Direct Invocation

The following example shows how to use the set as a function to get values by index.

```typescript
const value = mySet(0); // Get first item
const value2 = mySet(2); // Get third item
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `index` | `number` | The index of the value to retrieve |

**Returns**

The value at the specified index, or `undefined` if index is out of bounds.

##### Getting Values by Index

The following example shows how to get values by index using the index method.

```typescript
const value = mySet.index(0); // Same as mySet(0)
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `index` | `number` | The index of the value to retrieve |

**Returns**

The value at the specified index, or `undefined` if index is out of bounds.

##### Adding Values

The following example shows how to add values to the set.

```typescript
mySet.add('newValue');
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `value` | `V` | The value to add to the set |

**Returns**

The Set instance to allow method chaining.

##### Checking Value Existence

The following example shows how to check if a value exists.

```typescript
const exists = mySet.has('value'); // true or false
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `value` | `V` | The value to check for existence |

**Returns**

`true` if the value exists, `false` otherwise.

##### Deleting Values

The following example shows how to delete a value.

```typescript
const deleted = mySet.delete('value'); // true if deleted, false if not found
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `value` | `V` | The value to delete |

**Returns**

`true` if the value was deleted, `false` if the value didn't exist.

##### Clearing All Data

The following example shows how to remove all values.

```typescript
mySet.clear();
console.log(mySet.size); // 0
```

**Returns**

`undefined`

##### Iterating Over Entries

The following example shows how to iterate over all value pairs.

```typescript
for (const [value1, value2] of mySet.entries()) {
  console.log(value1, value2); // Both values are the same in a Set
}
```

**Returns**

An iterator of `[value, value]` pairs.

##### Iterating Over Values

The following example shows how to iterate over all values.

```typescript
for (const value of mySet.values()) {
  console.log(value);
}
```

**Returns**

An iterator of values.

##### Using forEach

The following example shows how to execute a function for each value.

```typescript
mySet.forEach((value1, value2, set) => {
  console.log(value1); // value1 and value2 are the same
});
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `callback` | `(value: V, value2: V, set: Set<V>) => void` | Function to execute for each element |

**Returns**

`undefined`

## Exception

Enhanced error handling with expressive error reporting and stack trace support.

```typescript
const exception = new Exception('Invalid Parameters: %s', 400)
  .withErrors({
    name: 'required',
    email: 'invalid format'
  })
  .withPosition(100, 200);
```

### Static Methods

The following methods can be accessed directly from Exception itself.

#### Creating Exceptions with Templates

The following example shows how to create exceptions with template strings.

```typescript
throw Exception.for('Something %s is %s', 'good', 'bad');
// Results in: "Something good is bad"
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `message` | `string` | Template message with %s placeholders |
| `...values` | `unknown[]` | Values to replace %s placeholders |

**Returns**

A new Exception instance with the formatted message.

#### Creating Exceptions from Response Objects

The following example shows how to create exceptions from response objects.

```typescript
const response = { 
  code: 400, 
  error: 'Bad Request', 
  errors: { field: 'required' } 
};
throw Exception.forResponse(response);
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `response` | `Partial<StatusResponse>` | Response object with error details |
| `message` | `string` | Fallback message if response.error is not provided |

**Returns**

A new Exception instance configured from the response object.

#### Creating Exceptions for Validation Errors

The following example shows how to create exceptions for validation errors.

```typescript
throw Exception.forErrors({
  name: 'required',
  email: 'invalid format'
});
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `errors` | `NestedObject<string>` | Object containing validation errors |

**Returns**

A new Exception instance with "Invalid Parameters" message and error details.

#### Requiring Conditions

The following example shows how to assert conditions and throw if they fail.

```typescript
Exception.require(count > 0, 'Count %s must be positive', count);
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `condition` | `boolean` | Condition that must be true |
| `message` | `string` | Error message with %s placeholders |
| `...values` | `any[]` | Values to replace %s placeholders |

**Returns**

Void if condition is true, throws Exception if false.

#### Try-Catch Wrapper

The following example shows how to use the synchronous try-catch wrapper.

```typescript
const result = Exception
  .try(() => riskyOperation())
  .catch((error, kind) => {
    console.log('Error type:', kind);
    return defaultValue;
  });
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `callback` | `() => T` | Function to execute safely |

**Returns**

An object with a `catch` method for handling errors.

#### Upgrading Errors

The following example shows how to upgrade regular errors to exceptions.

```typescript
try {
  // some operation
} catch (error) {
  throw Exception.upgrade(error, 400);
}
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `error` | `Error` | The error to upgrade |
| `code` | `number` | HTTP status code (default: 500) |

**Returns**

An Exception instance (returns original if already an Exception).

### Properties

The following properties are available when instantiating an Exception.

| Property | Type | Description |
|----------|------|-------------|
| `code` | `number` | HTTP status code |
| `end` | `number` | Ending character position of the error |
| `errors` | `object` | Validation errors object |
| `start` | `number` | Starting character position of the error |
| `type` | `string` | Exception type name |

### Methods

The following methods are available when instantiating an Exception.

#### Setting Error Code

The following example shows how to set the HTTP status code.

```typescript
exception.withCode(404);
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `code` | `number` | HTTP status code |

**Returns**

The Exception instance to allow method chaining.

#### Adding Validation Errors

The following example shows how to add validation errors.

```typescript
exception.withErrors({
  name: 'required',
  email: ['required', 'invalid format']
});
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `errors` | `NestedObject<string\|string[]>` | Validation errors object |

**Returns**

The Exception instance to allow method chaining.

#### Setting Position Information

The following example shows how to set character position information.

```typescript
exception.withPosition(100, 200);
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `start` | `number` | Starting character position |
| `end` | `number` | Ending character position |

**Returns**

The Exception instance to allow method chaining.

#### Converting to Response Object

The following example shows how to convert the exception to a response object.

```typescript
const response = exception.toResponse();
// Returns: { code, status, error, start, end, stack, errors? }
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `start` | `number` | Starting index for stack trace (default: 0) |
| `end` | `number` | Ending index for stack trace (default: 0) |

**Returns**

An ErrorResponse object with all exception details.

#### Converting to JSON

The following example shows how to convert the exception to JSON.

```typescript
const json = exception.toJSON();
console.log(json); // Pretty-printed JSON string
```

**Returns**

A formatted JSON string representation of the exception.

#### Getting Stack Trace

The following example shows how to get the parsed stack trace.

```typescript
const trace = exception.trace();
trace.forEach(frame => {
  console.log(`${frame.method} at ${frame.file}:${frame.line}:${frame.char}`);
});
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `start` | `number` | Starting index for stack trace (default: 0) |
| `end` | `number` | Ending index for stack trace (default: 0) |

**Returns**

An array of Trace objects with method, file, line, and char information.

## Types

Type definitions for the Stackpress library providing type safety and 
structure for data manipulation, event handling, routing, and system 
operations.

```typescript
import type { 
  NestedObject, 
  EventMap, 
  RouterAction 
} from '@stackpress/lib/types';
```

### General Types

The following types provide general utility for type manipulation and 
inference.

#### TypeOf

Utility type that extracts the primitive type from a value, providing 
type-safe inference for nested object operations.

```typescript
type StringType = TypeOf<string>; // string
type NumberType = TypeOf<number>; // number
type BooleanType = TypeOf<boolean>; // boolean
type AnyType = TypeOf<undefined>; // any
type NullType = TypeOf<null>; // null
```

**Usage**

Used internally by `Nest` and other data structures to maintain type 
safety when accessing nested values with generic type parameters.

### Data Types

The following types define structures for nested data manipulation and 
scalar value handling.

#### NestedObject

Represents a nested object structure where values can be of any type or 
further nested objects.

```typescript
type UserConfig = NestedObject<string | number>;
const config: UserConfig = {
  database: {
    host: 'localhost',
    port: 5432
  },
  cache: {
    ttl: 3600
  }
};
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `V` | `unknown` | The type of values stored in the nested structure |

**Usage**

Used as the foundation for `Nest` data structures and configuration 
objects throughout the library.

#### UnknownNest

Type alias for `NestedObject<unknown>` representing a nested object 
with unknown value types.

```typescript
const data: UnknownNest = {
  user: { name: 'John', age: 30 },
  settings: { theme: 'dark' }
};
```

**Usage**

Used as the default type parameter for `Nest` when specific value types 
are not known at compile time.

#### Scalar

Union type representing primitive values that can be stored in nested 
structures.

```typescript
const value: Scalar = 'hello'; // string
const count: Scalar = 42; // number
const flag: Scalar = true; // boolean
const empty: Scalar = null; // null
```

**Usage**

Used in form data processing and configuration systems where only 
primitive values are expected.

#### Hash

Type alias for `NestedObject<Scalar>` representing a nested object 
structure containing only scalar values.

```typescript
const settings: Hash = {
  app: {
    name: 'MyApp',
    version: '1.0.0',
    debug: true
  },
  database: {
    port: 5432,
    ssl: false
  }
};
```

**Usage**

Used for configuration objects and form data where complex objects are 
not allowed, only primitive values.

### Cookie Types

The following types define cookie configuration and parsing options.

#### CookieOptions

Configuration options for HTTP cookies including security and behavior 
settings.

```typescript
const cookieConfig: CookieOptions = {
  domain: '.example.com',
  expires: new Date('2024-12-31'),
  httpOnly: true,
  maxAge: 86400,
  path: '/',
  secure: true,
  sameSite: 'strict'
};
```

**Properties**

| Property | Type | Description |
|----------|------|-------------|
| `domain` | `string` | Cookie domain scope |
| `expires` | `Date` | Cookie expiration date |
| `httpOnly` | `boolean` | Restrict cookie to HTTP requests only |
| `maxAge` | `number` | Cookie lifetime in seconds |
| `path` | `string` | Cookie path scope |
| `partitioned` | `boolean` | Enable partitioned cookies |
| `priority` | `'low'|'medium'|'high'` | Cookie priority level |
| `sameSite` | `boolean|'lax'|'strict'|'none'` | SameSite policy |
| `secure` | `boolean` | Require HTTPS for cookie transmission |

**Usage**

Used by the `Response` class when setting cookies and by cookie parsing 
utilities in the data processors.

### Status Types

The following types define response status structures and error handling.

#### ResponseStatus

Basic response status structure containing HTTP status code and message.

```typescript
const status: ResponseStatus = {
  code: 200,
  status: 'OK'
};
```

**Properties**

| Property | Type | Description |
|----------|------|-------------|
| `code` | `number` | HTTP status code |
| `status` | `string` | HTTP status message |

**Usage**

Used as the foundation for all response status types and by the `Status` 
utility for HTTP status code management.

#### ErrorResponse

Extended response structure for error conditions including error details 
and stack traces.

```typescript
const errorResponse: ErrorResponse = {
  code: 400,
  status: 'Bad Request',
  error: 'Invalid input data',
  errors: {
    email: 'Email is required',
    password: ['Password too short', 'Password must contain numbers']
  },
  stack: [{
    method: 'validateUser',
    file: 'auth.ts',
    line: 42,
    char: 10
  }]
};
```

**Properties**

| Property | Type | Description |
|----------|------|-------------|
| `code` | `number` | HTTP error status code |
| `status` | `string` | HTTP error status message |
| `error` | `string` | Primary error message |
| `errors` | `NestedObject<string|string[]>` | Detailed field-specific errors |
| `start` | `number` | Error start position (optional) |
| `end` | `number` | Error end position (optional) |
| `stack` | `Trace[]` | Stack trace information (optional) |

**Usage**

Used by the `Response` class for error responses and by the `Exception` 
class for structured error handling.

#### SuccessResponse

Extended response structure for successful operations including result 
data and pagination.

```typescript
const successResponse: SuccessResponse<User[]> = {
  code: 200,
  status: 'OK',
  results: [
    { id: 1, name: 'John' },
    { id: 2, name: 'Jane' }
  ],
  total: 150
};
```

**Properties**

| Property | Type | Description |
|----------|------|-------------|
| `code` | `number` | HTTP success status code |
| `status` | `string` | HTTP success status message |
| `results` | `T` | Response data of generic type |
| `total` | `number` | Total count for pagination (optional) |

**Usage**

Used by the `Response` class for successful API responses and data 
retrieval operations.

#### StatusResponse

Union type combining error and success response structures for flexible 
response handling.

```typescript
const response: StatusResponse<User> = {
  code: 200,
  status: 'OK',
  results: { id: 1, name: 'John' }
};

// Or for errors
const errorResponse: StatusResponse = {
  code: 400,
  status: 'Bad Request',
  error: 'Validation failed'
};
```

**Usage**

Used by router actions and event handlers that can return either success 
or error responses. Distinguished from `ResponseStatus` by including 
optional error and success fields.

#### Trace

Stack trace entry providing debugging information for error tracking.

```typescript
const trace: Trace = {
  method: 'processRequest',
  file: '/src/router/Router.ts',
  line: 125,
  char: 15
};
```

**Properties**

| Property | Type | Description |
|----------|------|-------------|
| `method` | `string` | Function or method name |
| `file` | `string` | Source file path |
| `line` | `number` | Line number in source file |
| `char` | `number` | Character position on line |

**Usage**

Used in error responses and exception handling to provide detailed 
debugging information about error origins.

### Queue Types

The following types define structures for queue operations and task 
management.

#### Item

Generic item wrapper for priority queue operations.

```typescript
const queueItem: Item<string> = {
  item: 'process-data',
  priority: 10
};
```

**Properties**

| Property | Type | Description |
|----------|------|-------------|
| `item` | `I` | The queued item of generic type |
| `priority` | `number` | Priority level for queue ordering |

**Usage**

Used by `ItemQueue` to wrap items with priority information for ordered 
processing.

#### TaskItem

Specialized item type for task functions with priority and arguments.

```typescript
const taskItem: TaskItem<[string, number]> = {
  item: async (name: string, count: number) => {
    console.log(`Processing ${name} ${count} times`);
    return true;
  },
  priority: 5
};
```

**Usage**

Used by `TaskQueue` to manage executable functions with priority 
ordering and argument type safety.

#### TaskAction

Function type for executable tasks with flexible return types.

```typescript
const taskAction: TaskAction<[User, Options]> = async (user, options) => {
  if (!user.isValid()) {
    return false; // Abort further processing
  }
  await processUser(user, options);
  return true; // Continue processing
};
```

**Returns**

Can return `boolean`, `undefined`, `void`, or promises of these types. 
Returning `false` aborts queue processing.

**Usage**

Used to define executable functions in `TaskQueue` with type-safe 
arguments and standardized return behavior.

#### TaskResult

Union type for task function return values.

```typescript
const result: TaskResult = true; // Continue processing
const result2: TaskResult = false; // Abort processing
const result3: TaskResult = undefined; // Continue processing
```

**Usage**

Used internally by `TaskQueue` to handle different return types from 
task functions and determine processing flow.

### Event Types

The following types define event system structures for type-safe event 
handling.

#### Event

Complete event object containing task information and event metadata.

```typescript
const event: Event<[string, number]> = {
  item: async (message: string, count: number) => {
    console.log(`${message} - ${count}`);
  },
  priority: 1,
  event: 'user.login',
  pattern: 'user.*',
  data: {
    args: ['user', 'login'],
    params: { action: 'login' }
  },
  args: ['Welcome', 5],
  action: async (message: string, count: number) => {
    console.log(`${message} - ${count}`);
  }
};
```

**Properties**

| Property | Type | Description |
|----------|------|-------------|
| `item` | `TaskAction<A>` | The executable task function |
| `priority` | `number` | Event priority for ordering |
| `event` | `string` | The actual event name that was emitted |
| `pattern` | `string` | The pattern that matched this event |
| `data` | `EventData` | Parsed event data and parameters |
| `args` | `A` | Arguments passed to the event handler |
| `action` | `TaskAction<A>` | The event handler function |

**Usage**

Used internally by `EventEmitter` to represent complete event objects 
during emission and processing.

#### EventMap

Type mapping event names to their argument types for type-safe event 
emission.

```typescript
type AppEvents = {
  'user.login': [User, string];
  'user.logout': [User];
  'data.update': [string, any];
};

const emitter = new EventEmitter<AppEvents>();
emitter.on('user.login', (user: User, sessionId: string) => {
  // Type-safe event handler
});
```

**Usage**

Used as a generic parameter for `EventEmitter` to provide compile-time 
type checking for event names and arguments.

#### EventName

Utility type extracting valid event names from an event map.

```typescript
type ValidEvents = EventName<AppEvents>; // 'user.login' | 'user.logout' | 'data.update'
```

**Usage**

Used internally by `EventEmitter` to constrain event names to those 
defined in the event map.

#### EventData

Parsed event information containing arguments and extracted parameters.

```typescript
const eventData: EventData = {
  args: ['user', 'profile', 'update'],
  params: {
    resource: 'user',
    id: 'profile',
    action: 'update'
  }
};
```

**Properties**

| Property | Type | Description |
|----------|------|-------------|
| `args` | `string[]` | Event name split into components |
| `params` | `Record<string, string>` | Extracted parameters from pattern matching |

**Usage**

Used by `ExpressEmitter` and `RouteEmitter` for pattern-based event 
matching and parameter extraction.

#### EventMatch

Event matching result containing pattern information and extracted data.

```typescript
const match: EventMatch = {
  event: 'user.123.update',
  pattern: 'user.*.update',
  data: {
    args: ['user', '123', 'update'],
    params: { id: '123' }
  }
};
```

**Properties**

| Property | Type | Description |
|----------|------|-------------|
| `event` | `string` | The actual event name |
| `pattern` | `string` | The pattern that matched |
| `data` | `EventData` | Extracted event data |

**Usage**

Used by pattern-matching event emitters to provide information about 
how events were matched and what parameters were extracted.

#### EventExpression

Compiled regular expression pattern for event matching.

```typescript
const expression: EventExpression = {
  pattern: 'user.*.update',
  regexp: /^user\.([^\.]+)\.update$/
};
```

**Properties**

| Property | Type | Description |
|----------|------|-------------|
| `pattern` | `string` | Original pattern string |
| `regexp` | `RegExp` | Compiled regular expression |

**Usage**

Used internally by `ExpressEmitter` to store compiled patterns for 
efficient event matching.

### Payload Types

The following types define request and response payload structures.

#### Body

Union type for HTTP request/response body content supporting various 
data formats.

```typescript
const stringBody: Body = 'Hello World';
const jsonBody: Body = { message: 'Hello' };
const bufferBody: Body = Buffer.from('data');
const streamBody: Body = fs.createReadStream('file.txt');
```

**Usage**

Used by `Request` and `Response` classes to handle different body types 
in a type-safe manner.

#### Headers

HTTP headers structure supporting both object and Map representations.

```typescript
const headers: Headers = {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer token123'
};

// Or as Map
const headerMap: Headers = new Map([
  ['Content-Type', 'application/json'],
  ['Set-Cookie', ['session=abc', 'csrf=xyz']]
]);
```

**Usage**

Used by `Request` and `Response` classes for HTTP header management 
with support for multiple values per header.

#### Data

Generic data container supporting both Map and object representations.

```typescript
const data: Data = {
  user: { id: 1, name: 'John' },
  settings: { theme: 'dark' }
};

// Or as Map
const dataMap: Data = new Map([
  ['user', { id: 1, name: 'John' }],
  ['settings', { theme: 'dark' }]
]);
```

**Usage**

Used by `Request` class to store merged data from query parameters, 
POST data, and additional context.

#### Query

URL query parameters supporting string, Map, or object representations.

```typescript
const query: Query = 'page=1&limit=10';
const queryObj: Query = { page: '1', limit: '10' };
const queryMap: Query = new Map([['page', '1'], ['limit', '10']]);
```

**Usage**

Used by `Request` class for URL query parameter handling with flexible 
input formats.

#### Post

POST request data supporting object or Map representations.

```typescript
const postData: Post = {
  username: 'john',
  password: 'secret',
  remember: true
};

const postMap: Post = new Map([
  ['username', 'john'],
  ['password', 'secret']
]);
```

**Usage**

Used by `Request` class for form data and POST body content management.

#### ResponseOptions

Configuration options for response initialization.

```typescript
const options: ResponseOptions<User> = {
  body: { id: 1, name: 'John' },
  headers: { 'Content-Type': 'application/json' },
  mimetype: 'application/json',
  data: { timestamp: Date.now() },
  resource: { id: 1, name: 'John' }
};
```

**Properties**

| Property | Type | Description |
|----------|------|-------------|
| `body` | `Body` | Response body content |
| `headers` | `Headers` | HTTP response headers |
| `mimetype` | `string` | Content MIME type |
| `data` | `Data` | Additional response data |
| `resource` | `S` | Generic resource object |

**Usage**

Used by `Response` class constructor for initialization with various 
content types and metadata.

#### RequestOptions

Configuration options for request initialization.

```typescript
const options: RequestOptions<IncomingMessage> = {
  resource: incomingMessage,
  method: 'POST',
  url: 'https://api.example.com/users',
  headers: { 'Content-Type': 'application/json' },
  body: { name: 'John' },
  data: { userId: 123 },
  query: { include: 'profile' },
  post: { action: 'create' },
  session: { token: 'abc123' }
};
```

**Properties**

| Property | Type | Description |
|----------|------|-------------|
| `resource` | `R` | Generic resource object (required) |
| `body` | `Body` | Request body content |
| `headers` | `Headers` | HTTP request headers |
| `mimetype` | `string` | Content MIME type |
| `data` | `Data` | Additional request data |
| `method` | `Method` | HTTP method |
| `query` | `Query` | URL query parameters |
| `post` | `Post` | POST request data |
| `session` | `Session` | Session data |
| `url` | `string|URL` | Request URL |

**Usage**

Used by `Request` class constructor for initialization with various 
request components and metadata.

### Session Types

The following types define session management structures.

#### Session

Session data container supporting object or Map representations.

```typescript
const session: Session = {
  userId: '123',
  username: 'john',
  role: 'admin'
};

const sessionMap: Session = new Map([
  ['userId', '123'],
  ['username', 'john']
]);
```

**Usage**

Used by `Request` class for session data management and by session 
processors for cookie-based sessions.

#### Revision

Session change tracking entry for audit and rollback capabilities.

```typescript
const revision: Revision = {
  action: 'set',
  value: 'newValue'
};

const removeRevision: Revision = {
  action: 'remove'
};
```

**Properties**

| Property | Type | Description |
|----------|------|-------------|
| `action` | `'set'|'remove'` | Type of change performed |
| `value` | `string|string[]` | New value (for set operations) |

**Usage**

Used by `WriteSession` class to track session changes for persistence 
and rollback functionality.

### Route Types

The following types define routing structures and HTTP method handling.

#### Method

HTTP method enumeration supporting all standard HTTP verbs.

```typescript
const method: Method = 'GET';
const postMethod: Method = 'POST';
const allMethods: Method = 'ALL'; // Matches any method
```

**Usage**

Used by `Router` class for route registration and method-based request 
handling.

#### Route

Route definition containing HTTP method and path pattern.

```typescript
const route: Route = {
  method: 'GET',
  path: '/users/:id'
};
```

**Properties**

| Property | Type | Description |
|----------|------|-------------|
| `method` | `string` | HTTP method |
| `path` | `string` | URL path pattern |

**Usage**

Used by `Router` class to store route definitions and for route lookup 
operations.

#### RouteMap

Mapping of route patterns to request/response type pairs.

```typescript
type AppRoutes = RouteMap<IncomingMessage, ServerResponse>;
const routes: AppRoutes = {
  'GET /users': [incomingMessage, serverResponse],
  'POST /users': [postRequest, postResponse]
};
```

**Usage**

Used internally by routing systems to maintain type relationships 
between routes and their handlers.

#### RouteAction

Function type for route handlers with request and response parameters.

```typescript
const routeAction: RouteAction<Request, Response> = async (req, res) => {
  const userId = req.data('id');
  const user = await getUserById(userId);
  res.setResults(user);
  return true;
};
```

**Usage**

Used by `RouteEmitter` for route handler functions with standardized 
request/response handling.

### Router Types

The following types define router context and action structures.

#### RouterContext

Context type for router operations, defaulting to Router when no custom 
context is provided.

```typescript
type DefaultContext = RouterContext<Request, Response, undefined>; // Router<Request, Response>
type CustomContext = RouterContext<Request, Response, MyContext>; // MyContext
```

**Usage**

Used by `Router` class to provide flexible context handling in route 
handlers.

#### RouterArgs

Argument tuple for router action functions containing request, response, 
and context.

```typescript
type HandlerArgs = RouterArgs<Request, Response, Router>;
// [Request, Response, Router]
```

**Usage**

Used internally by `Router` to define the argument structure for route 
handler functions.

#### RouterMap

Mapping of route patterns to router argument tuples.

```typescript
type AppRouterMap = RouterMap<Request, Response, Router>;
const routerMap: AppRouterMap = {
  'GET /users': [request, response, router],
  'POST /users': [postRequest, postResponse, router]
};
```

**Usage**

Used internally by routing systems to maintain type relationships 
between routes and their argument structures.

#### RouterAction

Function type for router handlers with request, response, and context 
parameters.

```typescript
const routerAction: RouterAction<Request, Response, Router> = async (req, res, router) => {
  const result = await router.resolve('validate-user', req);
  if (result.code !== 200) {
    res.fromStatusResponse(result);
    return false;
  }
  res.setResults({ success: true });
  return true;
};
```

**Usage**

Used by `Router` class for route handler functions with full router 
context access.

### Filesystem Types

The following types define filesystem operation interfaces.

#### FileSystem

Interface defining filesystem operations for cross-platform compatibility.

```typescript
const fs: FileSystem = {
  async exists(path: string) {
    try {
      await this.stat(path);
      return true;
    } catch {
      return false;
    }
  },
  
  async readFile(path: string, encoding: BufferEncoding) {
    return await readFileAsync(path, encoding);
  },
  
  async writeFile(path: string, data: string) {
    await writeFileAsync(path, data);
  },
  
  // ... other methods
};
```

**Methods**

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `exists` | `path: string` | `Promise<boolean>` | Check if file/directory exists |
| `readFile` | `path: string, encoding: BufferEncoding` | `Promise<string>` | Read file contents |
| `realpath` | `path: string` | `Promise<string>` | Resolve absolute path |
| `stat` | `path: string` | `Promise<FileStat>` | Get file statistics |
| `writeFile` | `path: string, data: string` | `Promise<void>` | Write file contents |
| `mkdir` | `path: string, options?: FileRecursiveOption` | `Promise<void>` | Create directory |
| `createReadStream` | `path: string` | `FileStream` | Create readable stream |
| `unlink` | `path: string` | `void` | Delete file |

**Usage**

Used by `FileLoader` and `NodeFS` classes to provide consistent 
filesystem operations across different environments and platforms.
