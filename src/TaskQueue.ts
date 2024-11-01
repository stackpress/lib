import type { Task, Status } from './types';

import ItemQueue from './ItemQueue';
import StatusCode from './StatusCode';

/**
 * A task queue linearly executes each task
 */
export default class TaskQueue<A extends Array<unknown>> extends ItemQueue<Task<A>> {
  //called after each task
  protected _after?: Task<A>;
  //called before each task
  protected _before?: Task<A>;

  /**
   * Sets the after action
   */
  public set after(action: Task<A>) {
    this._after = action;
  }

  /**
   * Sets the before action
   */
  public set before(action: Task<A>) {
    this._before = action;
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
      const task = this.consume() as Task<A>;
      if (this._before && await this._before(...args) === false) {
        return StatusCode.ABORT;
      }
      if (task && await task(...args) === false) {
        return StatusCode.ABORT;
      }
      if (this._after && await this._after(...args) === false) {
        return StatusCode.ABORT;
      }
    }

    return StatusCode.OK;
  }
}