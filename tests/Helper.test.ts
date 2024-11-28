import { describe, it } from 'mocha';
import { expect } from 'chai';
import { makeArray, makeObject, map, set, shouldBeAnArray } from '../src/helpers';
import { NestedObject } from '../src/types';


describe('Helper Tests', () => {
  it('should transform an object into a sorted array of values', () => {
    const input = { b: 2, a: 1, c: 3 };
    const result = makeArray(input);
    expect(result).to.deep.equal([1, 2, 3]);
  });

  it('should return an empty array for an empty object', () => {
    const input = {};
    const result = makeArray(input);
    expect(result).to.deep.equal([]);
  });

  it('should handle objects with non-numeric values', () => {
    const input = { a: 'test', b: true, c: null };
    const result = makeArray(input);
    expect(result).to.deep.equal(['test', true, null]);
  });

  it('should transform an array into an object', () => {
    const input = [1, 2, 3];
    const result = makeObject(input);
    expect(result).to.deep.equal({ 0: 1, 1: 2, 2: 3 });
  });

  it('should return an empty object for an empty array', () => {
    const input: any[] = [];
    const result = makeObject(input);
    expect(result).to.deep.equal({});
  });

  it('should handle arrays with non-numeric values', () => {
    const input = ['test', true, null];
    const result = makeObject(input);
    expect(result).to.deep.equal({ 0: 'test', 1: true, 2: null });
  });

  it('should return true for an object with consecutive numeric keys starting from 0', () => {
    const input = { 0: 'a', 1: 'b', 2: 'c' };
    const result = shouldBeAnArray(input);
    expect(result).to.be.true;
  });

  it('should return false for an object with non-consecutive numeric keys', () => {
    const input = { 0: 'a', 2: 'b' };
    const result = shouldBeAnArray(input);
    expect(result).to.be.false;
  });

  it('should return false for an empty object', () => {
    const input = {};
    const result = shouldBeAnArray(input);
    expect(result).to.be.false;
  });

  it('should return false for an object that does not behave like an array', () => {
    expect(shouldBeAnArray({ 0: undefined, 1: 'value' } as NestedObject<unknown>)).to.be.false;
    expect(shouldBeAnArray({ key: 'value' } as NestedObject<unknown>)).to.be.false;
  });

  it('should return false for an object with non-numeric keys', () => {
    const input = { a: 1, b: 2, c: 3 };
    const result = shouldBeAnArray(input);
    expect(result).to.be.false;
  });


  /*
  * ADD NEW UNIT TEST
  */

  it('should handle all edge cases correctly', () => {
    expect(shouldBeAnArray(null as NestedObject<unknown> | null)).to.be.false;
    expect(shouldBeAnArray(undefined as NestedObject<unknown> | undefined)).to.be.false;
    expect(shouldBeAnArray({})).to.be.false;
  });




  /*
  * MORE UNIT TEST
  */

  it('should clear all entries', () => {
    const m = map<string, number>([['a', 1], ['b', 2]]);
    m.clear();
    expect(m.size).to.equal(0);
  });

  it('should iterate over entries correctly', () => {
    const m = map<string, number>([['a', 1], ['b', 2]]);
    let entries: string[] = [];
    m.forEach((value, key) => {
      entries.push(key + value);
    });
    expect(entries).to.have.members(['a1', 'b2']);
  });

  it('should clear all entries', () => {
    const s = set([1, 2]);
    s.clear();
    expect(s.size).to.equal(0);
  });

  it('should iterate over values correctly', () => {
    const s = set([1, 2]);
    let values: number[] = [];
    s.forEach(value => {
      values.push(value);
    });
    expect(values).to.have.members([1, 2]);
  });

  it('should return correct entries with entries()', () => {
    const m = map<string, number>([['a', 1], ['b', 2]]);
    const entries = Array.from(m.entries());
    expect(entries).to.deep.equal([['a', 1], ['b', 2]]);
  });

  it('should handle an empty map', () => {
    const m = map<string, number>();
    expect(m.size).to.equal(0);
    expect(m('a')).to.be.undefined;
    expect(m.has('a')).to.be.false;
    m.set('a', 1);
    expect(m.size).to.equal(1);
    expect(m('a')).to.equal(1);
  });

  it('should return correct values with `values()`', () => {
    const s = set([1, 2, 3]);
    const values = Array.from(s.values());
    expect(values).to.deep.equal([1, 2, 3]);
  });

  it('should return undefined for index out of range', () => {
    const s = set([1, 2, 3]);
    expect(s.index(3)).to.be.undefined;
  });
}); 