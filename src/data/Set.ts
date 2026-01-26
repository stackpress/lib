import type { 
  CallableSet, 
  DataSetFilter, 
  DataSetIterator 
} from '../types.js';

/**
 * Adding extra utility methods to the native Set class
 * (that should have been there in the first place...)
 */
export default class DataSet<V = any> extends Set<V> {
  /**
   * Filters the data map (returns a new DataSet instance)
   */
  public filter(callback: DataSetFilter<V, this>) {
    const values = Array.from(this).filter(
      (value, index) => callback(value, index, this)
    );
    const constructor = this.constructor as new(set: V[]) => this;
    return new constructor(values);
  }

  /**
   * Finds the first entry that matches the callback
   */
  public find(callback: DataSetFilter<V, this>) {
    const values = Array.from(this);
    for (let i = 0; i < values.length; i++) {
      if (callback(values[i], i, this)) {
        return [ i, values[i] ];
      }
    }
    return undefined;
  }

  /**
   * Finds the first index that matches the callback
   */
  public findIndex(callback: DataSetFilter<V, this>) {
    const entry = this.find(callback);
    return typeof entry !== 'undefined' ? entry[0] as number : -1;
  }

  /**
   * Finds the first value that matches the callback
   */
  public findValue(callback: DataSetFilter<V, this>) {
    return this.find(callback)?.[1];
  }

  /**
   * Returns the value at the given index
   */
  public index(index: number) {
    const values = Array.from(this);
    return values[index];
  }

  /**
   * Maps the data map values to a new data map
   */
  public map<T>(callback: DataSetIterator<V, this, T>) {
    const constructor = this.constructor as new() => DataSet<T>;
    const map = new constructor();
    const values = Array.from(this);
    for (let i = 0; i < values.length; i++) {
      map.add(callback(values[i], i, this));
    }
    return map;
  }
};

export function set<V = any> (data?: V[]): CallableSet<V> {
  const store = new DataSet<V>(data);
  const callable = Object.assign(
    (index: number) => Array.from(store.values())[index],
    {
      add(value: V) {
        return store.add(value);
      },
      clear() {
        return store.clear();
      },
      delete(value: V) {
        return store.delete(value);
      },
      entries() {
        return store.entries();
      },
      filter(callback: DataSetFilter<V, typeof store>) {
        return store.filter(callback);
      },
      find(callback: DataSetFilter<V, typeof store>) {
        return store.find(callback);
      },
      findIndex(callback: DataSetFilter<V, typeof store>) {
        return store.findIndex(callback);
      },
      findValue(callback: DataSetFilter<V, typeof store>) {
        return store.findValue(callback);
      },
      forEach(callback: (value: V, value2: V, set: Set<V>) => void) {
        return store.forEach(callback);
      },
      has(value: V) {
        return store.has(value);
      },
      index(index: number) {
        return store.index(index);
      },
      map<T>(callback: DataSetIterator<V, typeof store, T>) {
        return store.map<T>(callback);
      },
      values() {
        return store.values();
      }
    } as DataSet<V>
  );
  //magic size property
  Object.defineProperty(callable, 'size', { get: () => store.size });
  return callable;
};