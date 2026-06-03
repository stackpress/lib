# Reflection

Thin wrapper around V8 `CallSite` stack frames.

## Import

```ts
import { Reflection } from '@stackpress/lib';
```

## When To Use It

Use `Reflection` when you need structured call-site information and your runtime exposes the V8 stack-trace API.

## API

### Static Methods

| Method | Returns | Notes |
| --- | --- | --- |
| `Reflection.stack()` | `Reflection[]` | Returns the current stack as `Reflection` objects. Returns an empty array when the V8 stack-trace hooks are unavailable. |

### Constructor

```ts
const [frame] = Reflection.stack();
```

The constructor accepts a `CallSite` object directly, but most callers use `Reflection.stack()`.

### Properties

| Name | Notes |
| --- | --- |
| `trace` | Raw `CallSite` instance. |
| `column` | Column number. |
| `evalOrigin` | Eval origin string. |
| `file` | File name. |
| `func` | Raw function reference. |
| `funcName` | Function name. |
| `line` | Line number. |
| `method` | Method name. |
| `promiseIndex` | Promise index for async `Promise.all()` or `Promise.any()` traces. |
| `self` | `this` value. |
| `type` | Type name. |

### Methods

| Method | Returns |
| --- | --- |
| `isAsync()` | `boolean` |
| `isConstructor()` | `boolean` |
| `isEval()` | `boolean` |
| `isNative()` | `boolean` |
| `isPromiseAll()` | `boolean` |
| `isTopLevel()` | `boolean` |
| `toObject()` | plain-object snapshot |

## Example

```ts
import { Reflection } from '@stackpress/lib';

const stack = Reflection.stack();
const first = stack[0]?.toObject();
```

## Related

- [Exception](./Exception.md)
- [Types](../types/README.md)
