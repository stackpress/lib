# Events

Event-driven architecture designed to support event chain reactions across different platforms and environments. From browser clicks to CLI commands to backend routing, Stackpress treats everything as an event that flows seamlessly through your stack, providing responsive, loosely coupled, scalable, and resilient system design.

> Behind user experiences are a chain reaction of events.

At its core, all software exists for users to interact with it. These interactions—whether a mouse click in the browser, a command in the terminal, or a tap on a mobile app, are all actions. Actions are **events**. Software, in one way or another, is always waiting for certain actions to occur and then responding to them. This means every application has an inherent level of **event-driven design** ([IBM Developer](https://developer.ibm.com/articles/advantages-of-an-event-driven-architecture/?utm_source=chatgpt.com), [Wikipedia](https://en.wikipedia.org/wiki/Event-driven_architecture?utm_source=chatgpt.com)).

Modern event-driven systems are valued for being **responsive, loosely coupled, scalable, and resilient** ([Confluent](https://www.confluent.io/learn/event-driven-architecture/?utm_source=chatgpt.com), [PubNub](https://www.pubnub.com/blog/the-benefits-of-event-driven-architecture/?utm_source=chatgpt.com)).

## 1. Event-Driven Architecture Benefits

The following describes the key advantages of event-driven architecture and how Stackpress implements these principles to create robust, maintainable applications.

### 1.1. Responsive Systems

React immediately when an event occurs, instead of waiting on rigid request/response cycles. This enables real-time behavior, such as updating a UI the moment data changes or triggering backend workflows instantly.

 - **🔄 Real-time Updates** — UI components update immediately when data changes
 - **⚡ Instant Workflows** — Backend processes trigger without delay

### 1.2. Loosely Coupled Components

Components don't need direct knowledge of each other; they communicate through events. This reduces dependencies, making systems easier to maintain and extend.

 - **🧩 Modular Design** — Components can be developed and tested independently
 - **🔧 Easy Maintenance** — Changes to one component don't break others

### 1.3. Scalable Architecture

Events are asynchronous, which means they can be queued, processed in parallel, and distributed across workers or servers. This makes handling high loads far simpler.

 - **📈 Parallel Processing** — Multiple events can be handled simultaneously
 - **🌐 Distributed Systems** — Events can be processed across multiple servers

### 1.4. Resilient Error Handling

Failures are isolated. If one listener fails, the rest of the system continues. Recovery strategies like retries or fallbacks can be added without rewriting business logic.

 - **🛡️ Fault Isolation** — One component failure doesn't crash the entire system
 - **🔄 Recovery Strategies** — Built-in retry and fallback mechanisms

## 2. EventEmitter

A class that implements the observer pattern for handling events with priority levels and task queues. The EventEmitter provides the foundation for all event-driven functionality in Stackpress.

```typescript
type EventMap = Record<string, [number]> & {
  'trigger something': [number];
  'process data': [string, object];
};

const emitter = new EventEmitter<EventMap>();
```

### 2.1. Properties

The following properties are available when instantiating an EventEmitter.

| Property | Type | Description |
|----------|------|-------------|
| `after` | `EventHook<M[keyof M]>` | Hook called after each task execution |
| `before` | `EventHook<M[keyof M]>` | Hook called before each task execution |
| `event` | `Event<M[keyof M]>` | Current event match information |
| `listeners` | `object` | Frozen shallow copy of all event listeners |

### 2.2. Adding Event Listeners

The following example shows how to add event listeners with optional priority levels for controlling execution order.

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

### 2.3. Emitting Events

The following example shows how to emit events and trigger all registered listeners in priority order.

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

### 2.4. Removing Event Listeners

The following example shows how to remove a specific event listener from the emitter.

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

### 2.5. Clearing All Event Listeners

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

### 2.6. Matching Events

The following example shows how to get possible event matches for pattern-based event systems.

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

### 2.7. Getting Task Queue

The following example shows how to get a task queue for a specific event to inspect pending tasks.

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

### 2.8. Using Other Emitters

The following example shows how to merge listeners from another emitter for composition.

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

### 2.9. Creating Task Queues

The following example shows how to create a new task queue for custom event processing.

```typescript
const queue = emitter.makeQueue();
```

**Returns**

A new TaskQueue instance for managing event tasks.

### 2.10. Setting Hooks

The following example shows how to set before and after hooks for event execution monitoring.

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

## 3. ExpressEmitter

Event emitter with regex pattern matching and parameter extraction capabilities, extending EventEmitter with Express-like routing patterns. This allows for flexible event naming and automatic parameter extraction from event names.

```typescript
type EventMap = {
  'user-login': [string, Date];
  'api-*': [object];
  ':method /api/users': [Request, Response];
};

const emitter = new ExpressEmitter<EventMap>('/');
```

### 3.1. Properties

The following properties are available when instantiating an ExpressEmitter.

| Property | Type | Description |
|----------|------|-------------|
| `separator` | `string` | Pattern separator character (default: '/') |
| `expressions` | `Map<string, EventExpression>` | Map of event names to regex expressions |
| `after` | `EventHook<M[keyof M]>` | Hook called after each task execution (inherited) |
| `before` | `EventHook<M[keyof M]>` | Hook called before each task execution (inherited) |
| `event` | `Event<M[keyof M]>` | Current event match information (inherited) |
| `listeners` | `object` | Frozen shallow copy of all event listeners (inherited) |

### 3.2. Adding Pattern-Based Event Listeners

The following example shows how to add event listeners with pattern matching for flexible event handling.

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

### 3.3. Adding Regex Event Listeners

The following example shows how to add event listeners using regular expressions for advanced pattern matching.

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

### 3.4. Pattern Matching

The following example shows how to get all matching patterns for an event to understand which listeners will be triggered.

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

### 3.5. Using Other ExpressEmitters

The following example shows how to merge patterns and listeners from another emitter for composition.

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

### 3.6. Pattern Syntax

ExpressEmitter supports several pattern matching syntaxes for flexible event handling.

#### 3.6.1. Wildcard Patterns

```typescript
// Single wildcard - matches one segment
emitter.on('user *', handler); // Matches: 'user login', 'user logout'

// Double wildcard - matches multiple segments  
emitter.on('api **', handler); // Matches: 'api/users/123/posts'
```

#### 3.6.2. Parameter Extraction

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

## 4. RouteEmitter

Event-driven routing system that extends ExpressEmitter for HTTP-like route handling. This provides a unified interface for handling different types of requests across various platforms.

```typescript
type RouteMap = {
  'GET /users': [Request, Response];
  'POST /users': [Request, Response];
  'GET /users/:id': [Request, Response];
};

const router = new RouteEmitter<Request, Response>();
```

### 4.1. Properties

The following properties are available when instantiating a RouteEmitter.

| Property | Type | Description |
|----------|------|-------------|
| `routes` | `Map<string, Route>` | Map of event names to route definitions |
| `separator` | `string` | Pattern separator (always '/') |
| `expressions` | `Map<string, EventExpression>` | Map of event names to regex expressions (inherited) |

### 4.2. Defining Routes

The following example shows how to define HTTP-like routes for different request methods and paths.

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

### 4.3. Using Other RouteEmitters

The following example shows how to merge routes from another router for modular route organization.

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
