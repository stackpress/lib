import { describe, it } from 'mocha';
import { expect } from 'chai';
import EventEmitter from '../src/event/EventEmitter';

describe('Event Emitter Tests', () => {
  it('Should listen', async () => {
    const emitter = new EventEmitter<{
      'on something': [number],
    }>;
    expect(emitter).to.be.instanceOf(EventEmitter);
    const actual = emitter.on('on something', x => {});
    expect(actual).to.be.instanceOf(EventEmitter);
  })

  it('Should hook', async () => {
    const emitter = new EventEmitter<{
      'on something': [number],
      '/on/': [number],
    }>;
    let triggered = 0;
    emitter.after = event => {triggered++};
    emitter.before = event => {triggered++};
    emitter.on('on something', x => {});
    emitter.on(/on/, y => {});
    await emitter.emit('on something', 1);
    expect(triggered).to.equal(4);
  })

  it('Should catch error from await', async () => {
    let errored = false;
    const waitForError = async () => {
      throw new Error('Test Error');
    };
    const waitForThis = async () => {
      await waitForError();
    };
    const waitForIt = async () => {
      await waitForThis();
    };
    try {
      await waitForIt();
    } catch (e) {
      errored = true;
      expect(e.message).to.equal('Test Error');
    }

    expect(errored).to.be.true;
  });

  it('Should catch error from sub (await) events', async () => {
    const emitter = new EventEmitter<Record<string, []>>;

    let errored = false;
    emitter.on('event1', async () => {
      await emitter.emit('event2');
    });
    emitter.on('event2', async () => {
      await emitter.emit('event3');
    });
    emitter.on('event3', async () => {
      throw new Error('Test Error');
    });
    try { 
      await emitter.emit('event1');
    } catch (e) {
      errored = true;
      expect(e.message).to.equal('Test Error');
    }

    expect(errored).to.be.true;
  });
});