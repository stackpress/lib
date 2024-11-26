import { describe, it } from 'mocha';
import { expect } from 'chai';

import type { CallableMap } from '../src/types';
import { map } from '../src/helpers';

describe('map() Tests', () => {
  it('Should be callable', async () => {
    let store: CallableMap<string, string> = map<string, string>();
    store.set('foo', 'bar');
    store.set('bar', 'zoo');

    expect(store.has('foo')).to.equal(true);
    expect(store.has('bar')).to.equal(true);
    expect(store('foo')).to.equal('bar');
    expect(store('bar')).to.equal('zoo');

    store.delete('foo');
    expect(store.has('foo')).to.equal(false);
    expect(store.has('bar')).to.equal(true);
  });
});