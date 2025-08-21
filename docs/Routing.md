# Routing

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

## Request

Generic request wrapper that works with IncomingMessage and WHATWG (Fetch) Request.

### Properties

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

### Methods

The following methods are available when instantiating a Request.

#### Loading Request Body

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

## Response

Generic response wrapper that works with ServerResponse and WHATWG (Fetch) Response.

### Properties

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

### Methods

The following methods are available when instantiating a Response.

#### Setting JSON Response

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

#### Setting HTML Response

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

#### Setting Error Response

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

#### Setting Results Response

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

#### Setting Rows Response

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

#### Redirecting

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

#### Dispatching Response

The following example shows how to dispatch the response to the native resource.

```typescript
const nativeResponse = await res.dispatch();
```

**Returns**

The native response resource after dispatching.

#### Converting to Status Response

The following example shows how to convert the response to a status response object.

```typescript
const statusResponse = res.toStatusResponse();
// Returns: { code, status, error, errors, stack, results, total }
```

**Returns**

A StatusResponse object with all response details.

## Router

Event-driven router that extends ExpressEmitter for handling HTTP-like routing.

### Properties

The following properties are available when instantiating a Router.

| Property | Type | Description |
|----------|------|-------------|
| `routes` | `Map<string, Route>` | Map of event names to route definitions |

### Methods

The following methods are available when instantiating a Router.

#### Defining Routes

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

#### Emitting Route Events

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

#### Resolving Routes

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

#### Creating Request Objects

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

#### Creating Response Objects

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

#### Using Other Routers

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

## Route Parameters

Routes support parameter extraction using colon notation:

```typescript
router.route('GET', '/users/:id/posts/:postId', (req, res) => {
  const userId = req.data.get('id');
  const postId = req.data.get('postId');
  // Parameters are automatically added to req.data
});
```

## Cross-Platform Usage

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
