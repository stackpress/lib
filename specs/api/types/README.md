# Types

Public type families exported from `@stackpress/lib/types`.

## Import

```ts
import type {
  CallableMap,
  CallableNest,
  CallableSet,
  CookieOptions,
  ErrorResponse,
  Event,
  EventData,
  EventHook,
  EventMap,
  EventMatch,
  FileSystem,
  NestedObject,
  RequestOptions,
  ResponseOptions,
  ResponseStatus,
  Route,
  RouteAction,
  RouteMap,
  RouterAction,
  RouterMap,
  StatusResponse,
  SuccessResponse,
  TemplateOptions,
  TerminalInputConfig,
  TypeOf
} from '@stackpress/lib/types';
```

Use `@stackpress/lib/types` when you want a dedicated import path for the public
type surface. Many of these types are also re-exported from the root barrel, but
the `types` subpath is the clearest stable reference point.

## Data Types

| Type | Purpose |
| --- | --- |
| `TypeOf<T>` | Normalizes primitive generic reads. |
| `Key` | `string | number` path segments. |
| `NestedObject<V>` | Nested object tree. |
| `UnknownNest` | `NestedObject<unknown>`. |
| `Scalar` | `string | number | boolean | null`. |
| `Hash` | Nested scalar-only object. |
| `ScalarInput` | Scalar, scalar array, or hash. |
| `CallableNest<M>` | Callable wrapper returned by `nest()`. |
| `CallableMap<K, V>` | Callable wrapper returned by `map()`. |
| `CallableSet<V>` | Callable wrapper returned by `set()`. |

## Status And Error Types

| Type | Purpose |
| --- | --- |
| `ResponseStatus` | `{ code, status }`. |
| `ErrorResponse` | Error status payload with `error`, `errors`, `stack`, and optional position fields. |
| `SuccessResponse<T>` | Success payload with `results` and `total`. |
| `StatusResponse<T>` | Partial combination of error and success fields. |
| `Trace` | Parsed stack frame metadata. |
| `CookieOptions` | Cookie serialization options. |
| `CookieParseOptions` | Cookie parse options. |
| `CookieSerializeOptions` | Cookie serialize options. |

## Queue And Event Types

| Type | Purpose |
| --- | --- |
| `Item<I>` | Priority queue item. |
| `TaskResult` | Allowed task return shape. |
| `TaskAction<A>` | Async or sync queue task signature. |
| `TaskItem<A>` | Queue item wrapping a task. |
| `EventMap` | Event-name to argument-tuple map. |
| `EventName<M>` | Event-name key type. |
| `EventData` | Extracted args and params. |
| `EventMatch` | Match metadata. |
| `Event<A>` | Current event plus action and args. |
| `EventHook<A>` | Hook signature for emitter before/after callbacks. |
| `EventExpression` | Stored expression metadata. |

## Router Types

| Type | Purpose |
| --- | --- |
| `Body` | Allowed request/response body types. |
| `ResponseDispatcher<S>` | Native response adapter signature. |
| `ResponseOptions<S>` | Response constructor options. |
| `Headers` | Plain-object header map. |
| `Data` | Request data input shape. |
| `Query` | Query input shape. |
| `Session` | Session input shape. |
| `Post` | Post-body input shape. |
| `LoaderResults` | Return shape for `RequestLoader`. |
| `RequestLoader<R>` | Request body loader signature. |
| `CallableSession` | Callable wrapper returned by `session()`. |
| `RequestOptions<R>` | Request constructor options. |
| `Revision` | Pending session write instruction. |
| `Method` | Allowed request method names. |
| `Route` | `{ method, path }`. |
| `RouteMap<R, S>` | Event map for route emitters. |
| `RouteAction<R, S>` | Route emitter action signature. |
| `RouterContext<R, S, X>` | Handler context type. |
| `RouterArgs<R, S, X>` | Router handler tuple. |
| `RouterMap<R, S, X>` | Event map for routers. |
| `RouterAction<R, S, X>` | Router handler signature. |

## Filesystem Types

| Type | Purpose |
| --- | --- |
| `FileRecursiveOption` | Recursive mkdir option. |
| `FileStat` | Minimal stat interface. |
| `FileStream` | Minimal readable-stream interface. |
| `FileSystem` | Filesystem contract consumed by `FileLoader`. |
| `CallSite` | V8 stack-frame interface used by `Reflection`. |

## Terminal And Template Types

| Type | Purpose |
| --- | --- |
| `TerminalInputTheme` | Prompt theme options. |
| `TerminalInputConfig` | Prompt configuration. |
| `TerminalInputContext` | Prompt I/O context. |
| `TerminalTTYInput` | Input stream contract. |
| `TerminalTTYOutput` | Output stream contract. |
| `TerminalPromptState` | Prompt render state. |
| `TemplateHelperOptions` | Helper execution context. |
| `TemplateHelper` | Template helper signature. |
| `TemplateResolver` | Value resolver signature. |
| `TemplateOptions` | `TemplateEngine` configuration. |

## Related

- [Nest](../data/Nest.md)
- [Router](../router/Router.md)
- [Template](../runtime/Template.md)
- [Terminal](../runtime/Terminal.md)
