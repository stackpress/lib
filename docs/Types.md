# Types

Type definitions for the Stackpress library providing type safety and structure for data manipulation, event handling, routing, and system operations. These comprehensive type definitions ensure compile-time safety and provide clear interfaces for all library components.

```typescript
import type { 
  NestedObject, 
  EventMap, 
  RouterAction 
} from '@stackpress/lib/types';
```

## 1. General Types

The following types provide general utility for type manipulation and inference across the library. These foundational types enable type-safe operations and maintain consistency throughout the Stackpress ecosystem.

### 1.1. TypeOf

Utility type that extracts the primitive type from a value, providing type-safe inference for nested object operations.

```typescript
type StringType = TypeOf<string>; // string
type NumberType = TypeOf<number>; // number
type BooleanType = TypeOf<boolean>; // boolean
type AnyType = TypeOf<undefined>; // any
type NullType = TypeOf<null>; // null
```

**Usage**

Used internally by `Nest` and other data structures to maintain type safety when accessing nested values with generic type parameters.

## 2. Data Types

The following types define structures for nested data manipulation and scalar value handling. These types provide the foundation for type-safe data operations throughout the library.

### 2.1. NestedObject

Represents a nested object structure where values can be of any type or further nested objects.

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

Used as the foundation for `Nest` data structures and configuration objects throughout the library.

### 2.2. UnknownNest

Type alias for `NestedObject<unknown>` representing a nested object with unknown value types.

```typescript
const data: UnknownNest = {
  user: { name: 'John', age: 30 },
  settings: { theme: 'dark' }
};
```

**Usage**

Used as the default type parameter for `Nest` when specific value types are not known at compile time.

### 2.3. Scalar

Union type representing primitive values that can be stored in nested structures.

```typescript
const value: Scalar = 'hello'; // string
const count: Scalar = 42; // number
const flag: Scalar = true; // boolean
const empty: Scalar = null; // null
```

**Usage**

Used in form data processing and configuration systems where only primitive values are expected.

### 2.4. Hash

Type alias for `NestedObject<Scalar>` representing a nested object structure containing only scalar values.

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

Used for configuration objects and form data where complex objects are not allowed, only primitive values.

## 3. Cookie Types

The following types define cookie configuration and parsing options for HTTP cookie management with security and behavior settings.

### 3.1. CookieOptions

Configuration options for HTTP cookies including security and behavior settings.

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

Used by the `Response` class when setting cookies and by cookie parsing utilities in the data processors.

## 4. Status Types

The following types define response status structures and error handling for consistent API responses and error management.

### 4.1. ResponseStatus

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

Used as the foundation for all response status types and by the `Status` utility for HTTP status code management.

### 4.2. ErrorResponse

Extended response structure for error conditions including error details and stack traces.

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

Used by the `Response` class for error responses and by the `Exception` class for structured error handling.

### 4.3. SuccessResponse

Extended response structure for successful operations including result data and pagination.

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

Used by the `Response` class for successful API responses and data retrieval operations.

### 4.4. StatusResponse

Union type combining error and success response structures for flexible response handling.

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

Used by router actions and event handlers that can return either success or error responses. Distinguished from `ResponseStatus` by including optional error and success fields.

### 4.5. Trace

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

Used in error responses and exception handling to provide detailed debugging information about error origins.

## 5. Queue Types

The following types define structures for queue operations and task management with priority-based processing and execution control.

### 5.1. Item

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

Used by `ItemQueue` to wrap items with priority information for ordered processing.

### 5.2. TaskItem

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

Used by `TaskQueue` to manage executable functions with priority ordering and argument type safety.

### 5.3. TaskAction

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

Can return `boolean`, `undefined`, `void`, or promises of these types. Returning `false` aborts queue processing.

**Usage**

Used to define executable functions in `TaskQueue` with type-safe arguments and standardized return behavior.

### 5.4. TaskResult

Union type for task function return values.

```typescript
const result: TaskResult = true; // Continue processing
const result2: TaskResult = false; // Abort processing
const result3: TaskResult = undefined; // Continue processing
```

**Usage**

Used internally by `TaskQueue` to handle different return types from task functions and determine processing flow.

## 6. Event Types

The following types define event system structures for type-safe event handling with pattern matching and parameter extraction.

### 6.1. Event

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

Used internally by `EventEmitter` to represent complete event objects during emission and processing.

### 6.2. EventMap

Type mapping event names to their argument types for type-safe event emission.

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

Used as a generic parameter for `EventEmitter` to provide compile-time type checking for event names and arguments.

### 6.3. EventName

Utility type extracting valid event names from an event map.

