# Exception

Enhanced error handling with expressive error reporting and stack trace support.

```typescript
const exception = new Exception('Invalid Parameters: %s', 400)
  .withErrors({
    name: 'required',
    email: 'invalid format'
  })
  .withPosition(100, 200);
```

## Static Methods

The following methods can be accessed directly from Exception itself.

### Creating Exceptions with Templates

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

### Creating Exceptions from Response Objects

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

### Creating Exceptions for Validation Errors

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

### Requiring Conditions

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

### Try-Catch Wrapper

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

### Upgrading Errors

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

## Properties

The following properties are available when instantiating an Exception.

| Property | Type | Description |
|----------|------|-------------|
| `code` | `number` | HTTP status code |
| `end` | `number` | Ending character position of the error |
| `errors` | `object` | Validation errors object |
| `start` | `number` | Starting character position of the error |
| `type` | `string` | Exception type name |

## Methods

The following methods are available when instantiating an Exception.

### Setting Error Code

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

### Adding Validation Errors

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

### Setting Position Information

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

### Converting to Response Object

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

### Converting to JSON

The following example shows how to convert the exception to JSON.

```typescript
const json = exception.toJSON();
console.log(json); // Pretty-printed JSON string
```

**Returns**

A formatted JSON string representation of the exception.

### Getting Stack Trace

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
