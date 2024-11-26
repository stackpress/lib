import type { NestedObject, CallableMap } from './types';

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
export function shouldBeAnArray(object: NestedObject<unknown>): boolean {
  if (typeof object !== 'object') {
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

export function map<K, V> (data?: [K, V][]): CallableMap<K, V> {
  const map = new Map<K, V>(data);
  return Object.assign(
    (name: K) => map.get(name),
    {
      size: map.size,
      clear: () => map.clear(),
      delete: (name: K) => map.delete(name),
      entries: () => map.entries(),
      forEach: (
        callback: (value: V, key: K, map: Map<K, V>) => void
      ) => map.forEach(callback),
      get: (name: K) => map.get(name),
      has: (name: K) => map.has(name),
      keys: () => map.keys(),
      set: (name: K, value: V) => map.set(name, value),
      toString: () => map.toString(),
      values: () => map.values()
    } as Map<K, V>
  );
};