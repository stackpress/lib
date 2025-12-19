//modules
import type { Readable } from 'node:stream';
import type { IncomingMessage, ServerResponse } from 'node:http';
//data
import type Nest from './data/Nest.js';
//router
import type { WriteSession } from './router/Session.js';
import type Request from './router/Request.js';
import type Response from './router/Response.js';
import type Router from './router/Router.js';

//--------------------------------------------------------------------//
// General Types

export type ExtendsType<T, U> = U & Pick<T, Exclude<keyof T, keyof U>>;

export type Constructor<T, U extends Record<string, unknown> = {}> = U & {
  new (): T
};

//--------------------------------------------------------------------//
// Data Types

export type TypeOf<T> = T extends number
  ? number
  : T extends string
  ? string
  : T extends boolean
  ? boolean
  : T extends undefined
  ? any
  : T extends null
  ? null
  : T;

export type Key = string|number;
export interface NestedObject<V = unknown> {
  [ key: Key ]: V|NestedObject<V>
};
export type UnknownNest = NestedObject<unknown>;
export type Scalar = string|number|boolean|null;
export type Hash = NestedObject<Scalar>;
export type ScalarInput = Scalar|Scalar[]|Hash;

export type FileMeta = {
  data: Buffer|string,
  name: string,
  type: string
};

export type CallableSet<V = any> = ((index: number) => V|undefined) & Set<V> & {
  index: (index: number) => V|undefined
};
export type CallableMap<K = any, V = any> = ((name: K) => V|undefined) & Map<K, V>;
export type CallableNest<M extends UnknownNest = UnknownNest> = (
  <T = any>(...path: Key[]) => T
) & Nest<M>;

//--------------------------------------------------------------------//
// Cookie Types

export type CookieOptions = {
  domain?: string,
  expires?: Date,
  httpOnly?: boolean,
  maxAge?: number,
  path?: string,
  partitioned?: boolean,
  priority?: 'low'|'medium'|'high',
  sameSite?: boolean|'lax'|'strict'|'none',
  secure?: boolean
};

export type CookieParseOptions = {
  decode?: (str: string) => string | undefined
};

export type CookieSerializeOptions = CookieOptions & {
  encode?: (str: string) => string
};

//--------------------------------------------------------------------//
// Status Types

export type ResponseStatus = {
  code: number, 
  status: string
};

export type Trace = { 
  method: string, 
  file: string, 
  line: number, 
  char: number 
};

export type ErrorResponse = ResponseStatus & {
  error: string,
  errors?: NestedObject<string|string[]>,
  start?: number,
  end?: number,
  stack?: Trace[]
};

export type SuccessResponse<T = unknown> = ResponseStatus & {
  results: T,
  total?: number
};

export type StatusResponse<T = unknown> = Partial<ErrorResponse & SuccessResponse<T>>;

//--------------------------------------------------------------------//
// DataQueue Types

export interface Item<I> { item: I, priority: number };

//--------------------------------------------------------------------//
// TaskQueue Types

export type TaskResult = boolean
  | undefined
  | void
  | Promise<boolean | undefined | void>;
export type TaskAction<A extends Array<unknown>> = (...args: A) => TaskResult;
export type TaskItem<A extends Array<unknown>> = Item<TaskAction<A>>;

//--------------------------------------------------------------------//
// EventEmitter Types

//map of event names to their arguments
export type EventMap = Record<string, Array<unknown>>;
export type EventName<M extends EventMap> = string & keyof M;
export type EventData = {
  args: string[],
  params: Record<string, string>
};
export type EventMatch = {
  //The name of the event
  event: string,
  //The regexp pattern of the event
  pattern: string,
  //Parameters extracted from the pattern
  data: EventData
};

export type Event<A extends Array<unknown>> = TaskItem<A> & EventMatch & {
  //The arguments passed to the event
  args: A,
  //The event hook
  action: TaskAction<A>
};

export type EventHook<A extends Array<unknown>> = TaskAction<[Event<A>]>;
export type EventExpression = { pattern: string, regexp: RegExp };

//--------------------------------------------------------------------//
// Response Types

export type Body = string | Buffer | Uint8Array | Readable | ReadableStream
  | Record<string, unknown> | Array<unknown>;

export type ResponseDispatcher<S = unknown> = (res: Response<S>) => Promise<S>;

