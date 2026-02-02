import { describe, it } from 'mocha';
import { expect } from 'chai';
//NOTE: no extensions in tests because it's excluded in tsconfig.json and
//we are testing in a typescript environment via `ts-mocha -r tsx` (esm)
import type { CallableMap, CallableSet } from '../src/types';
import DataMap, { map } from '../src/data/Map';
import DataSet, { set } from '../src/data/Set';

describe('DataMap Tests', () => {
  it('Should get by name', async () => {
    const store = new DataMap<string, number>();
    store.set('one', 1);
    store.set('two', 2);
    store.set('three', 3);

    expect(store.has('one')).to.be.true;
    expect(store.has('two')).to.be.true;
    expect(store.has('three')).to.be.true;
    expect(store.has('four')).to.be.false;
    
    expect(store.get('one')).to.equal(1);
    expect(store.get('two')).to.equal(2);
    expect(store.get('three')).to.equal(3);
    expect(store.get('four')).to.be.undefined;
  });

  it('Should convert to plain object', async () => {
    const store = new DataMap<string, number>();
    store.set('one', 1);
    store.set('two', 2);
    store.set('three', 3);

    const object = store.toObject();
    expect(object).to.deep.equal({ one: 1, two: 2, three: 3 });
  });

  it('Should convert to JSON string', async () => {
    const store = new DataMap<string, number>();
    store.set('one', 1);
    store.set('two', 2);
    store.set('three', 3);

    const json = store.toString();
    expect(json).to.equal('{"one":1,"two":2,"three":3}');
  });

  it('Should filter entries', async () => {
    const store = new DataMap<string, number>();
    store.set('one', 1);
    store.set('two', 2);
    store.set('three', 3);

    const filtered = store.filter((value) => value >= 2);
    expect(filtered.toObject()).to.deep.equal({ two: 2, three: 3 });
  });

  it('Should find entries', async () => {
    const store = new DataMap<string, number>();
    store.set('one', 1);
    store.set('two', 2);
    store.set('three', 3);

    const foundEntry = store.find((value) => value === 2);
    expect(foundEntry).to.deep.equal([ 'two', 2 ]);

    const foundKey = store.findKey((value) => value === 3);
    expect(foundKey).to.equal('three');

    const foundValue = store.findValue((value) => value === 1);
    expect(foundValue).to.equal(1);
  });

  it('Should map entries', async () => {
    const store = new DataMap<string, number>();
    store.set('one', 1);
    store.set('two', 2);
    store.set('three', 3);

    const mapped = store.map((value) => value * 10);
    expect(mapped.toObject()).to.deep.equal({
      one: 10,
      two: 20,
      three: 30
    });
  });
});

describe('DataSet Tests', () => {
  it('Should convert to array', async () => {
    const store = new DataSet<string>();
    store.add('foo');
    store.add('bar');
    store.add('baz');

    const arr = store.toArray();
    expect(arr).to.deep.equal([ 'foo', 'bar', 'baz' ]);
  });

  it('Should convert to JSON string', async () => {
    const store = new DataSet<string>();
    store.add('foo');
    store.add('bar');
    store.add('baz');

    const json = store.toString();
    expect(json).to.equal('["foo","bar","baz"]');
  });

  it('Should filter entries', async () => {
    const store = new DataSet<number>();
    store.add(1);
    store.add(2);
    store.add(3);

    const filtered = store.filter((value) => value >= 2);
    expect(filtered.toArray()).to.deep.equal([ 2, 3 ]);
  });

  it('Should find entries', async () => {
    const store = new DataSet<number>();
    store.add(1);
    store.add(2);
    store.add(3);

    const foundIndex = store.findIndex((value) => value === 2);
    expect(foundIndex).to.equal(1);

    const foundValue = store.findValue((value) => value === 3);
    expect(foundValue).to.equal(3);
  });

  it('Should map entries', async () => {
    const store = new DataSet<number>();
    store.add(1);
    store.add(2);
    store.add(3);

    const mapped = store.map((value) => value * 10);
    expect(mapped.toArray()).to.deep.equal([ 10, 20, 30 ]);
  });
});

describe('map() Tests', () => {
  it('Should be callable', async () => {
    const store: CallableMap<string, string> = map<string, string>();
    store.set('foo', 'Bar');
    store.set('bar', 'Zoo');

    expect(store.size).to.equal(2);
    expect(store.has('foo')).to.equal(true);
    expect(store.has('bar')).to.equal(true);
    expect(store('foo')).to.equal('Bar');
    expect(store('bar')).to.equal('Zoo');

    expect(store.findKey(value => value === 'Bar')).to.equal('foo');
    expect(store.findKey(value => value === 'Foo')).to.be.undefined;
    expect(store.findValue(value => value === 'Zoo')).to.equal('Zoo');
    expect(store.findValue(value => value === 'Foo')).to.be.undefined;
    expect(store.filter(value => value === 'Bar').size).to.equal(1);
    expect(store.filter(value => value === 'unknown').size).to.equal(0);
    expect(store.map(value => value.toUpperCase()).get('foo')).to.equal('BAR');

    store.delete('foo');
    expect(store.has('foo')).to.equal(false);
    expect(store.has('bar')).to.equal(true);
    expect(store.size).to.equal(1);
  });
});

describe('set() Tests', () => {
  it('Should be callable', async () => {
    const store: CallableSet<string> = set<string>();
    store.add('foo');
    store.add('bar');

    expect(store.size).to.equal(2);
    expect(store.has('foo')).to.equal(true);
    expect(store.has('bar')).to.equal(true);
    expect(store(0)).to.equal('foo');
    expect(store(1)).to.equal('bar');

    expect(store.findIndex(value => value === 'bar')).to.equal(1);
    expect(store.findIndex(value => value === 'Foo')).to.equal(-1);
    expect(store.findValue(value => value === 'bar')).to.equal('bar');
    expect(store.findValue(value => value === 'Foo')).to.be.undefined;
    expect(store.filter(value => value === 'bar').size).to.equal(1);
    expect(store.filter(value => value === 'unknown').size).to.equal(0);
    expect(store.map(value => value.toUpperCase()).index(1)).to.equal('BAR');

    store.delete('foo');
    expect(store.has('foo')).to.equal(false);
    expect(store.has('bar')).to.equal(true);
    expect(store.size).to.equal(1);
  });
});