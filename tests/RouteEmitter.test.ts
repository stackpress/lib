import { describe, it } from 'mocha';
import { expect } from 'chai';

import Router from '../src/emitter/RouteEmitter.js';

type R = { path: string };
type S = { body?: string };

type method = 'all' 
  | 'connect' | 'delete'  | 'get' 
  | 'head'    | 'options' | 'patch' 
  | 'post'    | 'put'     | 'trace';

const methods: method[] = [
  'connect', 'delete',  'get', 
  'head',    'options', 'patch',  
  'post',    'put',     'trace'
];

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
  })
})