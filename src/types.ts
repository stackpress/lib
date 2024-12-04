//modules
import type { IncomingMessage, ServerResponse } from 'node:http';
//data
import type Nest from './data/Nest';

//--------------------------------------------------------------------//
// Data Types

export type Key = string|number;
export interface NestedObject<V = unknown> {
  [ key: Key ]: V|NestedObject<V>;
};
export type UnknownNest = NestedObject<unknown>;
export type Scalar = string|number|boolean|null;
export type Hash = NestedObject<Scalar>;
export type ScalarInput = Scalar|Scalar[]|Hash;

export type FileMeta = {
  data: Buffer|string;
  name: string;
  type: string;
};

export type CallableSet<V = any> = ((index: number) => V|undefined) & Set<V> & {
  index: (index: number) => V|undefined
};
export type CallableMap<K = any, V = any> = ((name: K) => V|undefined) & Map<K, V>;
export type CallableNest<M extends UnknownNest = UnknownNest> = (
  <T = any>(...path: Key[]) => T
) & Nest<M>;

//--------------------------------------------------------------------//
// Status Types

export type ResponseStatus = {
  code: number, 
  status: string
};

//--------------------------------------------------------------------//
// Response Types

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

export type StatusResponse<T = unknown> = ErrorResponse & SuccessResponse<T>;

//--------------------------------------------------------------------//
// DataQueue Types

export interface Item<I> { item: I, priority: number };

//--------------------------------------------------------------------//
// TaskQueue Types

export type TaskResult = boolean|void|Promise<boolean|void>;
export type Task<A extends Array<unknown>> = (...args: A) => TaskResult;
export type TaskItem<A extends Array<unknown>> = Item<Task<A>>;

//--------------------------------------------------------------------//
// EventEmitter Types

//map of event names to their arguments
export type EventMap = Record<string, Array<unknown>>;
export type EventName<M extends EventMap> = string & keyof M;
export type EventMatch = {
  //The name of the event
  event: string,
  //The regexp pattern of the event
  pattern: string,
  //Parameters extracted from the pattern
  data: {
    args: string[],
    params: Record<string, string>
  }
};

export type Event<A extends Array<unknown>> = TaskItem<A> & EventMatch & {
  //The arguments passed to the event
  args: A,
  //The event hook
  action: Task<A>
};

export type EventHook<A extends Array<unknown>> = Task<[Event<A>]>;

//--------------------------------------------------------------------//
// Router Types

export type Method = 'ALL' 
  | 'CONNECT' | 'DELETE'  | 'GET' 
  | 'HEAD'    | 'OPTIONS' | 'PATCH' 
  | 'POST'    | 'PUT'     | 'TRACE';

export type Route = { method: Method, path: string };

export type RouterMap<R, S> = Record<string, [ R, S ]>;
export type RouterAction<R, S> = (req: R, res: S) => void | boolean | Promise<void|boolean>;

//--------------------------------------------------------------------//
// Filesystem Types

export type FileRecursiveOption = { recursive?: boolean };
export type FileStat = { isFile(): boolean };
export type FileStream = { 
  pipe: (res: ServerResponse<IncomingMessage>) => void 
};

export interface FileSystem {
  existsSync(path: string): boolean;
  readFileSync(path: string, encoding: BufferEncoding): string;
  realpathSync(string: string): string;
  lstatSync(path: string): FileStat;
  writeFileSync(path: string, data: string): void;
  mkdirSync(path: string, options?: FileRecursiveOption): void
  createReadStream(path: string): FileStream;
  unlinkSync(path: string): void;
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