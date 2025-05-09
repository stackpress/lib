import { describe, it } from 'mocha';
import { expect } from 'chai';
//NOTE: no extensions in tests because it's excluded in tsconfig.json and
//we are testing in a typescript environment via `ts-mocha -r tsx` (esm)
import Nest from '../src/data/Nest'

describe('ArgString argv Tests', () => {
  it('should parse "--key value"', () => {
    const nest = new Nest();
    nest.withArgs.set([
      '--key', 'value', 
      '--key2', '1534', 
      '--key3', '15.34', 
      '--key4', 'true',  
      '--key5', 'false', 
      '--key6', 'null'
    ]);
    expect(nest.withPath.get('key')).to.equal('value');
    expect(nest.withPath.get('key2')).to.equal(1534);
    expect(nest.withPath.get('key3')).to.equal(15.34);
    expect(nest.withPath.get('key4')).to.equal(true);
    expect(nest.withPath.get('key5')).to.equal(false);
    expect(nest.withPath.get('key6')).to.equal(null);
  });

  it('should parse "-xyz" (all true)', () => {
    const nest = new Nest();
    nest.withArgs.set(['-xyz']);
    expect(nest.withPath.get('x')).to.equal(true);
    expect(nest.withPath.get('y')).to.equal(true);
    expect(nest.withPath.get('z')).to.equal(true);
  });

  it('should parse to args "value"', () => {
    const nest = new Nest();
    nest.withArgs.set([
      'value',
      '1534',
      '15.34',
      'true',
      'false',
      'null'
    ]);
    expect(nest.get(0)).to.equal('value');
    expect(nest.get(1)).to.equal(1534);
    expect(nest.get(2)).to.equal(15.34);
    expect(nest.get(3)).to.equal(true);
    expect(nest.get(4)).to.equal(false);
    expect(nest.get(5)).to.equal(null);
  });

  it('should parse "--key[] value"', () => {
    const nest = new Nest();
    nest.withArgs.set([
      '--key[]', 'value',
      '--key[]', '1534',
      '--key[]', '15.34',
      '--key[]', 'true',
      '--key[]', 'false',
      '--key[]', 'null'
    ]);
    const actual = nest.get<Array<any>>('key');
    expect(actual[0]).to.equal('value');
    expect(actual[1]).to.equal(1534);
    expect(actual[2]).to.equal(15.34);
    expect(actual[3]).to.equal(true);
    expect(actual[4]).to.equal(false);
    expect(actual[5]).to.equal(null);
  });

  it('should parse "--key[foo] value"', () => {
    const nest = new Nest();
    nest.withArgs.set([
      '--key[foo]', 'value',
      '--key[foo2]', '1534',
      '--key[foo3]', '15.34',
      '--key[foo4]', 'true',
      '--key[foo5]', 'false',
      '--key[foo6]', 'null'
    ]);
    expect(nest.withPath.get('key.foo')).to.equal('value');
    expect(nest.withPath.get('key.foo2')).to.equal(1534);
    expect(nest.withPath.get('key.foo3')).to.equal(15.34);
    expect(nest.withPath.get('key.foo4')).to.equal(true);
    expect(nest.withPath.get('key.foo5')).to.equal(false);
    expect(nest.withPath.get('key.foo6')).to.equal(null);
  });

  it('should parse "--key[foo][] value"', () => {
    const nest = new Nest();
    nest.withArgs.set([
      '--key[foo][]', 'value',
      '--key[foo][]', '1534',
      '--key[foo][]', '15.34',
      '--key[foo][]', 'true',
      '--key[foo][]', 'false',
      '--key[foo][]', 'null'
    ]);
    const actual = nest.get<Array<any>>('key', 'foo');
    expect(actual[0]).to.equal('value');
    expect(actual[1]).to.equal(1534);
    expect(actual[2]).to.equal(15.34);
    expect(actual[3]).to.equal(true);
    expect(actual[4]).to.equal(false);
    expect(actual[5]).to.equal(null);
  });

  it('should parse "--key[][bar] value"', () => {
    const nest = new Nest();
    nest.withArgs.set([
      '--key[][foo]', 'value',
      '--key[][foo]', '1534',
      '--key[][foo]', '15.34',
      '--key[][foo]', 'true',
      '--key[][foo]', 'false',
      '--key[][foo]', 'null'
    ]);
    const actual = nest.get<Array<any>>('key');
    expect(actual[0].foo).to.equal('value');
    expect(actual[1].foo).to.equal(1534);
    expect(actual[2].foo).to.equal(15.34);
    expect(actual[3].foo).to.equal(true);
    expect(actual[4].foo).to.equal(false);
    expect(actual[5].foo).to.equal(null);
  });

  it('should not parse odd things like "- --"', () => {
    const nest = new Nest();
    nest.withArgs.set([ '-', '--' ]);
    expect(nest.size).to.equal(0);
  });

  it('should parse special use cases', () => {
    const case1 = new Nest();
    case1.withArgs.set([
      'yarn',
      'mtp:dev:emit',
      'account-update',
      '--b',
      'config/develop',
      '-v',
      '--id',
      'etrim4qzzb9elp9myivlyoxy',
      '--secret',
      'alpha omega'
    ], 3);
    expect(case1.get('b')).to.equal('config/develop');
    expect(case1.get('v')).to.be.true;
    expect(case1.get('id')).to.equal('etrim4qzzb9elp9myivlyoxy');
    expect(case1.get('secret')).to.equal('alpha omega');

    const case2 = new Nest();
    case2.withArgs.set([
      'yarn',
      'mtp:dev:query',
      "update account set secret = 'alpha omega' WHERE id = 'etrim4qzzb9elp9myivlyoxy'"
    ], 2);
    expect(case2.get(0)).to.equal(
      "update account set secret = 'alpha omega' WHERE id = 'etrim4qzzb9elp9myivlyoxy'"
    );

    const case3 = new Nest();
    case3.withArgs.set([
      'yarn',
      'mtp:dev:emit',
      'outbox-search',
      '--b',
      'config/develop',
      '-v',
      '--filter[active]',
      'true',
      '--span[created][0]',
      '2025-01-01T00:00:00Z',
      '--sort[created]',
      'desc'
    ], 3);
    expect(case3.get('b')).to.equal('config/develop');
    expect(case3.get('v')).to.be.true;
    expect(case3.get('filter', 'active')).to.be.true;
    expect(Array.isArray(case3.get('span', 'created'))).to.be.true;
    expect(case3.get('span', 'created', 0)).to.equal('2025-01-01T00:00:00Z');
    expect(case3.get('sort', 'created')).to.equal('desc');

    const case4 = new Nest();
    case4.withArgs.set([
      'yarn',
      'mtp:dev:emit',
      'profile-create',
      '--b',
      'config/develop',
      '-v',
      '--name',
      'John Doe',
      '--roles[]',
      'ADMIN',
      '--roles[]',
      'USER',
      '--references[facebook]',
      'abc123'
    ], 3);
    expect(case4.get('b')).to.equal('config/develop');
    expect(case4.get('v')).to.be.true;
    expect(Array.isArray(case4.get('roles'))).to.be.true;
    expect(case4.get('name')).to.equal('John Doe');
    expect(case4.get('roles', 0)).to.equal('ADMIN');
    expect(case4.get('roles', 1)).to.equal('USER');
    expect(case4.get('references', 'facebook')).to.equal('abc123');
  });
});

