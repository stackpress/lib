import { describe, it } from 'mocha';
import { expect } from 'chai';

import Router from '../src/Router';
import { RouterMap } from '../src/types';
import EventEmitter from '../src/EventEmitter';

type R = { path: string };
type S = { body?: string };

type method = 'all'
  | 'connect' | 'delete' | 'get'
  | 'head' | 'options' | 'patch'
  | 'post' | 'put' | 'trace';

const methods: method[] = [
  'connect', 'delete', 'get',
  'head', 'options', 'patch',
  'post', 'put', 'trace'
];

describe('Router Tests', () => {
  it('Should basic route', async () => {
    const router = new Router<R, S>();
    expect(router).to.be.instanceOf(Router);
    router.get('/some/route/path', (req, res) => {
      res.body = req.path;
    });

    const req: R = { path: '/some/route/path' };
    const res: S = {};
    await router.emit('GET /some/route/path', req, res);
    expect(res.body).to.equal('/some/route/path');
  })

  it('Should route methods', async () => {
    const router = new Router<R, S>();

    let tests = 0;
    for (const method of methods) {
      router[method]('/some/route/path', (req, res) => {
        res.body = `${method} ${req.path}`;
      });
      const req: R = { path: '/some/route/path' };
      const res: S = {};
      await router.emit(`${method} /some/route/path`, req, res);
      expect(res.body).to.equal(`${method} ${req.path}`);
      tests++;
    }
    expect(tests).to.equal(methods.length);
  })

  it('Should route ALL', async () => {
    const router = new Router<R, S>();
    expect(router).to.be.instanceOf(Router);
    router.all('/some/route/path', (req, res) => {
      res.body = req.path;
    });

    const req: R = { path: '/some/route/path' };
    const res: S = {};
    await router.emit('POST /some/route/path', req, res);
    expect(res.body).to.equal('/some/route/path');
  })

  it('Should use routes', async () => {
    const triggered: string[] = [];
    const router1 = new Router<R, S>();
    router1.on('zero', (req, res) => {
      triggered.push('0');
    })
    router1.get('/step/1', (req, res) => {
      triggered.push('a');
    });
    const router2 = new Router<R, S>();
    router2.on('zero', (req, res) => {
      triggered.push('1');
    })
    router2.on('one', (req, res) => {
      triggered.push('2');
    })
    router2.get('/step/1', async (req, res) => {
      triggered.push('b');
      await router2.emit('zero', req, res);
      await router2.emit('one', req, res);
    });
    router2.get('/step/2', (req, res) => {
      triggered.push('c');
    });
    router1.use(router2);
    await router1.emit('GET /step/1', { path: '/step/1' }, { body: '' });
    await router1.emit('GET /step/2', { path: '/step/1' }, { body: '' });
    //[ 'a', 'b', '1', '2', 'c' ]
    //NOTE: '0' doesn't trigger because 'zero' was called from router2
    expect(triggered).to.deep.equal(['a', 'b', '1', '2', 'c']);
    expect(
      router1.routes.get('/^GET\\s\\/step\\/2\\/*$/gi')
    ).to.deep.equal(
      { method: 'GET', path: '/step/2' }
    );
  })


  /*
  * Add unit test
  */

  it('Should test that continue statements do not impact nested loops or their iterations', () => {
    const router = new Router<R, S>();
    const emitter = new EventEmitter<RouterMap<R, S>>();

    // Add a listener to the emitter
    emitter.on('test', (req, res) => {
      res.body = 'test';
    });

    // Use the emitter in the router
    router.use(emitter);

    // Verify that the listener from the emitter is now in the router
    const req: R = { path: '/test' };
    const res: S = {};
    router.emit('test', req, res);

    // Check that the listener was executed
    expect(res.body).to.equal('test');
  });


})