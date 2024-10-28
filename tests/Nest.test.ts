import { describe, it } from 'mocha';
import { expect } from 'chai';
import Nest from '../src/Nest';

const body = `--BOUNDARY\r
Content-Disposition: form-data; name="foo"\r
bar\r
--BOUNDARY\r
Content-Disposition: form-data; name="bar"\r
zoo
--BOUNDARY--`

describe('Hash Store Tests', () => {
  it('Should CRUD', async () => {
    let store = new Nest;
    store.set('foo', 'bar', 'zoo');
    store.set('foo', 'zoo', ['foo', 'bar', 'zoo']);

    expect(store.has('foo', 'bar')).to.equal(true);
    expect(store.has('bar', 'foo')).to.equal(false);
    expect(store.get('foo', 'zoo', 1)).to.equal('bar');

    store.delete('foo', 'bar');
    expect(store.has('foo', 'bar')).to.equal(false);
    expect(store.has('foo', 'zoo')).to.equal(true);

    //foo=bar&zoo[]=1&zoo[]=2&zoo[]=3&product[title]=test
    //&product[price]=1000&product[rating][]=1&product[rating][]=2
    //&product[rating][]=3&product[abstract][][name]=john
    //&product[abstract][][name]=james&boom[]=1
    store = new Nest;
    store.set('foo', 'bar');
    store.set('zoo', '', 1);
    store.set('zoo', '', 2);
    store.set('zoo', '', 3);
    store.set('product', 'title', 'test');
    store.set('product', 'price', 1000);
    store.set('product', 'rating', '', 1);
    store.set('product', 'rating', '', 2);
    store.set('product', 'rating', '', 3);
    store.set('product', 'abstract', '', 'name', 'john');
    store.set('product', 'abstract', '', 'name', 'james');
    store.set('boom', '', 1);

    const expected = '{"foo":"bar","zoo":[1,2,3],"product":{"title":"test",'
      + '"price":1000,"rating":[1,2,3],"abstract":[{"name":"john"},'
      + '{"name":"james"}]},"boom":[1]}';

    const actual = JSON.stringify(store.get());

    expect(actual).to.equal(expected);
  });

  it('Should path', async () => {
    let store = new Nest;
    store.withPath.set('foo.bar', 'zoo');
    store.withPath.set('foo.zoo', ['foo', 'bar', 'zoo']);

    expect(store.withPath.has('foo.bar')).to.equal(true);
    expect(store.withPath.has('bar.foo')).to.equal(false);
    expect(store.withPath.get('foo.zoo.1')).to.equal('bar');

    store.withPath.delete('foo.bar');
    expect(store.withPath.has('foo.bar')).to.equal(false);
    expect(store.withPath.has('foo.zoo')).to.equal(true);

    store.withPath.forEach('foo.zoo', (value, index) => {
      expect(value).to.equal(['foo', 'bar', 'zoo'][index]);
    });
  });

  it('Should set with query string', async () => {
    let store = new Nest;
    store.withQuery.set('zoo=bar&foo[zoo][0]=foo&foo[zoo][1]=bar&foo[zoo][2]=john+doe');

    expect(store.has('zoo')).to.equal(true);
    expect(store.get('foo', 'zoo', 1)).to.equal('bar');
    expect(store.get('foo', 'zoo', 2)).to.equal('john doe');
  });

  it('Should set with form data', async () => {
    let store = new Nest;
    store.withFormData.set(body);

    expect(store.has('foo')).to.equal(true);
    expect(store.get('bar')).to.equal('zoo');
  });
});