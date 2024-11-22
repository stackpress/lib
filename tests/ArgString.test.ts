import { describe, it, beforeEach } from 'mocha';
import { expect } from 'chai';
import ArgString from '../src/processors/ArgString';

// Mock Nest class to mimic the nest behavior
class MockNest {
  public withPath: Map<string, any> = new Map();

  has(key: string): boolean {
    return this.withPath.has(key);
  }

  get(key: string): any {
    return this.withPath.get(key);
  }

  set(key: string, value: any): void {
    this.withPath.set(key, value);
  }
}

describe('ArgString Tests', () => {
  let mockNest: MockNest;
  let argString: ArgString;

  beforeEach(() => {
    mockNest = new MockNest();
    argString = new ArgString(mockNest as any);
  });

  it('should initialize with the provided nest instance', () => {
    expect(argString.nest).to.equal(mockNest);
  });

  it('should return the current nest if no arguments are passed', () => {
    const result = argString.set();
    expect(result).to.equal(mockNest);
  });

  it('should parse "--key=value" arguments correctly', () => {
    argString.set('foo', '--key=value');
    expect(mockNest.withPath.get('foo.key')).to.equal('value');
  });

  it('should parse "--key" arguments as boolean true', () => {
    argString.set('foo', '--key');
    expect(mockNest.withPath.get('foo.key')).to.be.true;
  });

  it('should parse "-abc" arguments as boolean true for all keys', () => {
    argString.set('foo', '-abc');
    expect(mockNest.withPath.get('foo.a')).to.be.true;
    expect(mockNest.withPath.get('foo.b')).to.be.true;
    expect(mockNest.withPath.get('foo.c')).to.be.true;
  });
  
  it('should push new values to existing arrays', () => {
    mockNest.set('foo.key', ['value1']);
    argString.set('foo', '--key=value2');
    expect(mockNest.withPath.get('foo.key')).to.deep.equal(['value1', 'value2']);
  });


  it('should correctly handle nested paths', () => {
    argString.set('nested', '--key=value');
    expect(mockNest.withPath.get('nested.key')).to.equal('value');
  });

  it('should handle edge cases with invalid inputs', () => {
    argString.set('--key=');
    expect(mockNest.withPath.get('key')).to.equal('');
  });

  it('should clear the nest if called with empty input', () => {
    argString.set();
    expect(mockNest.withPath.size).to.equal(0);
  });
});
