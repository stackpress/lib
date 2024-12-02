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
  errors?: NestedObject<string>,
  start?: number,
  end?: number,
  stack?: Trace[]
};

export type SuccessResponse<T = unknown> = ResponseStatus & {
  results: T,
  total?: number
};

export type StatusResponse<T = unknown> = ErrorResponse|SuccessResponse<T>;

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