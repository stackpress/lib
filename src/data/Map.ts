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
    const entry = this.find(callback);
    return Array.isArray(entry) ? entry[0] : undefined;
  }

  /**
   * Finds the first value that matches the callback
   */
  public findValue(callback: DataMapFilter<K, V, this>) {
    const entry = this.find(callback);
    return Array.isArray(entry) ? entry[1] : undefined;
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

  /**
   * Returns the data map as a plain object
   */
  public toObject() {
    return Object.fromEntries(Object.entries(this));
  }

  /**
   * Returns the data map as a JSON string
   */
  public toString(
    replacer?: (key: string, value: any) => any, 
    space?: string | number
  ) {
    return JSON.stringify(this.toObject(), replacer, space);
  }
};

export function map<K = any, V = any> (data?: [K, V][]): CallableMap<K, V> {
  const store = new DataMap<K, V>(data);
  const callable = Object.assign(
    (name: K) => store.get(name),
    {
      clear: store.clear.bind(store),
      delete: store.delete.bind(store),
      entries: store.entries.bind(store),
      filter: store.filter.bind(store),
      find: store.find.bind(store),
      findKey: store.findKey.bind(store),
      findValue: store.findValue.bind(store),
      forEach: store.forEach.bind(store),
      get: store.get.bind(store),
      has: store.has.bind(store),
      keys: store.keys.bind(store),
      map: store.map.bind(store),
      set: store.set.bind(store),
      toObject: store.toObject.bind(store),
      toString: store.toString.bind(store),
      values: store.values.bind(store)
    } as DataMap<K, V>
  );
  //magic size property
  Object.defineProperty(callable, 'size', { get: () => store.size });
  return callable;
};