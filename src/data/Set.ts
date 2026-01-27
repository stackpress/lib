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
    const values = this.toArray().filter(
      (value, index) => callback(value, index, this)
    );
    const constructor = this.constructor as new(set: V[]) => this;
    return new constructor(values);
  }

  /**
   * Finds the first entry that matches the callback
   */
  public find(callback: DataSetFilter<V, this>) {
    const values = this.toArray();
    for (let i = 0; i < values.length; i++) {
      if (callback(values[i], i, this)) {
        return [ i, values[i] ] as [number, V];
      }
    }
    return undefined;
  }

  /**
   * Finds the first index that matches the callback
   */
  public findIndex(callback: DataSetFilter<V, this>) {
    const entry = this.find(callback);
    return Array.isArray(entry) ? entry[0] : -1;
  }

  /**
   * Finds the first value that matches the callback
   */
  public findValue(callback: DataSetFilter<V, this>) {
    const entry = this.find(callback);
    return Array.isArray(entry) ? entry[1] : undefined;
  }

  /**
   * Returns the value at the given index
   */
  public index(index: number) {
    const values = this.toArray();
    return values[index];
  }

  /**
   * Maps the data map values to a new data map
   */
  public map<T>(callback: DataSetIterator<V, this, T>) {
    const constructor = this.constructor as new() => DataSet<T>;
    const map = new constructor();
    const values = this.toArray();
    for (let i = 0; i < values.length; i++) {
      map.add(callback(values[i], i, this));
    }
    return map;
  }

  /**
   * Returns the data set as a plain array
   */
  public toArray() {
    return Array.from(this);
  }

  /**
   * Returns the data set as a JSON string
   */
  public toString(
    replacer?: (key: string, value: any) => any, 
    space?: string | number
  ) {
    return JSON.stringify(this.toArray(), replacer, space);
  }
};

export function set<V = any> (data?: V[]): CallableSet<V> {
  const store = new DataSet<V>(data);
  const callable = Object.assign(
    (index: number) => Array.from(store.values())[index],
    {
      add: store.add.bind(store),
      clear: store.clear.bind(store),
      delete: store.delete.bind(store),
      entries: store.entries.bind(store),
      filter: store.filter.bind(store),
      find: store.find.bind(store),
      findIndex: store.findIndex.bind(store),
      findValue: store.findValue.bind(store),
      forEach: store.forEach.bind(store),
      has: store.has.bind(store),
      index: store.index.bind(store),
      map: store.map.bind(store),
      toArray: store.toArray.bind(store),
      toString: store.toString.bind(store),
      values: store.values.bind(store)
    } as DataSet<V>
  );
  //magic size property
  Object.defineProperty(callable, 'size', { get: () => store.size });
  return callable;
};