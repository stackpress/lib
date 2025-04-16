import crypto from 'node:crypto';
import { describe, it } from 'mocha';
import { expect } from 'chai';
//NOTE: no extensions in tests because it's excluded in tsconfig.json and
//we are testing in a typescript environment via `ts-mocha -r tsx` (esm)
import Router from '../src/router/Router';

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
      const type = req.data('type');
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

      res.setResults({ username });
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
})