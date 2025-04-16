import { describe, it } from 'mocha';
import { expect } from 'chai';
//NOTE: no extensions in tests because it's excluded in tsconfig.json and
//we are testing in a typescript environment via `ts-mocha -r tsx` (esm)
import EventEmitter from '../src/emitter/EventEmitter';

describe('Event Emitter Tests', () => {
  it('Should listen', async () => {
    const emitter = new EventEmitter<{
      'on something': [number],
    }>;
    expect(emitter).to.be.instanceOf(EventEmitter);
    const actual = emitter.on('on something', x => {});
    expect(actual).to.be.instanceOf(EventEmitter);
  })

  it('Should match', async () => {
    const emitter = new EventEmitter()
  
    emitter.on('match something', x => {})
    emitter.on('no mas', x => {})
    
    const matches = emitter.match('match something')
  
    expect(matches.get('match something')?.pattern).to.equal('match something')
  })

  it('Should emit', async () => {
    const emitter = new EventEmitter<{
      'trigger basic something': [number],
      '/trigger basic something/': [number],
      'trigger advance something': [number],
      'trigger incomplete something': [number]
    }>
  
    const triggered: number[] = []
    emitter.on('trigger basic something', async (x) => {
      expect(x).to.equal(1)
      triggered.push(1)
    }, 1)
  
    emitter.on('trigger basic something', async x => {
      expect(x).to.equal(1)
      triggered.push(3)
    }, 3)
  
    await emitter.emit('trigger basic something', 1)
  
    expect(triggered.length).to.equal(2)
    expect(triggered[0]).to.equal(3)
    expect(triggered[1]).to.equal(1)
  })

  it('Should call all listeners', async () => {
    const emitter = new EventEmitter
  
    const triggered: number[] = []
    emitter.on('trigger basic something', async x => {
      expect(x).to.equal(1)
      triggered.push(1)
    })
  
    emitter.on('trigger basic something', async x => {
      expect(x).to.equal(1)
      triggered.push(2)
    })
  
    emitter.on('trigger basic something', async x => {
      expect(x).to.equal(1)
      triggered.push(3)
    })
  
    await emitter.emit('trigger basic something', 1)
  
    expect(triggered.length).to.equal(3)
    expect(triggered[0]).to.equal(1)
    expect(triggered[1]).to.equal(2)
    expect(triggered[2]).to.equal(3)
  })

  it('Should emit advanced event', async () => {
    const emitter = new EventEmitter
  
    const triggered: number[] = []
    emitter.on('trigger advance something', async x => {
      expect(x).to.equal(1)
      triggered.push(1)
    })
  
    emitter.on('trigger advance something', async x => {
      expect(x).to.equal(1)
      triggered.push(2)
    }, 2)
  
    const actual = await emitter.emit('trigger advance something', 1)
  
    expect(triggered.length).to.equal(2)
    expect(triggered[0]).to.equal(2)
    expect(triggered[1]).to.equal(1)
    expect(actual.code).to.equal(200)
  })

  it('Should emit incomplete event', async () => {
    const emitter = new EventEmitter
  
    const triggered: number[] = []
    emitter.on('trigger incomplete something', async x => {
      triggered.push(1)
    })
  
    emitter.on('trigger incomplete something', async x => {
      expect(x).to.equal(1)
      triggered.push(2)
      return false
    }, 2)
  
    const actual = await emitter.emit('trigger incomplete something', 1)
  
    expect(triggered.length).to.equal(1)
    expect(triggered[0]).to.equal(2)
    expect(actual.code).to.equal(309)
  })

  it('Should unbind', async () => {
    const emitter = new EventEmitter
    let listener = async x => {
      triggered.push(1)
    }
  
    const triggered: number[] = []
    emitter.on('trigger unbind something', listener)
  
    emitter.clear('trigger unbind something')
    const actual = await emitter.emit('trigger unbind something')
  
    expect(triggered.length).to.equal(0)
    expect(actual.code).to.equal(404)
  
    let listener2 = async x => {
      triggered.push(2)
    }
  
    emitter.on('trigger unbind something', listener)
    emitter.on('trigger unbind something', listener2)
    emitter.unbind('trigger unbind something', listener)
  
    const actual2 = await emitter.emit('trigger unbind something')
  
    expect(triggered.length).to.equal(1)
    expect(triggered[0]).to.equal(2)
    expect(actual2.code).to.equal(200)
  })

  it('Should nest', async () => {
    const emitter = new EventEmitter<{
      'on something': [number],
      'on something else': [number]
    }>();
  
    emitter.on('on something', async x => {
      expect(emitter.event?.event).to.equal('on something')
      const actual = await emitter.emit('on something else', x + 1)
      expect(actual.code).to.equal(200)
    })
  
    emitter.on('on something else', x => {
      expect(emitter.event?.event).to.equal('on something else')
    })
  
    await emitter.emit('on something', 1)
  })

  it('Should asyncronously emit', async() => {
    const emitter = new EventEmitter();
  
    const actual: number[] = []
  
    emitter.on('async test', async() => {
      actual.push(1)
    })
  
    emitter.on('async test', async() => {
      actual.push(2)
    })
  
    emitter.on('async test', async() => {
      actual.push(3)
    })
  
    await emitter.emit('async test', 0)
  
    expect(actual.length).to.equal(3)
  })

  it('Should allow middleware', async() => {
    const emitter1 = new EventEmitter
    const emitter2 = new EventEmitter
  
    const triggered: number[] = []
    emitter1.on('trigger basic something', async x => {
      expect(x).to.equal(1)
      triggered.push(1)
    }, 1)
  
    emitter2.on('trigger basic something', async x => {
      expect(x).to.equal(1)
      triggered.push(2)
    }, 2)
  
    emitter1.use(emitter2)
  
    await emitter1.emit('trigger basic something', 1)
  
    expect(triggered.length).to.equal(2)
    expect(triggered[0]).to.equal(2)
    expect(triggered[1]).to.equal(1)
  })

  it('Should handle clearing a non-existent event gracefully', () => {
    const emitter = new EventEmitter();
    expect(emitter.listeners['non-existent event']).to.be.undefined;
    emitter.clear('non-existent event');
    expect(emitter.listeners['non-existent event']).to.be.undefined;
  })

  it('Should return empty matches when no patterns match', () => {
    const emitter = new EventEmitter();
    emitter.on('exampleEvent', async () => {});
    const matches = emitter.match('nonMatchingEvent');
    expect(matches.size).to.equal(0);
  })

  it('Should hook', async () => {
    const emitter = new EventEmitter<{ 'on something': [number] }>;
    let triggered = 0;
    emitter.after = event => {triggered++};
    emitter.before = event => {triggered++};
    emitter.on('on something', x => {});
    emitter.on('on something', y => {});
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