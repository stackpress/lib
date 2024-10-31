import type { Task, TaskAction, Status } from './types';

import StatusCode from './StatusCode';

/**
 * A task queue linearly executes each task
 */
export default class TaskQueue<A extends Array<unknown>> {
  //The in memory task queue. Dont use 
  //Set because we will be sorting constantly
  public readonly queue: Task<A>[] = [];
  //Used when determining what is the lowest
  //priority when pushing into the queue
  protected _lower: number = 0;
  //Used when determining what is the lowest 
  //priority when shifting into the queue
  protected _upper: number = 0;
  //called after each task
  protected _after?: TaskAction<A>;
  //called before each task
  protected _before?: TaskAction<A>;

  /**
   * The size of the queue
   */
  public get size(): number {
    return this.queue.length;
  }

  /**
   * Sets the after action
   */
  public set after(action: TaskAction<A>) {
    this._after = action;
  }

  /**
   * Sets the before action
   */
  public set before(action: TaskAction<A>) {
    this._before = action;
  }

  /**
   * Adds a task to the queue
   */
  public add(action: TaskAction<A>, priority: number = 0) {
    if (priority > this._upper) {
      this._upper = priority;
    } else if (priority < this._lower) {
      this._lower = priority;
    }

    //fifo by default
    this.queue.push({ action, priority });

    //then sort by priority
    this.queue.sort((a, b) => {
      return a.priority <= b.priority ? 1: -1;
    })

    return this;
  }

  /**
   * Adds a task to the bottom of the queue
   */
  public push(action: TaskAction<A>) {
    return this.add(action, this._lower - 1);
  }

  /**
   * Adds a task to the top of the queue
   */
  public shift(action: TaskAction<A>) {
    return this.add(action, this._upper + 1);
  }

  /**
   * Runs the tasks
   */
  async run(...args: A): Promise<Status> {
    if (!this.queue.length) {
      //report a 404
      return StatusCode.NOT_FOUND;
    }

    while (this.queue.length) {
      const task = this.queue.shift();
      if (this._before && await this._before(...args) === false) {
        return StatusCode.ABORT;
      }
      if (task && await task.action(...args) === false) {
        return StatusCode.ABORT;
      }
      if (this._after && await this._after(...args) === false) {
        return StatusCode.ABORT;
      }
    }

    return StatusCode.OK;
  }
}