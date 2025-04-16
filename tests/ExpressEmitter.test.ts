import { describe, it } from 'mocha';
import { expect } from 'chai';
import ExpressEmitter from '../src/emitter/ExpressEmitter.js';

describe('Expression Emitter Tests', () => {
  it('Should listen', async () => {
    const emitter = new ExpressEmitter<{
      'on something': [number],
    }>;
    expect(emitter).to.be.instanceOf(ExpressEmitter);
    const actual = emitter.on('on something', x => {});
    expect(actual).to.be.instanceOf(ExpressEmitter);
  })

  it('Should match', async () => {
    const emitter = new ExpressEmitter(' ')
  
    emitter.on('match something', x => {})
    emitter.on('match *', x => {})
    emitter.on(':verb something', x => {})
    emitter.on(':adverb *', x => {})
    emitter.on(/match (something)/g, x => {})
    emitter.on(/match (some)(thing)/i, x => {})
    emitter.on(/match (some)(thing)/i, x => {})
    emitter.on('no mas', x => {})
    emitter.on(/no mas/g, x => {})
    
    const matches = emitter.match('match something')
  
    expect(matches.get('match something')?.pattern).to.equal('match something')
    expect(matches.get('/match (something)/g')?.pattern).to.equal('/match (something)/g')
    expect(matches.get('/match (some)(thing)/i')?.pattern).to.equal('/match (some)(thing)/i')
  
    expect(matches.get('/match (something)/g')?.data.args.length).to.equal(1)
    expect(matches.get('/match (some)(thing)/i')?.data.args.length).to.equal(2)

    expect(matches.get('/^match ([^ ]+)$/g')?.data.args[0]).to.equal('something')
    expect(matches.get('/^([^ ]+) something$/g')?.data.params.verb).to.equal('match')
    expect(matches.get('/^([^ ]+) ([^ ]+)$/g')?.data.args[0]).to.equal('something')
    expect(matches.get('/^([^ ]+) ([^ ]+)$/g')?.data.params.adverb).to.equal('match')
  })

  it('Should emit', async () => {
    const emitter = new ExpressEmitter<{
      'trigger basic something': [number],
      '/trigger basic something/': [number],
      'trigger advance something': [number],
      'trigger incomplete something': [number],
      'trigger * something': [number],
      ':foo basic something': [number],
      ':foo * something': [number],
    }>(' ')
  
    const triggered: number[] = []
    emitter.on('trigger basic something', async (x) => {
      expect(x).to.equal(1)
      triggered.push(1)
    }, 1)
  
    emitter.on<'/trigger basic something/'>(/trigger basic something/, async x => {
      expect(x).to.equal(1)
      triggered.push(2)
    }, 2)
  
    emitter.on('trigger basic something', async x => {
      expect(x).to.equal(1)
      triggered.push(3)
    }, 3)
  
    emitter.on(/trigger basic something/, async x => {
      expect(x).to.equal(1)
      triggered.push(4)
    }, 4)
  
    emitter.on('trigger basic something', async x => {
      expect(x).to.equal(1)
      triggered.push(5)
    }, 5)

    emitter.on('trigger * something', async x => {
      expect(x).to.equal(1)
      triggered.push(6)
    }, 6)
  
    emitter.on('trigger basic something', async x => {
      expect(x).to.equal(1)
      triggered.push(7)
    }, 7)

    emitter.on(':foo basic something', async x => {
      expect(x).to.equal(1)
      triggered.push(8)
    }, 8)
  
    emitter.on('trigger basic something', async x => {
      expect(x).to.equal(1)
      triggered.push(9)
    }, 9)

    emitter.on(':foo * something', async x => {
      expect(x).to.equal(1)
      triggered.push(10)
    }, 10)
  
    await emitter.emit('trigger basic something', 1)
  
    expect(triggered.length).to.equal(10)
    expect(triggered[0]).to.equal(10)
    expect(triggered[1]).to.equal(9)
    expect(triggered[2]).to.equal(8)
    expect(triggered[3]).to.equal(7)
    expect(triggered[4]).to.equal(6)
    expect(triggered[5]).to.equal(5)
    expect(triggered[6]).to.equal(4)
    expect(triggered[7]).to.equal(3)
    expect(triggered[8]).to.equal(2)
    expect(triggered[9]).to.equal(1)
  })

  it('Should call all listeners', async () => {
    const emitter = new ExpressEmitter
  
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

  it('Should have meta', async () => {
    const emitter = new ExpressEmitter
  
    const triggered: number[] = []
    emitter.on(/^trigger basic (.+)$/, async function something1() {
      expect(emitter.event?.event).to.equal('trigger basic something')
      expect(emitter.event?.pattern).to.equal('/^trigger basic (.+)$/')
      expect(emitter.event?.data.args[0]).to.equal('something')
      triggered.push(1)
    }, 2)
  
    emitter.on(/trigger (.+) something$/, async function something2() {
      expect(emitter.event?.event).to.equal('trigger basic something')
      expect(emitter.event?.pattern).to.equal('/trigger (.+) something$/')
      expect(emitter.event?.data.args[0]).to.equal('basic')
      triggered.push(2)
    }, 1)
  
    const actual = await emitter.emit('trigger basic something', 1)
  
    expect(triggered.length).to.equal(2)
    expect(triggered[0]).to.equal(1)
    expect(triggered[1]).to.equal(2)
    expect(actual.code).to.equal(200)
  })

  it('Should emit advanced event', async () => {
    const emitter = new ExpressEmitter
  
    const triggered: number[] = []
    emitter.on('trigger advance something', async x => {
      expect(x).to.equal(1)
      triggered.push(1)
    })
  
    emitter.on(/trigger (advance) something/, async x => {
      expect(x).to.equal(1)
      triggered.push(2)
      expect(emitter.event?.data.args[0]).to.equal('advance')
    }, 2)
  
    const actual = await emitter.emit('trigger advance something', 1)
  
    expect(triggered.length).to.equal(2)
    expect(triggered[0]).to.equal(2)
    expect(triggered[1]).to.equal(1)
    expect(actual.code).to.equal(200)
  })

  it('Should emit incomplete event', async () => {
    const emitter = new ExpressEmitter
  
    const triggered: number[] = []
    emitter.on('trigger incomplete something', async x => {
      triggered.push(1)
    })
  
    emitter.on(/trigger (incomplete) something/, async x => {
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
    const emitter = new ExpressEmitter
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
    const emitter = new ExpressEmitter<{
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

  it('Should listen to regexp', async () => {
    const emitter = new ExpressEmitter()
  
    let triggered = 0
    emitter.on('GET /components/heyo/beans', async x => {
      expect(emitter.event?.event).to.equal('GET /components/heyo/beans')
      triggered ++
    })
  
    emitter.on(/^GET\s\/components\/(.*)\/*$/, async x => {
      expect(emitter.event?.event).to.equal('GET /components/heyo/beans')
      triggered ++
      expect(emitter.event?.data.args[0]).to.equal('heyo/beans')
    })
  
    await emitter.emit('GET /components/heyo/beans', 1)
  
    expect(triggered).to.equal(2)
  })

  it('Should asyncronously emit', async() => {
    const emitter = new ExpressEmitter();
  
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
    const emitter1 = new ExpressEmitter(' ')
    const emitter2 = new ExpressEmitter('-')
  
    const triggered: number[] = []
    emitter1.on('trigger-basic something', async x => {
      expect(x).to.equal(1)
      triggered.push(1)
    }, 1)
    emitter1.on('trigger-:basic something', async x => {
      expect(x).to.equal(1)
      triggered.push(2)
    }, 2)
  
    emitter2.on('trigger-basic something', async x => {
      expect(x).to.equal(1)
      triggered.push(3)
    }, 3)
  
    emitter2.on('*-basic something', async x => {
      expect(x).to.equal(1)
      triggered.push(4)
    }, 4)
  
    emitter1.use(emitter2)
  
    await emitter1.emit('trigger-basic something', 1)
  
    expect(triggered.length).to.equal(4)
    expect(triggered[0]).to.equal(4)
    expect(triggered[1]).to.equal(3)
    expect(triggered[2]).to.equal(2)
    expect(triggered[3]).to.equal(1)
  })

  it('Should handle clearing a non-existent event gracefully', () => {
    const emitter = new ExpressEmitter();
    expect(emitter.listeners['non-existent event']).to.be.undefined;
    emitter.clear('non-existent event');
    expect(emitter.listeners['non-existent event']).to.be.undefined;
  })

  it('Should return empty matches when no patterns match', () => {
    const emitter = new ExpressEmitter();
    emitter.on('exampleEvent', async () => {});
    emitter.on(/regexEvent/, async () => {});
    const matches = emitter.match('nonMatchingEvent');
    expect(matches.size).to.equal(0);
  })

  it('Should hook', async () => {
    const emitter = new ExpressEmitter<{
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
    const emitter = new ExpressEmitter<Record<string, []>>;

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