```typescript
type ValidEvents = EventName<AppEvents>; // 'user.login' | 'user.logout' | 'data.update'
```

**Usage**

Used internally by `EventEmitter` to constrain event names to those defined in the event map.

### 6.4. EventData

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

Used by `ExpressEmitter` and `RouteEmitter` for pattern-based event matching and parameter extraction.

### 6.5. EventMatch

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

Used by pattern-matching event emitters to provide information about how events were matched and what parameters were extracted.

### 6.6. EventExpression

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

Used internally by `ExpressEmitter` to store compiled patterns for efficient event matching.

## 7. Payload Types

The following types define request and response payload structures for HTTP communication and data transfer.

### 7.1. Body

Union type for HTTP request/response body content supporting various data formats.

```typescript
const stringBody: Body = 'Hello World';
const jsonBody: Body = { message: 'Hello' };
const bufferBody: Body = Buffer.from('data');
const streamBody: Body = fs.createReadStream('file.txt');
```

**Usage**

Used by `Request` and `Response` classes to handle different body types in a type-safe manner.

### 7.2. Headers

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

Used by `Request` and `Response` classes for HTTP header management with support for multiple values per header.

### 7.3. Data

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

Used by `Request` class to store merged data from query parameters, POST data, and additional context.

### 7.4. Query

URL query parameters supporting string, Map, or object representations.

```typescript
const query: Query = 'page=1&limit=10';
const queryObj: Query = { page: '1', limit: '10' };
const queryMap: Query = new Map([['page', '1'], ['limit', '10']]);
```

**Usage**

Used by `Request` class for URL query parameter handling with flexible input formats.

### 7.5. Post

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

### 7.6. ResponseOptions

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

Used by `Response` class constructor for initialization with various content types and metadata.

### 7.7. RequestOptions

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

Used by `Request` class constructor for initialization with various request components and metadata.

## 8. Session Types

The following types define session management structures for user state tracking and persistence.

### 8.1. Session

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

Used by `Request` class for session data management and by session processors for cookie-based sessions.

### 8.2. Revision

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

Used by `WriteSession` class to track session changes for persistence and rollback functionality.

## 9. Route Types

The following types define routing structures and HTTP method handling for request routing and parameter extraction.

### 9.1. Method

HTTP method enumeration supporting all standard HTTP verbs.

```typescript
const method: Method = 'GET';
const postMethod: Method = 'POST';
const allMethods: Method = 'ALL'; // Matches any method
```

**Usage**

Used by `Router` class for route registration and method-based request handling.

### 9.2. Route

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

Used by `Router` class to store route definitions and for route lookup operations.

### 9.3. RouteMap

Mapping of route patterns to request/response type pairs.

```typescript
type AppRoutes = RouteMap<IncomingMessage, ServerResponse>;
const routes: AppRoutes = {
  'GET /users': [incomingMessage, serverResponse],
  'POST /users': [postRequest, postResponse]
};
```

**Usage**

Used internally by routing systems to maintain type relationships between routes and their handlers.

### 9.4. RouteAction

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

Used by `RouteEmitter` for route handler functions with standardized request/response handling.

## 10. Router Types

The following types define router context and action structures for advanced routing scenarios with context management.

### 10.1. RouterContext

Context type for router operations, defaulting to Router when no custom context is provided.

```typescript
type DefaultContext = RouterContext<Request, Response, undefined>; // Router<Request, Response>
type CustomContext = RouterContext<Request, Response, MyContext>; // MyContext
```

**Usage**

Used by `Router` class to provide flexible context handling in route handlers.

### 10.2. RouterArgs

Argument tuple for router action functions containing request, response, and context.

```typescript
type HandlerArgs = RouterArgs<Request, Response, Router>;
// [Request, Response, Router]
```

**Usage**

Used internally by `Router` to define the argument structure for route handler functions.

### 10.3. RouterMap

Mapping of route patterns to router argument tuples.

```typescript
type AppRouterMap = RouterMap<Request, Response, Router>;
const routerMap: AppRouterMap = {
  'GET /users': [request, response, router],
  'POST /users': [postRequest, postResponse, router]
};
```

**Usage**

Used internally by routing systems to maintain type relationships between routes and their argument structures.

### 10.4. RouterAction

Function type for router handlers with request, response, and context parameters.

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

Used by `Router` class for route handler functions with full router context access.

## 11. Filesystem Types

The following types define filesystem operation interfaces for cross-platform file system abstraction and operations.

### 11.1. FileSystem

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

Used by `FileLoader` and `NodeFS` classes to provide consistent filesystem operations across different environments and platforms.
