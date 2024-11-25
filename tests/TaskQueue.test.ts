import { describe, it } from 'mocha';
import { expect } from 'chai';
import TaskQueue from '../src/TaskQueue';
import StatusCode from '../src/StatusCode';

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



  /*
  * ADD UNIT TEST
  */

  it("should return NOT_FOUND when the queue is empty", async () => {
    const queue = new TaskQueue<[]>();
    const status = await queue.run();
    expect(status).to.equal(StatusCode.NOT_FOUND);
  });

  it("should execute tasks in sequence and return OK", async () => {
    const queue = new TaskQueue<[number]>();
    const results: number[] = [];

    queue.push(async (x: number) => {
      results.push(x + 1);
      return true;
    });
    queue.push(async (x: number) => {
      results.push(x + 2);
      return true;
    });

    const status = await queue.run(5);

    expect(status).to.equal(StatusCode.OK);
    expect(results).to.deep.equal([6, 7]);
  });
});

it("should abort if a task returns false", async () => {
  const queue = new TaskQueue<[number]>();
  const results: number[] = [];
  queue.push(async (x: number) => {
    results.push(x + 1);
    return true;
  });
  queue.push(async (x: number) => {
    results.push(x + 2);
    return false;
  });
  queue.push(async (x: number) => {
    results.push(x + 3);
    return true;
  });
  const status = await queue.run(5);
  expect(status).to.equal(StatusCode.ABORT);
  expect(results).to.deep.equal([6, 7]);
});

it("should abort if `_before` returns false", async () => {
  const queue = new TaskQueue<[number]>();
  const results: number[] = [];
  queue.before = async (x: number) => x < 5; 
  queue.push(async (x: number) => {
    results.push(x + 1);
    return true;
  });
  const status = await queue.run(5);
  expect(status).to.equal(StatusCode.ABORT);
  expect(results).to.deep.equal([]); 
});

it("should abort if `_after` returns false", async () => {
  const queue = new TaskQueue<[number]>();
  const results: number[] = [];
  queue.after = async (x: number) => x < 5; 
  queue.push(async (x: number) => {
    results.push(x + 1);
    return true;
  });

  const status = await queue.run(5); 
  expect(status).to.equal(StatusCode.ABORT);
  expect(results).to.deep.equal([6]); 


});