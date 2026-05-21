import { describe, it } from 'mocha';
import { expect } from 'chai';
//NOTE: no extensions in tests because it's excluded in tsconfig.json and
//we are testing in a typescript environment via `ts-mocha -r tsx` (esm)
import cookie, { parse, serialize } from '../src/data/cookie.js';

describe('cookie Tests', () => {
  it('Should parse empty and invalid cookie strings', () => {
    const empty = parse('');
    const invalid = parse('foo; bar=baz');
    const trailing = parse('foo=bar; flag');

    expect('toString' in empty).to.be.false;
    expect(empty).to.deep.equal({});
    expect(invalid).to.deep.equal({ bar: 'baz' });
    expect(trailing).to.deep.equal({ foo: 'bar' });
  });

  it('Should parse and trim cookie values', () => {
    const parsed = parse(' foo = bar ; foo=baz; spaced=   ; encoded=%20value%20 ');

    expect(parsed.foo).to.equal('bar');
    expect(parsed.spaced).to.equal('');
    expect(parsed.encoded).to.equal(' value ');
  });

  it('Should use custom decode and preserve undecodable values', () => {
    const decoded = parse('token=abc; raw=%E0%A4%A', {
      decode: value => value === 'abc' ? 'decoded' : value
    });
    const fallback = parse('raw=%E0%A4%A');

    expect(decoded.token).to.equal('decoded');
    expect(decoded.raw).to.equal('%E0%A4%A');
    expect(fallback.raw).to.equal('%E0%A4%A');
  });

  it('Should serialize basic cookies and expose the default api', () => {
    expect(cookie.parse).to.equal(parse);
    expect(cookie.serialize).to.equal(serialize);
    expect(serialize('foo', 'bar baz')).to.equal('foo=bar%20baz');
  });

  it('Should serialize all supported cookie options', () => {
    const expires = new Date('2025-01-02T03:04:05.000Z');
    const serial = serialize('foo', 'bar', {
      maxAge: 60,
      domain: '.example.com',
      path: '/docs',
      expires,
      httpOnly: true,
      secure: true,
      partitioned: true,
      priority: 'high',
      sameSite: true
    });

    expect(serial).to.equal(
      'foo=bar'
      + '; Max-Age=60'
      + '; Domain=.example.com'
      + '; Path=/docs'
      + '; Expires=Thu, 02 Jan 2025 03:04:05 GMT'
      + '; HttpOnly'
      + '; Secure'
      + '; Partitioned'
      + '; Priority=High'
      + '; SameSite=Strict'
    );
  });

  it('Should serialize priority and sameSite variants', () => {
    expect(serialize('foo', 'bar', { priority: 'low' }))
      .to.equal('foo=bar; Priority=Low');
    expect(serialize('foo', 'bar', { priority: 'medium' }))
      .to.equal('foo=bar; Priority=Medium');
    expect(serialize('foo', 'bar', { sameSite: 'lax' }))
      .to.equal('foo=bar; SameSite=Lax');
    expect(serialize('foo', 'bar', { sameSite: 'none' }))
      .to.equal('foo=bar; SameSite=None');
  });

  it('Should allow a custom encoder', () => {
    const serial = serialize('foo', 'bar', {
      encode: value => value.toUpperCase()
    });

    expect(serial).to.equal('foo=BAR');
  });

  it('Should reject invalid cookie names and values', () => {
    expect(() => serialize('bad name', 'bar'))
      .to.throw(TypeError, 'argument name is invalid: bad name');
    expect(() => serialize('foo', 'bar', { encode: () => 'bad;value' }))
      .to.throw(TypeError, 'argument val is invalid: bar');
  });

  it('Should reject invalid maxAge, domain and path options', () => {
    expect(() => serialize('foo', 'bar', { maxAge: 1.5 }))
      .to.throw(TypeError, 'option maxAge is invalid: 1.5');
    expect(() => serialize('foo', 'bar', { domain: 'bad_domain' }))
      .to.throw(TypeError, 'option domain is invalid: bad_domain');
    expect(() => serialize('foo', 'bar', { path: '/docs\n' }))
      .to.throw(TypeError, 'option path is invalid: /docs\n');
  });

  it('Should reject invalid expires, priority and sameSite options', () => {
    expect(() => serialize('foo', 'bar', {
      expires: new Date(Number.NaN)
    })).to.throw(TypeError, 'option expires is invalid: Invalid Date');
    expect(() => serialize('foo', 'bar', {
      expires: '2025-01-02' as any
    })).to.throw(TypeError, 'option expires is invalid: 2025-01-02');
    expect(() => serialize('foo', 'bar', { priority: true as any }))
      .to.throw(TypeError, 'option priority is invalid: true');
    expect(() => serialize('foo', 'bar', { priority: 'urgent' as any }))
      .to.throw(TypeError, 'option priority is invalid: urgent');
    expect(() => serialize('foo', 'bar', { sameSite: 'loose' as any }))
      .to.throw(TypeError, 'option sameSite is invalid: loose');
  });
});
