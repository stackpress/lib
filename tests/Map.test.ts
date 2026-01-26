import { describe, it } from 'mocha';
import { expect } from 'chai';
//NOTE: no extensions in tests because it's excluded in tsconfig.json and
//we are testing in a typescript environment via `ts-mocha -r tsx` (esm)
import type { CallableMap, CallableSet } from '../src/types';
import { map } from '../src/data/Map';
import { set } from '../src/data/Set';

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