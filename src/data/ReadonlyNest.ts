//common
import type { Key, UnknownNest } from '../types';
//local
import Path from './ReadonlyPath';

/**
 * Nest easily manipulates object data
 */
export default class ReadonlyNest<M extends UnknownNest = UnknownNest>  {
  /**
   * Parser for path notations
   */
  public withPath: Path;

  /**
   * The raw data
   */
  protected _data: M;

  /**
   * Returns the raw data
   */
  public get data(): M {
    return this._data;
  }

  /**
   * Returns the length
   */
  public get size(): number {
    return Object.keys(this._data).length;
  }

  /**
   * Sets the initial data
   */
  public constructor(data: M = {} as M) {
    this._data = data;
    this.withPath = new Path(this);
  }

  /**
   * Returns the data as an array
   */
  public entries() {
    return Object.entries(this._data);
  }

  /**
   * Loops though the data of a specified path
   */
  async forEach(...path: any[]): Promise<boolean> {
    const callback = path.pop() as Function;
    let list = this.get(...path);

    if (!list
      || Array.isArray(list) && !list.length
      || typeof list === 'string' && !list.length
      || typeof list === 'object' && !Object.keys(list).length
    ) {
      return false;
    }

    for(let key in list) {
      if ((await callback(list[key], key)) === false) {
        return false;
      }
    }

    return true;
  }

  /**
   * Retrieves the data hashd specified by the path
   */
  public get<T extends UnknownNest = M>(): T;
  public get<T = any>(...path: Key[]): T;
  public get<T = any>(...path: Key[]): UnknownNest|T {
    if (!path.length) {
      return this._data;
    }

    if (!this.has(...path)) {
      return undefined as T;
    }

    const last = path.pop() as Key;
    let pointer = this._data as UnknownNest;

    path.forEach(step => {
      pointer = pointer[step] as UnknownNest;
    });

    return pointer[last] as T;
  }

  /**
   * Returns true if the specified path exists
   */
  public has(...path: Key[]): boolean {
    if (!path.length) {
      return false;
    }

    let found = true;
    const last = path.pop() as Key;
    let pointer = this._data as UnknownNest;

    path.forEach(step => {
      if (!found) {
        return;
      }

      if (typeof pointer[step] !== 'object') {
        found = false;
        return;
      }

      pointer = pointer[step] as UnknownNest;
    });

    return !(!found || typeof pointer[last] === 'undefined');
  }

  /**
   * Returns the keys of the data
   */
  public keys() {
    return Object.keys(this._data);
  }

  /**
   * Stringifies the data
   */
  public toString(expand = true, ...path: Key[]) {
    return expand 
      ? JSON.stringify(this.get(...path), null, 2)
      : JSON.stringify(this.get(...path));
  }

  /**
   * Returns the values of the data
   */
  public values() {
    return Object.values(this._data);
  }
}