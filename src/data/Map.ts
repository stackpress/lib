import type { 
  CallableMap, 
  DataMapFilter,
  DataMapIterator
} from '../types.js';

/**
 * Adding extra utility methods to the native Map class
 * (that should have been there in the first place...)
 */
export default class DataMap<K = any, V = any> extends Map<K, V> {
  /**
   * Filters the data map (returns a new DataMap instance)
   */
  public filter(callback: DataMapFilter<K, V, this>) {
    const entries = Array.from(this.entries()).filter(
      entry => callback(entry[1], entry[0], this)
    );
    const constructor = this.constructor as new(map: [K, V][]) => this;
    return new constructor(entries);
  }

  /**
   * Finds the first entry that matches the callback
   */
  public find(callback: DataMapFilter<K, V, this>) {
    for (const entry of this.entries()) {
      if (callback(entry[1], entry[0], this)) {
        return entry;
      }
    }
    return undefined;
  }

  /**
   * Finds the first key that matches the callback
   */
  public findKey(callback: DataMapFilter<K, V, this>) {
    return this.find(callback)?.[0];
  }

  /**
   * Finds the first value that matches the callback
   */
  public findValue(callback: DataMapFilter<K, V, this>) {
    return this.find(callback)?.[1];
  }

  /**
   * Maps the data map values to a new data map
   */
  public map<T>(callback: DataMapIterator<K, V, this, T>) {
    const constructor = this.constructor as new() => DataMap<K, T>;
    const map = new constructor();
    for (const entry of this.entries()) {
      map.set(entry[0], callback(entry[1], entry[0], this));
    }
    return map;
  }
};

export function map<K = any, V = any> (data?: [K, V][]): CallableMap<K, V> {
  const store = new DataMap<K, V>(data);
  const callable = Object.assign(
    (name: K) => store.get(name),
    {
      clear() {
        return store.clear();
      },
      delete(name: K) {
        return store.delete(name);
      },
      entries() {
        return store.entries();
      },
      filter(callback: DataMapFilter<K, V, typeof store>) {
        return store.filter(callback);
      },
      find(callback: DataMapFilter<K, V, typeof store>) {
        return store.find(callback);
      },
      findKey(callback: DataMapFilter<K, V, typeof store>) {
        return store.findKey(callback);
      },
      findValue(callback: DataMapFilter<K, V, typeof store>) {
        return store.findValue(callback);
      },
      forEach(callback: DataMapIterator<K, V, Map<K, V>, void>) {
        return store.forEach(callback);
      },
      get(name: K) {
        return store.get(name);
      },
      has(name: K) {
        return store.has(name);
      },
      keys() {
        return store.keys();
      },
      map<T>(callback: DataMapIterator<K, V, typeof store, T>) {
        return store.map<T>(callback);
      },
      set(name: K, value: V) {
        return store.set(name, value);
      },
      values() {
        return store.values();
      }
    } as DataMap<K, V>
  );
  //magic size property
  Object.defineProperty(callable, 'size', { get: () => store.size });
  return callable;
};