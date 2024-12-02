//local
import type { CallableSet } from '../types';

export default function set<V = any> (data?: V[]): CallableSet<V> {
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