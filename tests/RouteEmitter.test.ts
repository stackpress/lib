import { describe, it } from 'mocha';
import { expect } from 'chai';
//NOTE: no extensions in tests because it's excluded in tsconfig.json and
//we are testing in a typescript environment via `ts-mocha -r tsx` (esm)
import ExpressEmitter from '../src/emitter/ExpressEmitter.js';
import Router from '../src/emitter/RouteEmitter.js';

type R = { path: string };
type S = { body?: string };

describe('RouteEmitter Tests', () => {
  it('Should basic route', async () => {
    const router = new Router<R, S>();
    expect(router).to.be.instanceOf(Router);
    router.route('GET', '/some/route/path', (req, res) => {
      res.body = req.path;
    });

    const req: R = { path: '/some/route/path' };
    const res: S = {};
    await router.emit('GET /some/route/path', req, res);
    expect(res.body).to.equal('/some/route/path');
  })

  it('Should use routes', async () => {
    const triggered: string[] = [];
    const step1 = 'GET /step/1';
    const step2 = 'GET /step/2';
    const router1 = new Router<R, S>();
    router1.on('zero', (req, res) => {
      triggered.push('0');
    })
    router1.route('GET', '/step/1', (req, res) => {
      triggered.push('a');
    });
    const router2 = new Router<R, S>();
    router2.on('zero', (req, res) => {
      triggered.push('1');
    })
    router2.on('one', (req, res) => {
      triggered.push('2');
    })
    router2.route('GET', '/step/1', async function withName(req, res) {
      triggered.push('b');
      await router2.emit('zero', req, res);
      await router2.emit('one', req, res);
    });
    router2.route('GET', '/step/2', (req, res) => {
      triggered.push('c');
    });
    router1.use(router2);
    await router1.emit('GET /step/1', { path: '/step/1' }, { body: '' });
    await router1.emit('GET /step/2', { path: '/step/1' }, { body: '' });
    //[ 'a', 'b', '1', '2', 'c' ]
    //NOTE: '0' doesn't trigger because 'zero' was called from router2
    expect(triggered).to.deep.equal(['a', 'b', '1', '2', 'c']);
    //this test is to make sure routes can be mapped to listeners
    expect(router1.routes.get(step2)).to.deep.equal(
      { method: 'GET', path: '/step/2' }
    );
    //this test is to make sure we are adding the correct 
    //source function, not a wrapper function...
    const tasks = router1.listeners[step1] as Set<{ 
      item: Function, 
      priority: number 
    }>;
    expect(Array.from(tasks.values())[1].item.name).to.equal('withName');
  });

  it('should match parameterized routes and preserve route metadata', async () => {
    const router = new Router<R, S>();
    const triggered: string[] = [];

    router.route('GET', '/users/:id', (req, res) => {
      triggered.push(req.path);
      res.body = 'matched';
    });

    const req: R = { path: '/users/42' };
    const res: S = {};
    const response = await router.emit('GET /users/42', req, res);
    const [[ event, route ]] = Array.from(router.routes.entries());

    expect(response.code).to.equal(200);
    expect(triggered).to.deep.equal(['/users/42']);
    expect(res.body).to.equal('matched');
    expect(event).to.contain('^GET');
    expect(route).to.deep.equal({ method: 'GET', path: '/users/:id' });
  });

  it('should allow any routes to match multiple verbs and trailing slashes', async () => {
    const router = new Router<R, S>();
    const triggered: string[] = [];

    router.route('ANY', '/health/:scope', (req, res) => {
      triggered.push(req.path);
      res.body = req.path;
    });

    await router.emit('GET /health/live/', { path: '/health/live/' }, {});
    const response = await router.emit(
      'POST /health/ready',
      { path: '/health/ready' },
      {}
    );

    expect(response.code).to.equal(200);
    expect(triggered).to.deep.equal([
      '/health/live/',
      '/health/ready'
    ]);
    expect(Array.from(router.routes.values())).to.deep.equal([
      { method: 'ANY', path: '/health/:scope' }
    ]);
  });

  it('should merge listeners from plain emitters without copying routes', async () => {
    const router = new Router<R, S>();
    const emitter = new ExpressEmitter<Record<string, [R, S]>>('/');
    const triggered: string[] = [];

    emitter.on('GET /shared/test', (req, res) => {
      triggered.push(req.path);
      res.body = 'shared';
    });

    router.use(emitter);
    const response = await router.emit(
      'GET /shared/test',
      { path: '/shared/test' },
      {}
    );

    expect(response.code).to.equal(200);
    expect(triggered).to.deep.equal(['/shared/test']);
    expect(router.routes.size).to.equal(0);
  });

  it('should preserve canonical regex listener keys when merging parameterized routes', async () => {
    const child = new Router<R, S>();
    const parent = new Router<R, S>();
    const event = '/^GET \\/users\\/([^/]+)\\/*$/g';
    const malformed = '/^\\/^GET \\/users\\/([^/]+)\\/([^/]+)$\\/g$/g';
    const triggered: string[] = [];

    child.route('GET', '/users/:id', (req, res) => {
      triggered.push(req.path);
      res.body = 'matched';
    });

    parent.use(child);
    const response = await parent.emit(
      'GET /users/42',
      { path: '/users/42' },
      {}
    );

    expect(response.code).to.equal(200);
    expect(triggered).to.deep.equal(['/users/42']);
    expect(parent.listeners[event]).to.be.instanceOf(Set);
    expect(parent.listeners[malformed]).to.be.undefined;
    expect(Array.from(parent.expressions.keys())).to.deep.equal([event]);
  });
});
