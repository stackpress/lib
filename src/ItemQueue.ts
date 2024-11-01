import type { Item } from './types';

/**
 * An item queue that consumes in order of priority and FIFO
 */
export default class TaskQueue<I> {
  //The in memory task queue. Dont use 
  //Set because we will be sorting constantly
  public readonly queue: Item<I>[] = [];
  //Used when determining what is the lowest
  //priority when pushing into the queue
  protected _lower: number = 0;
  //Used when determining what is the lowest 
  //priority when shifting into the queue
  protected _upper: number = 0;

  /**
   * The size of the queue
   */
  public get size(): number {
    return this.queue.length;
  }

  /**
   * Adds a task to the queue
   */
  public add(item: I, priority: number = 0) {
    if (priority > this._upper) {
      this._upper = priority;
    } else if (priority < this._lower) {
      this._lower = priority;
    }

    //fifo by default
    this.queue.push({ item, priority });

    //then sort by priority
    this.queue.sort((a, b) => {
      return a.priority <= b.priority ? 1: -1;
    })

    return this;
  }

  /**
   * Adds a task to the bottom of the queue
   */
  public push(item: I) {
    return this.add(item, this._lower - 1);
  }

  /**
   * Adds a task to the top of the queue
   */
  public shift(item: I) {
    return this.add(item, this._upper + 1);
  }

  /**
   * Consume item one at a time
   */
  public consume() {
    return this.queue.shift()?.item;
  }
}