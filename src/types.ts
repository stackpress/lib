//--------------------------------------------------------------------//
// Data Types

export type Key = string|number;
export interface NestedObject<V = unknown> {
  [ key: Key ]: V|NestedObject<V>;
};

export type Scalar = string|number|boolean|null;
export type Hash = NestedObject<Scalar>;
export type ScalarInput = Scalar|Scalar[]|Hash;

export type FileMeta = {
  data: Buffer|string;
  name: string;
  type: string;
};

//--------------------------------------------------------------------//
// Response Types

export type Trace = { 
  method: string, 
  file: string, 
  line: number, 
  char: number 
};

export type ErrorResponse = {
  code: number,
  status: string, 
  errors?: NestedObject<string>,
  start?: number,
  end?: number,
  stack?: Trace[]
};

export type SuccessResponse<T = unknown> = {
  code: number,
  status: string, 
  results: T,
  total?: number
};

export type StatusResponse<T = unknown> = ErrorResponse|SuccessResponse<T>;

//--------------------------------------------------------------------//
// Status Types

export type Status = {
  code: number, 
  message: string
};

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
