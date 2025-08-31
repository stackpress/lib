# Routing

Event-driven routing system with generic Request and Response wrappers that work across different platforms. Provides cross-platform request/response handling, parameter extraction from routes, event-driven architecture, and generic type support for different mediums including HTTP, terminal, and web sockets.

```typescript
type RequestData = { userId: string };
type ResponseData = { message: string };

const router = new Router<RequestData, ResponseData>();

router.route('GET', '/users/:id', async (req, res, ctx) => {
  const userId = req.data.get('id');
  res.setJSON({ message: `User ${userId}` });
});
```

## 1. Request

Generic request wrapper that works with IncomingMessage and WHATWG (Fetch) Request. The Request class provides a unified interface for handling different types of requests across various platforms while maintaining type safety and consistent API access patterns.

### 1.1. Properties

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

### 1.2. Loading Request Body

The following example shows how to load the request body asynchronously for processing.

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

## 2. Response

Generic response wrapper that works with ServerResponse and WHATWG (Fetch) Response. The Response class provides a unified interface for generating different types of responses with consistent formatting and status handling across platforms.

### 2.1. Properties

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

### 2.2. Setting JSON Response

The following example shows how to set a JSON response with optional status code and message.

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

### 2.3. Setting HTML Response

The following example shows how to set an HTML response for web page rendering.

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

### 2.4. Setting Error Response

The following example shows how to set an error response with validation details and stack trace.

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

### 2.5. Setting Results Response

The following example shows how to set a single result response for API endpoints.

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

### 2.6. Setting Rows Response

The following example shows how to set a collection response with pagination information.

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

### 2.7. Redirecting

The following example shows how to redirect the response to a different URL.

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

### 2.8. Dispatching Response

The following example shows how to dispatch the response to the native resource for final processing.

```typescript
const nativeResponse = await res.dispatch();
```

**Returns**

The native response resource after dispatching.

### 2.9. Converting to Status Response

The following example shows how to convert the response to a status response object for API consistency.

```typescript
const statusResponse = res.toStatusResponse();
// Returns: { code, status, error, errors, stack, results, total }
```

**Returns**

A StatusResponse object with all response details.

## 3. Router

Event-driven router that extends ExpressEmitter for handling HTTP-like routing. The Router class provides the main interface for defining routes, handling requests, and managing the routing lifecycle with full event-driven capabilities.

### 3.1. Properties

The following properties are available when instantiating a Router.

| Property | Type | Description |
|----------|------|-------------|
| `routes` | `Map<string, Route>` | Map of event names to route definitions |

### 3.2. Defining Routes

The following example shows how to define routes with different HTTP methods and parameter extraction.

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

### 3.3. Emitting Route Events

The following example shows how to emit route events directly for programmatic route execution.

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

### 3.4. Resolving Routes

The following example shows how to resolve routes and get response data for testing or internal processing.

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

### 3.5. Creating Request Objects

The following example shows how to create request objects with various initialization options.

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

### 3.6. Creating Response Objects

The following example shows how to create response objects with predefined headers and data.

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

### 3.7. Using Other Routers

The following example shows how to merge routes and listeners from another router for modular organization.

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

## 4. Route Parameters

Routes support parameter extraction using colon notation for dynamic path segments. Parameters are automatically extracted and made available through the request data object for easy access in route handlers.

```typescript
router.route('GET', '/users/:id/posts/:postId', (req, res) => {
  const userId = req.data.get('id');
  const postId = req.data.get('postId');
  // Parameters are automatically added to req.data
});
```

## 5. Cross-Platform Usage

The Router system is designed to work across different platforms and environments. This flexibility allows you to use the same routing patterns whether you're building web applications, CLI tools, or real-time applications.

### 5.1. Supported Platforms

The following platforms are supported by the routing system with their respective request/response types.

 - **HTTP Servers** — Node.js IncomingMessage/ServerResponse
 - **WHATWG Fetch** — Browser/Deno Request/Response
 - **Terminal Applications** — Custom request/response objects
 - **WebSockets** — Custom message handling

### 5.2. Platform-Specific Examples

```typescript
// HTTP Server usage
const httpRouter = new Router<IncomingMessage, ServerResponse>();

// Terminal usage  
const terminalRouter = new Router<TerminalInput, TerminalOutput>();

// WebSocket usage
const wsRouter = new Router<WebSocketMessage, WebSocketResponse>();
