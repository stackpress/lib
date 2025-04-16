import { describe, it, beforeEach } from 'mocha';
import { expect } from 'chai';
import QueryString from '../src/data/processors/QueryString.js';

// Mock Nest class to mimic the nest behavior
class MockNest {
  public withPath: Map<string, any> = new Map();

  set(...path: any[]): void {
    const value = path.pop();
    const key = path.join('.');
    this.withPath.set(key, value);
  }

  get(...path: any[]): any {
    const key = path.join('.');
    return this.withPath.get(key);
  }
}



describe('QueryString Tests', () => {
  let mockNest: MockNest;
  let queryString: QueryString;

  beforeEach(() => {
    mockNest = new MockNest();
    queryString = new QueryString(mockNest as any);
  });

  it('should initialize with the provided nest instance', () => {
    expect(queryString.nest).to.equal(mockNest);
  });

  it('should return the current nest if no arguments are passed', () => {
    const result = queryString.set();
    expect(result).to.equal(mockNest);
  });

  it('should correctly parse single key-value pairs', () => {
    queryString.set('key=value');
    expect(mockNest.withPath.get('key')).to.equal('value');
  });

  it('should correctly parse multiple key-value pairs', () => {
    queryString.set('key1=value1&key2=value2');
    expect(mockNest.withPath.get('key1')).to.equal('value1');
    expect(mockNest.withPath.get('key2')).to.equal('value2');
  });

  it('should handle numeric values correctly', () => {
    queryString.set('key=123');
    expect(mockNest.withPath.get('key')).to.equal(123);
  });

  it('should handle boolean values correctly', () => {
    queryString.set('key=true');
    expect(mockNest.withPath.get('key')).to.equal(true);

    queryString.set('key=false');
    expect(mockNest.withPath.get('key')).to.equal(false);
  });

  it('should handle null values correctly', () => {
    queryString.set('key=null');
    expect(mockNest.withPath.get('key')).to.equal(null);
  });

  it('should decode URI components in keys and values', () => {
    queryString.set('key%20space=value%20with%20space');
    expect(mockNest.withPath.get('key space')).to.equal('value with space');
  });

  it('should handle nested paths', () => {
    queryString.set('parent[child]=value');
    expect(mockNest.withPath.get('parent.child')).to.equal('value');
  });

  it('should handle arrays in paths', () => {
    queryString.set('array[0]=value1&array[1]=value2');
    expect(mockNest.withPath.get('array.0')).to.equal('value1');
    expect(mockNest.withPath.get('array.1')).to.equal('value2');
  });

  it('should handle empty values correctly', () => {
    queryString.set('key=');
    expect(mockNest.withPath.get('key')).to.equal('');
  });

  it('should ignore invalid JSON in values', () => {
    queryString.set('key={"invalidJson":');
    expect(mockNest.withPath.get('key')).to.equal('{"invalidJson":');
  });

  it('should handle empty input gracefully', () => {
    const result = queryString.set();
    expect(result).to.equal(mockNest);
    expect(mockNest.withPath.size).to.equal(0);
  });
});
