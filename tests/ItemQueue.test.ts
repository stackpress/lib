import { describe, it } from 'mocha';
import { expect } from 'chai';
//NOTE: no extensions in tests because it's excluded in tsconfig.json
//and we are testing in a typescript environment via ts-mocha
import ItemQueue from '../src/queue/ItemQueue';

describe('Item Queue Tests', () => {
  it('Should consume items', async () => {
    const queue = new ItemQueue<number>;

    expect(queue.size).to.equal(0);
    expect(queue.consume()).to.be.undefined;

    queue.push(1).shift(2).add(3, 10);

    expect(queue.size).to.equal(3);

    expect(queue.consume()).to.equal(3);
    expect(queue.consume()).to.equal(2);
    expect(queue.consume()).to.equal(1);
    expect(queue.consume()).to.be.undefined;
    expect(queue.size).to.equal(0);
  });
});