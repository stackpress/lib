//common
import type { TaskAction, ResponseStatus } from '../types';
import Status from '../Status';
//local
import ItemQueue from './ItemQueue';

/**
 * A task queue linearly executes each task
 */
export default class TaskQueue<A extends Array<unknown>> 
  extends ItemQueue<TaskAction<A>> 
{
  //called after each task
  protected _after?: TaskAction<A>;
  //called before each task
  protected _before?: TaskAction<A>;

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
   * Runs the tasks
   */
  async run(...args: A): Promise<ResponseStatus> {
    if (!this.queue.length) {
      //report a 404
      return Status.NOT_FOUND;
    }

    while (this.queue.length) {
      const task = this.consume() as TaskAction<A>;
      if (this._before && await this._before(...args) === false) {
        return Status.ABORT;
      }
      if (task && await task(...args) === false) {
        return Status.ABORT;
      }
      if (this._after && await this._after(...args) === false) {
        return Status.ABORT;
      }
    }

    return Status.OK;
  }
}