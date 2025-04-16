import { describe, it, beforeEach } from 'mocha';
import { expect } from 'chai';
import FormData from '../src/data/processors/FormData.js';

// Mock Nest class to mimic the behavior of the real Nest class
class MockNest {
  public data: Map<string, any> = new Map();

  has(key: string): boolean {
    return this.data.has(key);
  }

  get(key: string): any {
    return this.data.get(key);
  }

  set(...path: any[]): void {
    const key = path.slice(0, -1).join('.');
    const value = path[path.length - 1];
    this.data.set(key, value);
  }
}

describe('FormData Tests', () => {
  let mockNest: MockNest;
  let formData: FormData;

  beforeEach(() => {
    mockNest = new MockNest();
    formData = new FormData(mockNest as any);
  });

  it('should initialize with the provided nest instance', () => {
    expect(formData.nest).to.equal(mockNest);
  });

  it('should return the current nest if no arguments are passed', () => {
    const result = formData.set();
    expect(result).to.equal(mockNest);
  });

  it('should parse and set single form-data field', () => {
    const buffer = Buffer.from('--boundary\r\nContent-Disposition: form-data; name="key"\r\n\r\nvalue\r\n--boundary--');
    formData.set('path', buffer);
    expect(mockNest.get('path.key')).to.equal('value');
  });


  it('should parse nested form-data paths', () => {
    const buffer = Buffer.from('--boundary\r\nContent-Disposition: form-data; name="nested[key]"\r\n\r\nvalue\r\n--boundary--');
    formData.set('path', buffer);
    expect(mockNest.get('path.nested.key')).to.equal('value');
  });

  it('should parse multiple fields in the same form data', () => {
    const buffer = Buffer.from(
      '--boundary\r\n' +
      'Content-Disposition: form-data; name="key1"\r\n\r\nvalue1\r\n' +
      '--boundary\r\n' +
      'Content-Disposition: form-data; name="key2"\r\n\r\nvalue2\r\n' +
      '--boundary--'
    );
    formData.set('path', buffer);
    expect(mockNest.get('path.key1')).to.equal('value1');
    expect(mockNest.get('path.key2')).to.equal('value2');
  });

  it('should handle empty form data', () => {
    const buffer = Buffer.from('');
    expect(() => formData.set('path', buffer)).to.throw('Invalid form data');
  });

  it('should gracefully handle missing Content-Disposition headers', () => {
    const buffer = Buffer.from('--boundary\r\n\r\nvalue\r\n--boundary--');
    formData.set('path', buffer);
    expect(mockNest.data.size).to.equal(0);
  });

  /*
  * ADD MORE UNIT TEST
  */


  it('should parse numeric values from form-data', () => {
    const buffer = Buffer.from(
      '--boundary\r\n' +
      'Content-Disposition: form-data; name="numberValue"\r\n\r\n' +
      '42\r\n' +
      '--boundary--'
    );
    formData.set('path', buffer);
    const numberValue = mockNest.get('path.numberValue');
    expect(numberValue).to.be.a('number');
    expect(numberValue).to.equal(42);
  });


});
