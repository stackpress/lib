import { describe, it } from 'mocha';
import { expect } from 'chai';

import Router from '../src/Router';

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

describe('Router Tests', () => {
  it('Should basic route', async () => {
    const router = new Router<R, S>();
    expect(router).to.be.instanceOf(Router);
    router.get('/some/route/path', (req, res) => {
      res.body = req.path;
    });

    const req: R = { path: '/some/route/path' };
    const res: S = {};
    router.emit('GET /some/route/path', req, res);
    expect(res.body).to.equal('/some/route/path');
  })

  it('Should route methods', async () => {
    const router = new Router<R, S>();

    let tests = 0;
    methods.forEach(method => {
      router[method]('/some/route/path', (req, res) => {
        res.body = `${method} ${req.path}`;
      });
      const req: R = { path: '/some/route/path' };
      const res: S = {};
      router.emit(`${method} /some/route/path`, req, res);
      expect(res.body).to.equal(`${method} ${req.path}`);
      tests++;
    });
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
    router.emit('POST /some/route/path', req, res);
    expect(res.body).to.equal('/some/route/path');
  })
})