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


  // <!------------- ADD NEW UNIT TEST TO ACHIEVE THE MORE THAN 85% --------!>

  it('should split args string into individual arguments', () => {
    argString.set('test', 'arg1 arg2 --key=value');
    expect(mockNest.withPath.get('test.0')).to.equal('arg1');
    expect(mockNest.withPath.get('test.1')).to.equal('arg2');
    expect(mockNest.withPath.get('test.key')).to.equal('value');
  });
  
  it('should handle -k=value syntax correctly', () => {
    argString.set('foo', '-k=value');
    expect(mockNest.withPath.get('foo.k')).to.equal('value');
  });
  
  it('should parse short flags grouped together (-abc)', () => {
    argString.set('bar', '-abc');
    expect(mockNest.withPath.get('bar.a')).to.be.true;
    expect(mockNest.withPath.get('bar.b')).to.be.true;
    expect(mockNest.withPath.get('bar.c')).to.be.true;
  });
  
  it('should parse short flags with values (-a value)', () => {
    argString.set('bar', '-a value');
    expect(mockNest.withPath.get('bar.a')).to.equal('value');
  });
  
  it('should correctly coerce values in _format', () => {
    argString.set('baz', '--number=42 --boolean=true --string=hello');
    expect(mockNest.withPath.get('baz.number')).to.equal(42);
    expect(mockNest.withPath.get('baz.boolean')).to.be.true;
    expect(mockNest.withPath.get('baz.string')).to.equal('hello');
  });
  
  it('should handle adding new values to arrays in _format', () => {
    mockNest.set('foo.key', ['existing']);
    argString.set('foo', '--key=newValue');
    expect(mockNest.withPath.get('foo.key')).to.deep.equal(['existing', 'newValue']);
  });
  

  it('should return the current nest when no path is provided', () => {
    const result = argString.set();
    expect(result).to.equal(mockNest);
  });
  
  it('should parse --key=value syntax into path key-value pairs', () => {
    argString.set('example', '--foo=bar');
    expect(mockNest.withPath.get('example.foo')).to.equal('bar');
  });

  it('should coerce string values into their correct types', () => {
    argString.set('coerce', '--isTrue=true --isFalse=false --number=42 --float=3.14 --string=hello');
    expect(mockNest.withPath.get('coerce.isTrue')).to.be.true;
    expect(mockNest.withPath.get('coerce.isFalse')).to.be.false;
    expect(mockNest.withPath.get('coerce.number')).to.equal(42);
    expect(mockNest.withPath.get('coerce.float')).to.equal(3.14);
    expect(mockNest.withPath.get('coerce.string')).to.equal('hello');
  });

  it('should handle an empty string as args', () => {
    argString.set('test', '');
    expect(mockNest.withPath.get('test')).to.be.undefined;
  });

  it('should skip the specified number of arguments', () => {
    argString.set('test', 'arg1 arg2 arg3', 1);
    expect(mockNest.withPath.get('test.0')).to.equal('arg2');
    expect(mockNest.withPath.get('test.1')).to.equal('arg3');
  });



  
  
});