export type ResponseOptions<S = unknown> = { 
  body?: Body,
  headers?: Headers,
  mimetype?: string,
  data?: Data,
  resource?: S
};

//--------------------------------------------------------------------//
// Request Types

export type Headers = Record<string, string|string[]> 
  | Map<string, string|string[]>;
export type Data = Map<string, any> | NestedObject;
export type Query = string | Map<string, any> | NestedObject;
export type Session = Record<string, string> | Map<string, string>;
export type Post = Record<string, unknown> | Map<string, any>;
export type LoaderResults = { body?: Body, post?: Post };
export type RequestLoader<R = unknown> = (
  req: Request<R>
) => Promise<LoaderResults|undefined>;

export type CallableSession = (
  (name: string) => string|string[]|undefined
) & WriteSession;

export type RequestOptions<R = unknown> = {
  resource: R,
  body?: Body,
  headers?: Headers,
  mimetype?: string,
  data?: Data,
  method?: Method,
  query?: Query,
  post?: Post,
  session?: Session,
  url?: string|URL
};

//--------------------------------------------------------------------//
// Session Types

//this is a revision entry
export type Revision = {
  action: 'set'|'remove',
  value?: string|string[]
};

//--------------------------------------------------------------------//
// Router Types

export type Method = 'ALL' 
  | 'CONNECT' | 'DELETE'  | 'GET' 
  | 'HEAD'    | 'OPTIONS' | 'PATCH' 
  | 'POST'    | 'PUT'     | 'TRACE';

export type Route = { method: string, path: string };

export type RouteMap<R = unknown, S = unknown> = Record<string, [ R, S ]>;
export type RouteAction<R = unknown, S = unknown> = TaskAction<[ R, S ]>;

export type RouterContext<R, S, X> = X extends undefined ? Router<R, S>: X;
export type RouterArgs<R, S, X> = [ 
  Request<R>, 
  Response<S>, 
  RouterContext<R, S, X> 
];
export type RouterMap<
  R = unknown, 
  S = unknown,
  X = undefined
> = Record<string, RouterArgs<R, S, X>>;

export type RouterAction<
  R = unknown, 
  S = unknown,
  X = undefined
> = TaskAction<RouterArgs<R, S, X>>;

//--------------------------------------------------------------------//
// Filesystem Types

export type FileRecursiveOption = { recursive?: boolean };
export type FileStat = { isFile(): boolean };
export type FileStream = { 
  pipe: (res: ServerResponse<IncomingMessage>) => void 
};

export interface FileSystem {
  exists(path: string): Promise<boolean>;
  readFile(path: string, encoding: BufferEncoding): Promise<string>;
  realpath(string: string): Promise<string>;
  stat(path: string): Promise<FileStat>;
  writeFile(path: string, data: string): Promise<void>;
  mkdir(path: string, options?: FileRecursiveOption): Promise<void>
  createReadStream(path: string): FileStream;
  unlink(path: string): void;
};

//--------------------------------------------------------------------//
// Stack Types
export interface CallSite {
  //returns the value of this
  getThis(): unknown;
  //returns the type of this as a string. This is the name of 
  //the function stored in the constructor field of this, if 
  //available, otherwise the object’s [[Class]] internal property.
  getTypeName(): string;
  //returns the current function
  getFunction(): Function;
  //returns the name of the current function, typically its name 
  //property. If a name property is not available an attempt is 
  //made to infer a name from the function’s context.
  getFunctionName(): string;
  //returns the name of the property of this or one 
  //of its prototypes that holds the current function
  getMethodName(): string;
  //if this function was defined in a 
  //script returns the name of the script
  getFileName(): string;
  //if this function was defined in a 
  //script returns the current line number
  getLineNumber(): number;
  //if this function was defined in a 
  //script returns the current column number
  getColumnNumber(): number;
  //if this function was created using a call to eval returns 
  //a string representing the location where eval was called
  getEvalOrigin(): string;
  //is this a top-level invocation, that is, is this the global object?
  isToplevel(): boolean;
  //does this call take place in code defined by a call to eval?
  isEval(): boolean;
  //is this call in native V8 code?
  isNative(): boolean;
  //is this a constructor call?
  isConstructor(): boolean;
  //is this an async call (i.e. await, Promise.all(), or Promise.any())?
  isAsync(): boolean;
  //is this an async call to Promise.all()?
  isPromiseAll(): boolean;
  //is this an async call to Promise.any()?
  getPromiseIndex(): number|null;
};