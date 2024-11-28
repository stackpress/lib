import type { NestedObject, CallableMap, CallableSet } from './types';

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

export function map<K = any, V = any> (data?: [K, V][]): CallableMap<K, V> {
  const store = new Map<K, V>(data);
  const callable = Object.assign(
    (name: K) => store.get(name),
    {
      clear: () => store.clear(),
      delete: (name: K) => store.delete(name),
      entries: () => store.entries(),
      forEach: (
        callback: (value: V, key: K, map: Map<K, V>) => void
      ) => store.forEach(callback),
      get: (name: K) => store.get(name),
      has: (name: K) => store.has(name),
      keys: () => store.keys(),
      set: (name: K, value: V) => store.set(name, value),
      values: () => store.values()
    } as Map<K, V>
  );
  //magic size property
  Object.defineProperty(callable, 'size', { get: () => store.size });
  return callable;
};

export function set<V = any> (data?: V[]): CallableSet<V> {
  const store = new Set<V>(data);
  const callable = Object.assign(
    (index: number) => Array.from(store.values())[index],
    {
      add: (value: V) => store.add(value),
      clear: () => store.clear(),
      delete: (value: V) => store.delete(value),
      entries: () => store.entries(),
      forEach: (
        callback: (value: V, value2: V, set: Set<V>) => void
      ) => store.forEach(callback),
      has: (value: V) => store.has(value),
      index: (index: number) => Array.from(store.values())[index],
      values: () => store.values()
    } as Set<V> & {
      index: (index: number) => V|undefined
    }
  );
  //magic size property
  Object.defineProperty(callable, 'size', { get: () => store.size });
  return callable;
};

