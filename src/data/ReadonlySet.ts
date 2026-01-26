import DataSet from './Set.js';
export default class ReadonlySet<V = any> {
  //map of set
  protected _set: DataSet<V>;
  /**
   * Sets the initial values of the set
   */
  constructor(init?: V[]) {
    this._set = new DataSet<V>(init);
  }

  /**
   * Returns the set as entries
   */
  public entries() {
    return this._set.entries();
  }

  /**
   * Filters the data map (returns a new DataSet instance)
   */
  public filter(callback: (
    value: V, 
    index?: number, 
    set?: DataSet<V>
  ) => boolean) {
    return this._set.filter(callback);
  }

  /**
   * Finds the first entry that matches the callback
   */
  public find(callback: (
    value: V, 
    index?: number, 
    set?: DataSet<V>
  ) => boolean) {
    return this._set.find(callback);
  }

  /**
   * Finds the first index that matches the callback
   */
  public findIndex(callback: (
    value: V, 
    index?: number, 
    set?: DataSet<V>
  ) => boolean) {
    return this._set.findIndex(callback);
  }

  /**
   * Finds the first value that matches the callback
   */
  public findValue(callback: (
    value: V, 
    index?: number, 
    set?: DataSet<V>
  ) => boolean) {
    return this._set.findValue(callback);
  }

  /**
   * Iterates over the set
   */
  public forEach(
    iterator: (value: V, value2: V, set: Set<V>) => void, 
    arg?: unknown
  ) {
    return this._set.forEach(iterator, arg);
  }

  /**
   * Returns whether the set has the value
   */
  public has(value: V) {
    return this._set.has(value);
  }

  /**
   * Returns the value at the given index
   */
  public index(index: number) {
    return this._set.index(index);
  }

  /**
   * Maps the data map values to a new data map
   */
  public map<T>(callback: (
    value: V, 
    index?: number, 
    set?: DataSet<V>
  ) => T) {
    return this._set.map(callback);
  }

  /**
   * Returns the keys of the set
   */
  public keys() {
    return this._set.keys();
  }

  /**
   * Returns the size of the set
   */
  public get size() {
    return this._set.size;
  }

  /**
   * Returns the values of the set
   */
  public values() {
    return this._set.values();
  }
}