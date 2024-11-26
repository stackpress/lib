import type { IncomingMessage, ServerResponse } from 'http';
import type Nest from './Nest';

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

export type CallableMap<K, V> = ((name: K) => V|undefined) & Map<K, V>;
export type CallableNest<M extends UnknownNest = UnknownNest> = (
  <T = any>(...path: Key[]) => T
) & Nest<M>;

//--------------------------------------------------------------------//
// Status Types

export type Status = {
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

export type ErrorResponse = Status & {
  error: string,
  errors?: NestedObject<string>,
  start?: number,
  end?: number,
  stack?: Trace[]
};

export type SuccessResponse<T = unknown> = Status & {
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
//export type EventAction<A extends Array<unknown>> = TaskAction<A>;
export type EventMatch = {
  //The name of the event
  event: string;
  //The regexp pattern of the event
  pattern: string;
  //Parameters extracted from the pattern
  parameters: string[];
}

export interface Event<A extends Array<unknown>> extends TaskItem<A> {
  //The name of the event
  event: string;
  //The regexp pattern of the event
  pattern: string;
  //Parameters extracted from the pattern
  parameters: string[];
}

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