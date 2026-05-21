import crypto from 'node:crypto';
import { describe, it } from 'mocha';
import { expect } from 'chai';
//NOTE: no extensions in tests because it's excluded in tsconfig.json and
//we are testing in a typescript environment via `ts-mocha -r tsx` (esm)
import Router from '../src/router/Router.js';

type R = { path: string };
type S = { body?: string };

type method = 'all' 
  | 'connect' | 'delete'  | 'get' 
  | 'head'    | 'options' | 'patch' 
  | 'post'    | 'put'     | 'trace';

describe('Router Tests', () => {
  it('Should basic route', async () => {
    const router = new Router<R, S>();
    expect(router).to.be.instanceOf(Router);
    router.route('GET', '/some/route/path', (req, res) => {
      res.body = req.resource.path;
    });
    const req = router.request({ resource: { path: '/some/route/path' } });
    const res = router.response({ resource: {} });
    await router.emit('GET /some/route/path', req, res);
    expect(res.body).to.equal('/some/route/path');
  })

  it('Should pass mock routing', async () => {
    const router = new Router();
    router.on('auth-*', (req, res) => {
      const password = req.data.path('secret.password');
      const confirm = req.data.path('secret.confirm')
      if (password) {
        const hash = crypto.createHash('md5').update(password).digest('hex');
        req.data.set('secret.password', hash);
      }
      if (confirm) {
        const hash = crypto.createHash('md5').update(confirm).digest('hex');
        req.data.set('secret.confirm', hash);
      }
    });
    router.on('auth-signin', (req, res) => {
      const type = req.data<string>('type');
      const username = req.data('token', type)
      const password = req.data.path('secret.password')
      const confirm = req.data.path('secret.confirm')

      if (password !== confirm) {
        res.setError({ 
          code: 400, 
          status: 'Bad Request', 
          error: 'Passwords do not match' 
        })
        return
      }

      res.results({ username });
    });
    router.route('get', '/auth/:type/signin', async (req, res, router) => {
      const response = await router.resolve(`auth-signin`, req);
      res.fromStatusResponse(response);
    });

    const req = router.request({
      data: { 
        token: { username: 'admin' },
        secret: { password: 'password', confirm: 'password' }
      }
    });
    const res = router.response();
    await router.emit('GET /auth/username/signin', req, res);
    expect(res.code).to.equal(200);
    expect(res.status).to.equal('OK');
    expect(res.body).to.deep.equal({ username: 'admin' });
    const response = await router.resolve('GET /auth/username/signin', { 
      token: { username: 'admin' },
      secret: { password: 'password', confirm: 'passwrd' }
    });
    expect(response.code).to.equal(400);
    expect(response.status).to.equal('Bad Request');
    expect(response.error).to.equal('Passwords do not match');
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
    const req = router1.request({ resource: { path: '/step/1' } });
    const res = router1.response({ resource: { body: '' } });
    await router1.emit('GET /step/1', req, res);
    await router1.emit('GET /step/2', req, res);
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

  it('should preserve exact, parameterized, and fallback routes after use()', async () => {
    const child = new Router<R, S>();
    const parent = new Router<R, S>();
    const triggered: string[] = [];

    child.route('GET', '/', (_req, res) => {
      triggered.push('root');
      res.body = 'root';
    });
    child.route('GET', '/login', (_req, res) => {
      triggered.push('login');
      res.body = 'login';
    });
    child.route('GET', '/user', (_req, res) => {
      triggered.push('user');
      res.body = 'user';
    });
    child.route('GET', '/user/:id', (req, res) => {
      triggered.push(`get:${req.data('id')}`);
      res.body = `get:${req.data('id')}`;
    });
    child.route('PUT', '/user/:id', (req, res) => {
      triggered.push(`put:${req.data('id')}`);
      res.body = `put:${req.data('id')}`;
    });
    child.route('DELETE', '/user/:id', (req, res) => {
      triggered.push(`delete:${req.data('id')}`);
      res.body = `delete:${req.data('id')}`;
    });
    child.route('ANY', '/files/**', (_req, res) => {
      triggered.push('wildcard');
      res.body = 'fallback';
    });

    parent.use(child);

    const rootReq = parent.request({ resource: { path: '/' } });
    const rootRes = parent.response({ resource: {} });
    await parent.emit('GET /', rootReq, rootRes);

    const loginReq = parent.request({ resource: { path: '/login' } });
    const loginRes = parent.response({ resource: {} });
    await parent.emit('GET /login', loginReq, loginRes);

    const userReq = parent.request({ resource: { path: '/user' } });
    const userRes = parent.response({ resource: {} });
    await parent.emit('GET /user', userReq, userRes);

    const getReq = parent.request({ resource: { path: '/user/1' } });
    const getRes = parent.response({ resource: {} });
    await parent.emit('GET /user/1', getReq, getRes);

    const putReq = parent.request({ resource: { path: '/user/1' } });
    const putRes = parent.response({ resource: {} });
    await parent.emit('PUT /user/1', putReq, putRes);

    const deleteReq = parent.request({ resource: { path: '/user/1' } });
    const deleteRes = parent.response({ resource: {} });
    await parent.emit('DELETE /user/1', deleteReq, deleteRes);

    const fallbackReq = parent.request({ resource: { path: '/files/missing/path' } });
    const fallbackRes = parent.response({ resource: {} });
    await parent.emit('PATCH /files/missing/path', fallbackReq, fallbackRes);

    expect(triggered).to.deep.equal([
      'root',
      'login',
      'user',
      'get:1',
      'put:1',
      'delete:1',
      'wildcard'
    ]);
    expect(rootRes.body).to.equal('root');
    expect(loginRes.body).to.equal('login');
    expect(userRes.body).to.equal('user');
    expect(getRes.body).to.equal('get:1');
    expect(putRes.body).to.equal('put:1');
    expect(deleteRes.body).to.equal('delete:1');
    expect(fallbackRes.body).to.equal('fallback');
  });
})