describe('ArgString string Tests', () => {
  it('should parse "--key value"', () => {
    const nest = new Nest();
    nest.withArgs.set([
      '--key', '"val ue"', 
      '--key2', '1534', 
      '--key3', '15.34', 
      '--key4', 'true',  
      '--key5', 'false', 
      '--key6', 'null'
    ].join(' '));
    expect(nest.withPath.get('key')).to.equal('val ue');
    expect(nest.withPath.get('key2')).to.equal(1534);
    expect(nest.withPath.get('key3')).to.equal(15.34);
    expect(nest.withPath.get('key4')).to.equal(true);
    expect(nest.withPath.get('key5')).to.equal(false);
    expect(nest.withPath.get('key6')).to.equal(null);
  });

  it('should parse "-xyz" (all true)', () => {
    const nest = new Nest();
    nest.withArgs.set('-xyz');
    expect(nest.withPath.get('x')).to.equal(true);
    expect(nest.withPath.get('y')).to.equal(true);
    expect(nest.withPath.get('z')).to.equal(true);
  });

  it('should parse to args "value"', () => {
    const nest = new Nest();
    nest.withArgs.set([
      'value',
      '1534',
      '15.34',
      'true',
      'false',
      'null'
    ].join(' '));
    expect(nest.get(0)).to.equal('value');
    expect(nest.get(1)).to.equal(1534);
    expect(nest.get(2)).to.equal(15.34);
    expect(nest.get(3)).to.equal(true);
    expect(nest.get(4)).to.equal(false);
    expect(nest.get(5)).to.equal(null);
  });

  it('should parse "--key[] value"', () => {
    const nest = new Nest();
    nest.withArgs.set([
      '--key[]', 'value',
      '--key[]', '1534',
      '--key[]', '15.34',
      '--key[]', 'true',
      '--key[]', 'false',
      '--key[]', 'null'
    ].join(' '));
    const actual = nest.get<Array<any>>('key');
    expect(actual[0]).to.equal('value');
    expect(actual[1]).to.equal(1534);
    expect(actual[2]).to.equal(15.34);
    expect(actual[3]).to.equal(true);
    expect(actual[4]).to.equal(false);
    expect(actual[5]).to.equal(null);
  });

  it('should parse "--key[foo] value"', () => {
    const nest = new Nest();
    nest.withArgs.set([
      '--key[foo]', 'value',
      '--key[foo2]', '1534',
      '--key[foo3]', '15.34',
      '--key[foo4]', 'true',
      '--key[foo5]', 'false',
      '--key[foo6]', 'null'
    ].join(' '));
    expect(nest.withPath.get('key.foo')).to.equal('value');
    expect(nest.withPath.get('key.foo2')).to.equal(1534);
    expect(nest.withPath.get('key.foo3')).to.equal(15.34);
    expect(nest.withPath.get('key.foo4')).to.equal(true);
    expect(nest.withPath.get('key.foo5')).to.equal(false);
    expect(nest.withPath.get('key.foo6')).to.equal(null);
  });

  it('should parse "--key[foo][] value"', () => {
    const nest = new Nest();
    nest.withArgs.set([
      '--key[foo][]', 'value',
      '--key[foo][]', '1534',
      '--key[foo][]', '15.34',
      '--key[foo][]', 'true',
      '--key[foo][]', 'false',
      '--key[foo][]', 'null'
    ].join(' '));
    const actual = nest.get<Array<any>>('key', 'foo');
    expect(actual[0]).to.equal('value');
    expect(actual[1]).to.equal(1534);
    expect(actual[2]).to.equal(15.34);
    expect(actual[3]).to.equal(true);
    expect(actual[4]).to.equal(false);
    expect(actual[5]).to.equal(null);
  });

  it('should parse "--key[][bar] value"', () => {
    const nest = new Nest();
    nest.withArgs.set([
      '--key[][foo]', 'value',
      '--key[][foo]', '1534',
      '--key[][foo]', '15.34',
      '--key[][foo]', 'true',
      '--key[][foo]', 'false',
      '--key[][foo]', 'null'
    ].join(' '));
    const actual = nest.get<Array<any>>('key');
    expect(actual[0].foo).to.equal('value');
    expect(actual[1].foo).to.equal(1534);
    expect(actual[2].foo).to.equal(15.34);
    expect(actual[3].foo).to.equal(true);
    expect(actual[4].foo).to.equal(false);
    expect(actual[5].foo).to.equal(null);
  });

  it('should not parse odd things like "- --"', () => {
    const nest = new Nest();
    nest.withArgs.set([ '-', '--' ].join(' '));
    expect(nest.size).to.equal(0);
  });
});