import DataMap from './Map.js';

export default class ReadonlyMap<K = any, V = any> {
  //map of map
  protected _map: DataMap<K, V>;

  /**
   * Returns the size of the map
   */
  public get size() {
    return this._map.size;
  }

  /**
   * Sets the initial values of the map
   */
  constructor(init?: [K, V][]) {
    this._map = new DataMap<K, V>(init);
  }

  /**
   * Returns the map as entries
   */
  public entries() {
    return this._map.entries();
  }

  /**
   * Filters the data map (returns a new DataMap instance)
   */
  public filter(callback: (
    value: V, 
    key?: K, 
    map?: DataMap<K, V>
  ) => boolean) {
    return this._map.filter(callback);
  }

  /**
   * Finds the first entry that matches the callback
   */
  public find(callback: (
    value: V, 
    key?: K, 
    map?: DataMap<K, V>
  ) => boolean) {
    return this._map.find(callback);
  }

  /**
   * Finds the first key that matches the callback
   */
  public findKey(callback: (
    value: V, 
    key?: K, 
    map?: DataMap<K, V>
  ) => boolean) {
    return this._map.findKey(callback);
  }

  /**
   * Finds the first value that matches the callback
   */
  public findValue(callback: (
    value: V, 
    key?: K, 
    map?: DataMap<K, V>
  ) => boolean) {
    return this._map.findValue(callback);
  }

  /**
   * Iterates over the map
   */
  public forEach(
    iterator: (value: V, key: K, set: Map<K, V>) => void, 
    arg?: unknown
  ) {
    return this._map.forEach(iterator, arg);
  }

  /**
   * Returns the value of the map
   */
  public get(key: K) {
    return this._map.get(key);
  }

  /**
   * Returns whether the map has the value
   */
  public has(key: K) {
    return this._map.has(key);
  }

  /**
   * Returns the keys of the map
   */
  public keys() {
    return this._map.keys();
  }

  /**
   * Maps the data map values to a new data map
   */
  public map<T>(callback: (
    value: V, 
    key?: K, 
    map?: DataMap<K, V>) => T
  ) {
    return this._map.map(callback);
  }

  /**
   * Returns the values of the map
   */
  public values() {
    return this._map.values();
  }   
}