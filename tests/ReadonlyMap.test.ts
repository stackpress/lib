import { describe, it } from 'mocha';
import { expect } from 'chai';
//NOTE: no extensions in tests because it's excluded in tsconfig.json and
//we are testing in a typescript environment via `ts-mocha -r tsx` (esm)
import ReadonlyMap from '../src/data/ReadonlyMap.js';

describe('ReadonlyMap Tests', () => {
  it('should expose readonly map helpers', () => {
    const store = new ReadonlyMap<string, number>([
      [ 'one', 1 ],
      [ 'two', 2 ],
      [ 'three', 3 ]
    ]);

    expect(store.size).to.equal(3);
    expect(store.get('one')).to.equal(1);
    expect(store.has('four')).to.equal(false);
    expect(Array.from(store.keys())).to.deep.equal([
      'one',
      'two',
      'three'
    ]);
    expect(Array.from(store.values())).to.deep.equal([ 1, 2, 3 ]);
    expect(Array.from(store.entries())).to.deep.equal([
      [ 'one', 1 ],
      [ 'two', 2 ],
      [ 'three', 3 ]
    ]);
  });

  it('should support filter, find, map and toObject helpers', () => {
    const store = new ReadonlyMap<string, number>([
      [ 'one', 1 ],
      [ 'two', 2 ],
      [ 'three', 3 ]
    ]);

    const filtered = store.filter(value => value >= 2);
    const mapped = store.map(value => value * 10);
    const iterated: string[] = [];

    store.forEach((value, key) => {
      iterated.push(`${key}:${value}`);
    });

    expect(filtered.toObject()).to.deep.equal({ two: 2, three: 3 });
    expect(store.find(value => value === 2)).to.deep.equal([ 'two', 2 ]);
    expect(store.findKey(value => value === 3)).to.equal('three');
    expect(store.findValue(value => value === 1)).to.equal(1);
    expect(mapped.toObject()).to.deep.equal({
      one: 10,
      two: 20,
      three: 30
    });
    expect(store.toObject()).to.deep.equal({ one: 1, two: 2, three: 3 });
    expect(store.toString()).to.equal('{"one":1,"two":2,"three":3}');
    expect(iterated).to.deep.equal([
      'one:1',
      'two:2',
      'three:3'
    ]);
  });
});
