# Types

Public type families exported from `@stackpress/lib/types`.

## Import

```ts
import type {
  CallableMap,
  CallableNest,
  CallableSet,
  Constructor,
  CookieOptions,
  CookieParseOptions,
  CookieSerializeOptions,
  Data,
  DataMapFilter,
  DataMapIterator,
  DataSetFilter,
  DataSetIterator,
  ErrorResponse,
  Event,
  EventData,
  EventExpression,
  EventHook,
  EventMap,
  EventMatch,
  EventName,
  ExtendsType,
  FileMeta,
  FileRecursiveOption,
  FileStat,
  FileStream,
  FileSystem,
  Hash,
  Headers,
  Infer,
  Item,
  Key,
  KeyPath,
  LoaderResults,
  Merge,
  Method,
  NestedObject,
  PathObject,
  PathValue,
  Post,
  Query,
  Body,
  CallSite,
  CallableSession,
  ResponseDispatcher,
  RequestLoader,
  RequestOptions,
  Revision,
  ResponseOptions,
  ResponseStatus,
  Route,
  RouteAction,
  RouteMap,
  RouterArgs,
  RouterAction,
  RouterContext,
  RouterMap,
  Scalar,
  ScalarInput,
  Session,
  SetInputResult,
  SetResult,
  StatusResponse,
  SuccessResponse,
  TaskAction,
  TaskItem,
  TaskResult,
  TemplateHelper,
  TemplateHelperOptions,
  TemplateOptions,
  TemplateResolver,
  TerminalInputConfig,
  TerminalInputContext,
  TerminalInputTheme,
  TerminalPromptState,
  TerminalTTYInput,
  TerminalTTYOutput,
  Trace,
  UnknownNest,
  TypeOf,
  ValueAt,
  Widen
} from '@stackpress/lib/types';
```

Use `@stackpress/lib/types` when you want a dedicated import path for the public
type surface. The root barrel re-exports the most commonly consumed type names,
but `@stackpress/lib/types` is the stable import path for the full type module.

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
| `FileMeta` | File wrapper metadata used by multipart parsing. |
| `CallableNest<M>` | Callable wrapper returned by `nest()`. |
| `CallableMap<K, V>` | Callable wrapper returned by `map()`. |
| `CallableSet<V>` | Callable wrapper returned by `set()`. |
| `DataSetIterator` | Callback shape for `DataSet#map()`. |
| `DataSetFilter` | Callback shape for `DataSet#filter()` and find helpers. |
| `DataMapIterator` | Callback shape for `DataMap#map()`. |
| `DataMapFilter` | Callback shape for `DataMap#filter()` and find helpers. |

## Lower-Level Utility Types

These types support the generic return values used by the data helpers. Most
callers do not need to import them directly unless they are extending the
library's typed path behavior.

| Type | Purpose |
| --- | --- |
| `ExtendsType<T, U>` | Combines an override shape with the remaining keys from another type. |
| `Constructor<T, U>` | Constructor contract with optional static fields. |
| `KeyPath` | Readonly array of nested path segments. |
| `Infer` | Internal marker used by callable generic defaults. |
| `Widen<T>` | Widens literal values to their primitive or object shapes. |
| `ValueAt<T, K>` | Resolves the value type at one path segment. |
| `PathValue<T, P>` | Resolves the value type at a nested path. |
| `PathObject<P, V>` | Builds an object shape from a path and value type. |
| `Merge<A, B>` | Merges object shapes for nested writes. |
| `SetResult<M, P, V>` | Result type for one path-based `set()` operation. |
| `SetInputResult<M, I>` | Result type for callable `set()` input overloads. |

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
