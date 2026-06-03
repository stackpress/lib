# Exception

Structured error type with response conversion, validation errors, and stack parsing.

## Import

```ts
import { Exception } from '@stackpress/lib';
```

## When To Use It

Use `Exception` when you need one error type that can move between thrown errors, response payloads, and validation-style error objects.

## API

### Constructor

```ts
const error = new Exception('Invalid input', 400);
```

### Static Methods

| Method | Returns | Notes |
| --- | --- | --- |
| `Exception.for(message, ...values)` | `Exception` | `%s` placeholder replacement. |
| `Exception.forErrors(errors)` | `Exception` | Builds an `Invalid Parameters` error. |
| `Exception.forResponse(response, message = '')` | `Exception` | Rebuilds an exception from a status response. |
| `Exception.require(condition, message, ...values)` | `void` | Throws when the condition is false. |
| `Exception.try(callback).catch(handler)` | callback result | Sync-only try/catch wrapper that normalizes error types. |
| `Exception.upgrade(error, code = 500)` | `Exception` | Wraps a regular `Error` unless it is already an `Exception`. |

### Properties

| Name | Type |
| --- | --- |
| `code` | `number` |
| `end` | `number` |
| `errors` | `NestedObject<string \| string[]>` |
| `start` | `number` |
| `type` | `string` |

### Instance Methods

| Method | Returns | Notes |
| --- | --- | --- |
| `toJSON()` | `string` | Pretty JSON string of `toResponse()`. |
| `toResponse(start = 0, end = 0)` | `ErrorResponse` | Structured error payload. |
| `trace(start = 0, end = 0)` | `Trace[]` | Parsed stack-frame metadata. |
| `withCode(code)` | `this` | Updates code and status. |
| `withErrors(errors)` | `this` | Stores field-level errors. |
| `withPosition(start, end)` | `this` | Stores source position metadata. |

## Example

```ts
import { Exception } from '@stackpress/lib';

const error = Exception
  .for('Field %s is invalid', 'email')
  .withCode(400)
  .withErrors({ email: 'invalid format' })
  .withPosition(12, 17);

const response = error.toResponse();
```

## Related

- [Response](../router/Response.md)
- [Status](./Status.md)
- [Types](../types/README.md)
