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
