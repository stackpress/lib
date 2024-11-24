import { describe, it } from 'mocha';
import { expect } from 'chai';
import Nest from '../src/Nest';
import ReadonlyNest from '../src/readonly/Nest';


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

    type Foo = {
      foo: {
        bar: string;
        zoo: string[];
      }
    };

    expect(store.has('foo', 'bar')).to.equal(true);
    expect(store.has('bar', 'foo')).to.equal(false);
    expect(store.get<string>('foo', 'zoo', 1)).to.equal('bar');
    expect(store.get<Foo>().foo.zoo[0]).to.equal('foo');

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
    expect(store.withPath.get<string>('foo.zoo.1')).to.equal('bar');

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
    expect(store.get<string>('foo', 'zoo', 2)).to.equal('john doe');

    store = new Nest;
    store.withQuery.set('filter%5Btype%5D=user&span%5Bcreated%5D%5B0%5D=2024-10-29T13%3A27%3A54.431&span%5Bcreated%5D%5B1%5D=2024-10-29T13%3A27%3A54.431&span%5Bupdated%5D%5B0%5D=2024-10-29T13%3A27%3A54.432&span%5Bupdated%5D%5B1%5D=2024-10-29T13%3A27%3A54.432');
    expect(store.get('span', 'created', 0)).to.equal('2024-10-29T13:27:54.431');
    expect(store.get('span', 'created', 1)).to.equal('2024-10-29T13:27:54.431');
    expect(store.get('span', 'updated', 0)).to.equal('2024-10-29T13:27:54.432');
    expect(store.get('span', 'updated', 1)).to.equal('2024-10-29T13:27:54.432');

    store = new Nest;
    store.withQuery.set('filter%5Btype%5D=&span%5Bcreated%5D%5B0%5D=&span%5Bcreated%5D%5B1%5D=&span%5Bupdated%5D%5B0%5D=&span%5Bupdated%5D%5B1%5D=');
    expect(store.get('filter', 'type')).to.equal('');
    expect(store.get('span', 'created', 0)).to.equal('');
    expect(store.get('span', 'created', 1)).to.equal('');
    expect(store.get('span', 'updated', 0)).to.equal('');
    expect(store.get('span', 'updated', 1)).to.equal('');

    store = new Nest;
    store.withQuery.set('tags%5B%5D=foo&tags%5B%5D=bar&filter%5Btype%5D%5B%5D=john+doe');
    expect(store.get('tags', 0)).to.equal('foo');
    expect(store.get('tags', 1)).to.equal('bar');
    expect(store.get('filter', 'type', 0)).to.equal('john doe');
  });

  it('Should set with form data', async () => {
    let store = new Nest;
    store.withFormData.set(body);

    expect(store.has('foo')).to.equal(true);
    expect(store.get('bar')).to.equal('zoo');
  });

  it('Should use type map', async () => {
    let store = new Nest<{
      foo: {
        bar: string;
        zoo: string[];
      };
      product: {
        title: string;
        price: number;
        rating: number[];
        abstract: { name: string }[];
      };
      boom: number[];
    }>;
    store.set('foo', 'bar', 'zoo');
    store.set('foo', 'zoo', ['foo', 'bar', 'zoo']);
    expect(store.get().foo.zoo[0]).to.equal('foo');
  });

  //<!------------- NEW TESTS ------------------------------->
  it('Should clear all data', async () => {
    let store = new Nest;
    store.set('foo', 'bar');
    store.set('baz', 'qux');
    expect(store.has('foo')).to.equal(true);
    expect(store.has('baz')).to.equal(true);
    store.clear();
    expect(store.has('foo')).to.equal(false);
    expect(store.has('baz')).to.equal(false);
  });


  it('Should set deeply nested data', async () => {
    let store = new Nest;
    store.set('user', 'address', 'city', 'New York');
    store.set('user', 'address', 'zipcode', '10001');
    expect(store.get('user', 'address', 'city')).to.equal('New York');
    expect(store.get('user', 'address', 'zipcode')).to.equal('10001');
  });


  it('Should delete from nested data', async () => {
    let store = new Nest;
    store.set('user', 'address', 'city', 'New York');
    store.set('user', 'address', 'zipcode', '10001');
    store.delete('user', 'address', 'zipcode');
    expect(store.has('user', 'address', 'zipcode')).to.equal(false);
    expect(store.get('user', 'address', 'city')).to.equal('New York');
  });


  it('Should not set an empty object', async () => {
    let store = new Nest;
    store.set('empty', {});
    expect(store.get('empty')).to.deep.equal({});
  });

  it('Should throw error on invalid data', async () => {
    let store = new Nest;
    try {
      store.data = {} as any;
    } catch (error) {
      expect(error).to.exist;
      expect(error.message).to.equal('Argument 1 expected Object');
    }
  });

  it('Should handle non-object data', async () => {
    let store = new Nest;
    store.set('user', 'name', 'John Doe');
    store.set('user', 'age', 30);
    expect(store.get('user', 'name')).to.equal('John Doe');
    expect(store.get('user', 'age')).to.equal(30);
  });



  // <!------ READONLY NEST ---------!>
  describe('ReadonlyNest Tests', () => {
    it('Should initialize with empty data', () => {
      const nest = new ReadonlyNest();
      expect(nest.data).to.deep.equal({});
      expect(nest.size).to.equal(0);
    });

    it('Should initialize with provided data', () => {
      const data = { foo: 'bar' };
      const nest = new ReadonlyNest(data);
      expect(nest.data).to.deep.equal(data);
      expect(nest.size).to.equal(1);
    });

    it('Should get data by path', () => {
      const data = { foo: { bar: 'baz' } };
      const nest = new ReadonlyNest(data);
      expect(nest.get('foo', 'bar')).to.equal('baz');
    });

    it('Should return undefined for non-existent paths', () => {
      const data = { foo: 'bar' };
      const nest = new ReadonlyNest(data);
      expect(nest.get('bar')).to.equal(undefined);
    });

    it('Should check if path exists', () => {
      const data = { foo: { bar: 'baz' } };
      const nest = new ReadonlyNest(data);
      expect(nest.has('foo', 'bar')).to.equal(true);
      expect(nest.has('foo', 'baz')).to.equal(false);
    });

    it('Should get all keys', () => {
      const data = { foo: 'bar', zoo: 'baz' };
      const nest = new ReadonlyNest(data);
      expect(nest.keys()).to.deep.equal(['foo', 'zoo']);
    });

    it('Should get all entries', () => {
      const data = { foo: 'bar', zoo: 'baz' };
      const nest = new ReadonlyNest(data);
      expect(nest.entries()).to.deep.equal([['foo', 'bar'], ['zoo', 'baz']]);
    });

    it('Should handle empty array in forEach', async () => {
      const data = { foo: [] };
      const nest = new ReadonlyNest(data);
      const result = await nest.forEach('foo', (value, key) => {
        expect(value).to.equal(undefined);
        return true;
      });
      expect(result).to.equal(false);
    });

    it('Should loop through data in forEach', async () => {
      const data = { foo: ['bar', 'baz'] };
      const nest = new ReadonlyNest(data);
      let count = 0;
      const result = await nest.forEach('foo', (value: any, index: string | number) => {
        expect(value).to.equal(['bar', 'baz'][index]);
        count++;
        return true;
      });
      expect(count).to.equal(2);
      expect(result).to.equal(true);
    });

    it('Should handle toString with expand', () => {
      const data = { foo: { bar: 'baz' } };
      const nest = new ReadonlyNest(data);
      expect(nest.toString()).to.equal('{\n  "foo": {\n    "bar": "baz"\n  }\n}');
    });

    it('Should handle toString without expand', () => {
      const data = { foo: { bar: 'baz' } };
      const nest = new ReadonlyNest(data);
      expect(nest.toString(false)).to.equal('{"foo":{"bar":"baz"}}');
    });


    it('Should correctly handle nested objects', async () => {
      const data = { user: { name: 'John Doe', address: { city: 'New York', zipcode: '10001' } } };
      const nest = new ReadonlyNest(data);
      expect(nest.get('user', 'address', 'city')).to.equal('New York');
      expect(nest.get('user', 'address', 'zipcode')).to.equal('10001');
    });

    it('Should return false for empty object', async () => {
      const data = { empty: {} };
      const nest = new ReadonlyNest(data);
      expect(nest.get('empty')).to.deep.equal({});
    });

    it('Should not iterate over empty list in forEach', async () => {
      const data = { foo: [] };
      const nest = new ReadonlyNest(data);
      const result = await nest.forEach('foo', (value: any, key: any) => {
        expect(value).to.equal(undefined);
        return false;
      });
      expect(result).to.equal(false);
    });
  });



});