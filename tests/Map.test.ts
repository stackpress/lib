import { describe, it } from 'mocha';
import { expect } from 'chai';

import type { CallableMap, CallableSet } from '../src/types.js';
import map from '../src/data/map.js';
import set from '../src/data/set.js';

describe('map() Tests', () => {
  it('Should be callable', async () => {
    let store: CallableMap<string, string> = map<string, string>();
    store.set('foo', 'bar');
    store.set('bar', 'zoo');

    expect(store.size).to.equal(2);
    expect(store.has('foo')).to.equal(true);
    expect(store.has('bar')).to.equal(true);
    expect(store('foo')).to.equal('bar');
    expect(store('bar')).to.equal('zoo');

    store.delete('foo');
    expect(store.has('foo')).to.equal(false);
    expect(store.has('bar')).to.equal(true);
    expect(store.size).to.equal(1);
  });
});

describe('set() Tests', () => {
  it('Should be callable', async () => {
    let store: CallableSet<string> = set<string>();
    store.add('foo');
    store.add('bar');

    expect(store.size).to.equal(2);
    expect(store.has('foo')).to.equal(true);
    expect(store.has('bar')).to.equal(true);
    expect(store(0)).to.equal('foo');
    expect(store(1)).to.equal('bar');

    store.delete('foo');
    expect(store.has('foo')).to.equal(false);
    expect(store.has('bar')).to.equal(true);
    expect(store.size).to.equal(1);
  });
});