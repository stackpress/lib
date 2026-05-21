import { expect } from 'chai';
//NOTE: no extensions in tests because it's excluded in tsconfig.json and
//we are testing in a typescript environment via `ts-mocha -r tsx` (esm)
import { 
  ReadSession, 
  WriteSession, 
  session 
} from '../src/router/Session.js';

describe('ReadSession', () => {
  let readSession: ReadSession;

  beforeEach(() => {
    readSession = new ReadSession([
      ['name', 'test'],
      ['array', ['item1', 'item2']]
    ]);
  });

  it('should get data as object', () => {
    expect(readSession.data).to.deep.equal({
      name: 'test',
      array: ['item1', 'item2']
    });
  });

  it('should get values correctly', () => {
    expect(readSession.get('name')).to.equal('test');
    expect(readSession.get('array')).to.deep.equal(['item1', 'item2']);
    expect(readSession.get('nonexistent')).to.be.undefined;
  });
});

describe('WriteSession', () => {
  let writeSession: WriteSession;

  beforeEach(() => {
    writeSession = new WriteSession([
      ['name', 'test'],
      ['array', ['item1', 'item2']]
    ]);
  });

  it('should clear all entries', () => {
    writeSession.clear();
    expect(writeSession.size).to.equal(0);
    expect(Array.from(writeSession.revisions.entries())).to.deep.equal([
      ['name', { action: 'remove' }],
      ['array', { action: 'remove' }]
    ]);
  });

  it('should delete specific entry', () => {
    writeSession.delete('name');
    expect(writeSession.has('name')).to.be.false;
    expect(writeSession.revisions.get('name')).to.deep.equal({ action: 'remove' });
  });

  it('should set new values', () => {
    writeSession.set('newKey', 'newValue');
    writeSession.set('newArray', ['item3', 'item4']);

    expect(writeSession.get('newKey')).to.equal('newValue');
    expect(writeSession.get('newArray')).to.deep.equal(['item3', 'item4']);
    expect(writeSession.revisions.get('newKey')).to.deep.equal({ 
      action: 'set', 
      value: 'newValue' 
    });
    expect(writeSession.revisions.get('newArray')).to.deep.equal({ 
      action: 'set', 
      value: ['item3', 'item4'] 
    });
  });

  it('should store cookie settings per key', () => {
    writeSession.set('sessionId', 'abc123', {
      httpOnly: true,
      path: '/',
      sameSite: 'lax'
    });
    writeSession.set('theme', 'dark', {
      maxAge: 31536000,
      path: '/preferences'
    });

    expect(writeSession.getOptions('sessionId')).to.deep.equal({
      httpOnly: true,
      path: '/',
      sameSite: 'lax'
    });
    expect(writeSession.getOptions('theme')).to.deep.equal({
      maxAge: 31536000,
      path: '/preferences'
    });
    expect(writeSession.revisions.get('sessionId')).to.deep.equal({
      action: 'set',
      options: {
        httpOnly: true,
        path: '/',
        sameSite: 'lax'
      },
      value: 'abc123'
    });
    expect(writeSession.revisions.get('theme')).to.deep.equal({
      action: 'set',
      options: {
        maxAge: 31536000,
        path: '/preferences'
      },
      value: 'dark'
    });
  });

  it('should clear cookie settings when an entry is removed', () => {
    writeSession.set('sessionId', 'abc123', {
      httpOnly: true,
      path: '/'
    });

    writeSession.delete('sessionId');

    expect(writeSession.getOptions('sessionId')).to.be.undefined;
    expect(writeSession.revisions.get('sessionId')).to.deep.equal({
      action: 'remove'
    });
  });

  it('should preserve existing cookie settings when only the value changes', () => {
    writeSession.set('sessionId', 'abc123', {
      httpOnly: true,
      path: '/',
      sameSite: 'strict'
    });

    writeSession.set('sessionId', 'def456');

    expect(writeSession.getOptions('sessionId')).to.deep.equal({
      httpOnly: true,
      path: '/',
      sameSite: 'strict'
    });
    expect(writeSession.revisions.get('sessionId')).to.deep.equal({
      action: 'set',
      options: {
        httpOnly: true,
        path: '/',
        sameSite: 'strict'
      },
      value: 'def456'
    });
  });
});

describe('session function', () => {
  let sessionInstance: ReturnType<typeof session>;

  beforeEach(() => {
    sessionInstance = session([
      ['name', 'test'],
      ['array', ['item1', 'item2']]
    ]);
  });

  it('should work as a callable function', () => {
    expect(sessionInstance('name')).to.equal('test');
    expect(sessionInstance('array')).to.deep.equal(['item1', 'item2']);
    expect(sessionInstance('nonexistent')).to.be.undefined;
  });

  it('should expose session methods', () => {
    sessionInstance.set('newKey', 'newValue');
    expect(sessionInstance.get('newKey')).to.equal('newValue');

    sessionInstance.delete('newKey');
    expect(sessionInstance.has('newKey')).to.be.false;

    expect(sessionInstance.size).to.equal(2);
    expect(sessionInstance.data).to.deep.equal({
      name: 'test',
      array: ['item1', 'item2']
    });
  });

  it('should track revisions', () => {
    sessionInstance.set('key1', 'value1');
    sessionInstance.delete('name');
    
    expect(Array.from(sessionInstance.revisions.entries())).to.deep.equal([
      ['key1', { action: 'set', value: 'value1' }],
      ['name', { action: 'remove' }]
    ]);
  });

  it('should expose cookie settings through the callable wrapper', () => {
    sessionInstance.set('token', 'shield', {
      httpOnly: true,
      path: '/',
      secure: true
    });

    expect(sessionInstance.getOptions('token')).to.deep.equal({
      httpOnly: true,
      path: '/',
      secure: true
    });
    expect(Object.entries(sessionInstance.options)).to.deep.equal([
      ['token', {
        httpOnly: true,
        path: '/',
        secure: true
      }]
    ]);
  });

  it('should support iteration methods', () => {
    const entries = Array.from(sessionInstance.entries());
    expect(entries).to.deep.equal([
      ['name', 'test'],
      ['array', ['item1', 'item2']]
    ]);

    const keys = Array.from(sessionInstance.keys());
    expect(keys).to.deep.equal(['name', 'array']);

    const values = Array.from(sessionInstance.values());
    expect(values).to.deep.equal(['test', ['item1', 'item2']]);

    const forEachResult: Array<[string, string | string[]]> = [];
    sessionInstance.forEach((value, key) => {
      forEachResult.push([key, value]);
    });
    expect(forEachResult).to.deep.equal([
      ['name', 'test'],
      ['array', ['item1', 'item2']]
    ]);
  });
});
