import { describe, it } from 'mocha';
import { expect } from 'chai';
import TaskQueue from '../src/TaskQueue';

describe('Task Queue Tests', () => {
  it('Should run tasks', async () => {
    const queue = new TaskQueue<[number]>;

    let triggered: number[] = [];

    expect((await queue.run(1)).code).to.equal(404);

    queue
      .push((x: number) => {
        triggered.push(x + 1);
      })
      .shift((x: number) => {
        triggered.push(x + 2);
      })
      .add((x: number) => {
        triggered.push(x + 3);
      }, 10);

    expect(queue.size).to.equal(3);
    
    await queue.run(1);

    expect(triggered[0]).to.equal(4);
    expect(triggered[1]).to.equal(3);
    expect(triggered[2]).to.equal(2);

    expect(queue.size).to.equal(0);
  });

  it('Should run tasks async', async () => {
    const queue = new TaskQueue;

    let triggered: number[] = [];

    expect((await queue.run(1)).code).to.equal(404);

    // @ts-ignore
    await queue.push(async () => {
      triggered.push(1);
    }).shift(async () => {
      triggered.push(2);
    }).add(async () => {
      triggered.push(3);
    }, 10).run();

    expect(triggered[0]).to.equal(3);
    expect(triggered[1]).to.equal(2);
    expect(triggered[2]).to.equal(1);
  });

  it('Should abort', async () => {
    const queue = new TaskQueue;

    let triggered: number[] = [];

    // @ts-ignore
    const actual = await queue.push(() => {
      triggered.push(1);
    }).shift(() => {
      triggered.push(2);
    }).add(() => {
      triggered.push(3);
      return false;
    }, 10).run();

    expect(actual.code).to.equal(309);
    expect(triggered[0]).to.equal(3);
    expect(triggered.length).to.equal(1);
  });
});