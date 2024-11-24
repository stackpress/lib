import { describe, it } from 'mocha';
import { expect } from 'chai';
import { makeArray, makeObject, shouldBeAnArray } from '../src/helpers';
import { NestedObject } from '../src/types';


describe('helpers.ts', () => {
  describe('makeArray', () => {
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
  });

  describe('makeObject', () => {
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
  });

  describe('shouldBeAnArray', () => {
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
  });
});
