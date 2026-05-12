//data
import ReadonlyMap from '../data/ReadonlyMap.js';
//client
import type {
  CallableSession,
  CookieOptions,
  Revision
} from '../types.js';

/**
 * Readonly session controller
 */
export class ReadSession extends ReadonlyMap<string, string|string[]> {
  //Every cookie setting needs a home base of its own so each key can
  //carry its own marching orders instead of borrowing one global plan.
  protected readonly _options = new Map<string, CookieOptions>();

  /**
   * Returns the session data
   */
  public get data() {
    return Object.fromEntries(this._map);
  }

  /**
   * Returns the stored cookie settings
   */
  public get options() {
    return Object.fromEntries(this._options);
  }

  /**
   * Returns the cookie settings for a single key
   */
  public getOptions(name: string) {
    return this._options.get(name);
  }
}

/**
 * Session controller that can write to response
 */
export class WriteSession extends ReadSession {
  //entries of what has been changed
  public readonly revisions = new Map<string, Revision>();

  /**
   * Clear the session
   */
  public clear(): void {
    //When the whole line retreats, clear both the session payload and the
    //cookie orders so nothing stale gets left behind on the field.
    for (const name of this.keys()) {
      this.revisions.set(name, { action: 'remove' });
      this._options.delete(name);
    }
    this._map.clear();
  }

  /**
   * Delete a session entry
   */
  public delete(name: string) {
    //If a cookie key is removed, retire its settings too so the next write
    //does not accidentally reuse an old path, age, or security policy.
    this.revisions.set(name, { action: 'remove' });
    this._options.delete(name);
    return this._map.delete(name);
  }

  /**
   * Set a session entry
   */
  public set(
    name: string,
    value: string|string[],
    options?: CookieOptions
  ) {
    //Each cookie gets its own shield here so one session key can be strict
    //and another can stay flexible without either stepping on the other.
    if (options) {
      this._options.set(name, { ...options });
    }

    //Record both the value and the keyed cookie settings so the response
    //layer can serialize exactly what changed when the dust settles.
    const revisionOptions = this._options.get(name);
    this.revisions.set(name, {
      action: 'set',
      ...(revisionOptions ? { options: revisionOptions } : {}),
      value
    });

    return this._map.set(name, value);
  }
}

/**
 * Callable Session
 */
export function session(data?: [string, string|string[]][]): CallableSession {
  const store = new WriteSession(data);
  const callable = Object.assign(
    (name: string) => store.get(name),
    {
      //Expose the same field controls on the callable wrapper so callers do
      //not need to care whether they got a class instance or the helper.
      clear: () => store.clear(),
      delete: (name: string) => store.delete(name),
      entries: () => store.entries(),
      forEach: (
        callback: (value: string|string[], key: string, map: Map<string, string|string[]>) => void
      ) => store.forEach(callback),
      get: (name: string) => store.get(name),
      getOptions: (name: string) => store.getOptions(name),
      has: (name: string) => store.has(name),
      keys: () => store.keys(),
      set: (
        name: string,
        value: string|string[],
        options?: CookieOptions
      ) => store.set(name, value, options),
      values: () => store.values()
    } as WriteSession
  );
  //magic size/data property
  Object.defineProperty(callable, 'size', { get: () => store.size });
  Object.defineProperty(callable, 'data', { get: () => store.data });
  Object.defineProperty(callable, 'options', { get: () => store.options });
  Object.defineProperty(callable, 'revisions', { get: () => store.revisions });
  return callable;
}
