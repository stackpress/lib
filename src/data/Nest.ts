//common
import type { 
  Key, 
  TypeOf,
  NestedObject, 
  UnknownNest, 
  CallableNest 
} from '../types.js';
import Exception from '../Exception.js';
//processors
import ArgString from './processors/ArgString.js';
import PathString from './processors/PathString.js';
import QueryString from './processors/QueryString.js';
import FormData from './processors/FormData.js';
//local
import ReadonlyNest from './ReadonlyNest.js';

/**
 * Nest easily manipulates object data
 */
export default class Nest<M extends UnknownNest = UnknownNest> 
  extends ReadonlyNest<M>
{
  /**
   * Parser for terminal args
   */
  public withArgs: ArgString;

  /**
   * Parser for multipart/form-data
   */
  public withFormData: FormData;

  /**
   * Parser for path notations
   */
  public withPath: PathString;

  /**
   * Parser for query string
   */
  public withQuery: QueryString;

  /**
   * Returns the raw data
   */
  public get data(): M {
    return this._data;
  }

  /**
   * Safely sets the data
   */
  public set data(data: M) {
    Exception.require(
      data?.constructor === Object, 
      'Argument 1 expected Object'
    );
    this._data = data;
  }

  /**
   * Sets the initial data
   */
  public constructor(data: M = {} as M) {
    super(data);
    this.withArgs = new ArgString(this);
    this.withFormData = new FormData(this);
    this.withPath = new PathString(this);
    this.withQuery = new QueryString(this);
  }

  /**
   * Clears all the data
   */
  public clear() {
    this._data = {} as M;
    return this;
  }

  /**
   * Removes the data from a specified path
   */
  public delete(...path: Key[]) {
    if (!path.length) {
      return this;
    }

    if (!this.has(...path)) {
      return this;
    }

    const last = path.pop() as Key;
    let pointer = this._data as UnknownNest;

    path.forEach(step => {
      pointer = pointer[step] as UnknownNest;
    });

    delete pointer[last];

    return this;
  }

  /**
   * Sets the data of a specified path
   */
  public set(...path: any[]) {
    if (path.length < 1) {
      return this;
    }

    if (typeof path[0] === 'object') {
      Object.keys(path[0]).forEach(key => {
        this.set(key, path[0][key]);
      });

      return this;
    }

    const value = path.pop();
    let last = path.pop(), pointer = this._data as UnknownNest;

    path.forEach((step, i) => {
      if (step === null || step === '') {
        path[i] = step = Object.keys(pointer).length;
      }

      if (typeof pointer[step] !== 'object') {
        pointer[step] = {};
      }

      pointer = pointer[step] as UnknownNest;
    });

    if (last === null || last === '') {
      last = Object.keys(pointer).length;
    }

    pointer[last] = value;

    //loop through the steps one more time fixing the objects
    pointer = this._data;
    path.forEach((step) => {
      const next = pointer[step] as UnknownNest;
      //if next is not an array and next should be an array
      if (!Array.isArray(next) && shouldBeAnArray(next)) {
        //transform next into an array
        pointer[step] = makeArray(next);
      //if next is an array and next should not be an array
      } else if (Array.isArray(next) && !shouldBeAnArray(next)) {
        //transform next into an object
        pointer[step] = makeObject(next);
      }

      pointer = pointer[step] as UnknownNest;
    });

    return this;
  }
}

/**
 * Returns the parsed form data from the request body (if any)
 */
export function formDataToObject(type: string, body: string) {
  return type.endsWith('/json') 
    ? objectFromJson(body)
    : type.endsWith('/x-www-form-urlencoded')
    ? objectFromQuery(body)
    : type.startsWith('multipart/form-data')
    ? objectFromFormData(body)
    : {} as Record<string, unknown>;
};

/**
 * Returns true if the value is a native JS object
 */
export function isObject(value: unknown) {
  return typeof value === 'object' && value?.constructor?.name === 'Object';
};

/**
 * Transforms an object into an array
 */
export function makeArray(object: NestedObject<unknown>): any[] {
  const array: any[] = [];
  const keys = Object.keys(object);
  
  keys.sort();
  
  keys.forEach(function(key) {
    array.push(object[key]);
  })

  return array;
}

/**
 * Transforms an array into an object
 */
export function makeObject(array: any[]): NestedObject<unknown> {
  return Object.assign({}, array as unknown);
}

/**
 * Returns the parsed data from the given cli arguments
 */
export function objectFromArgs(args: string) {
  if (args) {
    const nest = new Nest();
    nest.withArgs.set(args);
    return nest.get();
  }
  return {};
}

/**
 * Transform JSON string into object
 * This is usually from body application/json
 * or text/json
 */
export function objectFromJson(json: string) {
  if (json.startsWith('{')) {
    return JSON.parse(json) as Record<string, unknown>;
  }
  return {} as Record<string, unknown>;
};

/**
 * Transform query string into object
 * This is usually from URL.search or 
 * body application/x-www-form-urlencoded
 */
export function objectFromQuery(query: string) {
  if (query.startsWith('?')) {
    query = query.substring(1);
  }
  if (query) {
    const nest = new Nest();
    nest.withQuery.set(query);
    return nest.get();
  }
  return {};
};

/**
 * Transform form data into object
 * This is usually from body multipart/form-data
 */
export function objectFromFormData(data: string) {
  if (data) {
    const nest = new Nest();
    nest.withFormData.set(data);
    return nest.get();
  }
  return {};
};

/**
 * Returns true if object keys is all numbers
 */
export function shouldBeAnArray(object: NestedObject<unknown> | null | undefined): boolean {
  // Check for null, undefined, or non-object types
  if (!object || typeof object !== 'object') {
    return false;
  }

  const length = Object.keys(object).length

  if (!length) {
    return false;
  }

  for (let i = 0; i < length; i++) {
    if (typeof object[i] === 'undefined') {
      return false;
    }
  }

  return true;
}

export function nest<M extends UnknownNest = UnknownNest>(data?: M): CallableNest<M> {
  const store = new Nest<M>(data);
  const callable = Object.assign(
    <T = any>(...path: Key[]) => store.get<T>(...path),
    {
      clear: () => store.clear(),
      delete: (...path: Key[]) => store.delete(...path),
      entries: () => store.entries(),
      forEach: (...path: Key[]) => store.forEach(...path),
      get: <T = any>(...path: Key[]) => store.get<T>(...path),
      has: (...path: Key[]) => store.has(...path),
      keys: () => store.keys(),
      path: <T = any>(path: string, defaults?: TypeOf<T>) => store.path<T>(path, defaults),
      set: (...path: any[]) => store.set(...path),
      toString: () => store.toString(),
      values: () => store.values(),
      withArgs: store.withArgs,
      withFormData: store.withFormData,
      withPath: store.withPath,
      withQuery: store.withQuery
    } as Nest<M>
  );
  //magic size/data property
  Object.defineProperty(callable, 'size', { get: () => store.size });
  Object.defineProperty(callable, 'data', { get: () => store.data });
  return callable;
};