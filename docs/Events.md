# Events

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


## EventEmitter

A class that implements the observer pattern for handling events with priority levels and task queues.

```typescript
type EventMap = Record<string, [number]> & {
  'trigger something': [number];
  'process data': [string, object];
};

const emitter = new EventEmitter<EventMap>();
```

### Properties

The following properties are available when instantiating an EventEmitter.

| Property | Type | Description |
|----------|------|-------------|
| `after` | `EventHook<M[keyof M]>` | Hook called after each task execution |
| `before` | `EventHook<M[keyof M]>` | Hook called before each task execution |
| `event` | `Event<M[keyof M]>` | Current event match information |
| `listeners` | `object` | Frozen shallow copy of all event listeners |

### Methods

The following methods are available when instantiating an EventEmitter.

#### Adding Event Listeners

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

#### Emitting Events

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

#### Removing Event Listeners

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

#### Clearing All Event Listeners

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

#### Matching Events

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

#### Getting Task Queue

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

#### Using Other Emitters

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

#### Creating Task Queues

The following example shows how to create a new task queue (can be overridden in subclasses).

```typescript
const queue = emitter.makeQueue();
```

**Returns**

A new TaskQueue instance for managing event tasks.

#### Setting Hooks

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

## ExpressEmitter

Event emitter with regex pattern matching and parameter extraction capabilities, extending EventEmitter with Express-like routing patterns.

```typescript
type EventMap = {
  'user-login': [string, Date];
  'api-*': [object];
  ':method /api/users': [Request, Response];
};

const emitter = new ExpressEmitter<EventMap>('/');
```

### Properties

The following properties are available when instantiating an ExpressEmitter.

| Property | Type | Description |
|----------|------|-------------|
| `separator` | `string` | Pattern separator character (default: '/') |
| `expressions` | `Map<string, EventExpression>` | Map of event names to regex expressions |
| `after` | `EventHook<M[keyof M]>` | Hook called after each task execution (inherited) |
| `before` | `EventHook<M[keyof M]>` | Hook called before each task execution (inherited) |
| `event` | `Event<M[keyof M]>` | Current event match information (inherited) |
| `listeners` | `object` | Frozen shallow copy of all event listeners (inherited) |

### Methods

The following methods are available when instantiating an ExpressEmitter.

#### Adding Pattern-Based Event Listeners

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

#### Adding Regex Event Listeners

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

#### Pattern Matching

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

#### Using Other ExpressEmitters

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

### Pattern Syntax

ExpressEmitter supports several pattern matching syntaxes:

#### Wildcard Patterns

```typescript
// Single wildcard - matches one segment
emitter.on('user *', handler); // Matches: 'user login', 'user logout'

// Double wildcard - matches multiple segments  
emitter.on('api **', handler); // Matches: 'api/users/123/posts'
```

#### Parameter Extraction

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

#### Mixed Patterns

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

### Event Data Structure

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

### Custom Separators

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

### Regular Expression Support

ExpressEmitter supports both global and non-global regular expressions:

```typescript
// Global regex - uses matchAll()
emitter.on(/user-(.+)/g, handler);

// Non-global regex - uses match()
emitter.on(/user-(.+)/, handler);

// Case insensitive
emitter.on(/USER-(.+)/i, handler);
```

### Priority-Based Execution

Like EventEmitter, ExpressEmitter supports priority-based execution:

```typescript
emitter.on('user *', handler1, 1);      // Lower priority
emitter.on('user login', handler2, 5);  // Higher priority  
emitter.on(/user (.+)/, handler3, 3);   // Medium priority

// Execution order: handler2, handler3, handler1
await emitter.emit('user login', data);
```

## RouteEmitter

Event-driven routing system that extends ExpressEmitter for HTTP-like route handling.

```typescript
type RouteMap = {
  'GET /users': [Request, Response];
  'POST /users': [Request, Response];
  'GET /users/:id': [Request, Response];
};

const router = new RouteEmitter<Request, Response>();
```

### Properties

The following properties are available when instantiating a RouteEmitter.

| Property | Type | Description |
|----------|------|-------------|
| `routes` | `Map<string, Route>` | Map of event names to route definitions |
| `separator` | `string` | Pattern separator (always '/') |
| `expressions` | `Map<string, EventExpression>` | Map of event names to regex expressions (inherited) |

### Methods

The following methods are available when instantiating a RouteEmitter.

#### Defining Routes

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

#### Using Other RouteEmitters

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

### Route Patterns

RouteEmitter supports Express-like route patterns:

#### Parameter Routes

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

#### Wildcard Routes

```typescript
// Single wildcard
router.route('GET', '/files/*', handler);
// Matches: GET /files/document.pdf

// Catch-all wildcard
router.route('GET', '/static/**', handler);  
// Matches: GET /static/css/main.css
```

#### Method Handling

```typescript
// Specific methods
router.route('GET', '/users', getUsers);
router.route('POST', '/users', createUser);
router.route('PUT', '/users/:id', updateUser);
router.route('DELETE', '/users/:id', deleteUser);

// Any method
router.route('ANY', '/health', healthCheck);
```

### Event Generation

RouteEmitter automatically generates event names from routes:

```typescript
router.route('GET', '/users/:id', handler);
// Generates event: 'GET /users/:id'
// Can be emitted as: router.emit('GET /users/123', req, res)

router.route('ANY', '/api/*', handler);  
// Generates regex pattern for any method
// Matches: 'GET /api/users', 'POST /api/data', etc.
```

### Integration with Router

RouteEmitter is used internally by the Router class but can be used standalone:

```typescript
const routeEmitter = new RouteEmitter<MyRequest, MyResponse>();

routeEmitter.route('GET', '/api/:resource', async (req, res) => {
  const resource = routeEmitter.event?.data.params.resource;
  // Handle API resource request
});

// Emit route events directly
await routeEmitter.emit('GET /api/users', request, response);