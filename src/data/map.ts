//local
import type { CallableMap } from '../types.js';

export default function map<K = any, V = any> (data?: [K, V][]): CallableMap<K, V> {
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