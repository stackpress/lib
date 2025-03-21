//common
import type {
  Task, 
  TaskItem,
  Event, 
  EventMap, 
  EventData,
  EventName,
  EventHook, 
  EventMatch
} from '../types';
import Status from '../Status';
//queue
import TaskQueue from '../queue/TaskQueue';

/**
 * Allows the ability to listen to events made known by another
 * piece of functionality. Events are items that transpire based
 * on an action. With events you can add extra functionality
 * right after the event has triggered.
 */
export default class EventEmitter<M extends EventMap> {
  //called after each task
  protected _after?: EventHook<M[keyof M]>;
  //called before each task
  protected _before?: EventHook<M[keyof M]>;
  //Static event data analyzer
  protected _event?: Event<M[keyof M]>;
  //A route map to task queues
  //ie. { event -> [ ...{ item, priority } ] }
  protected _listeners: { [ K in keyof M ]?: Set<TaskItem<M[K]>> } = {};

  /**
   * Sets the after action
   */
  public set after(action: EventHook<M[keyof M]>) {
    this._after = action;
  }

  /**
   * Sets the before action
   */
  public set before(action: EventHook<M[keyof M]>) {
    this._before = action;
  }

  /**
   * Returns the current event match
   */
  public get event() {
    return this._event;
  }
  
  /**
   * Returns a shallow copy of the listeners
   */
  public get listeners() {
    return Object.freeze({ ...this._listeners });
  }

  /**
   * Removes an event from the listeners
   */
  public clear<N extends EventName<M>>(event: N) {
    if (typeof this._listeners[event] !== 'undefined') {
      delete this._listeners[event];
    }
    return this;
  }

  /**
   * Calls all the callbacks of the given event passing the given arguments
   */
  public async emit<N extends EventName<M>>(event: N, ...args: M[N]) {
    const queue = this.tasks<N>(event);
    
    //if there are no events found
    if (queue.size === 0) {
      //report a 404
      return Status.codes.NOT_FOUND;
    }

    return await queue.run(...args);
  }

  /**
   * Returns a new task queue (defined like this so it can be overloaded)
   */
  public makeQueue<A extends Array<unknown>>() {
    return new TaskQueue<A>();
  }

  /**
   * Returns possible event matches
   */
  public match(event: string) {
    const matches = new Map<string, EventMatch>();
    //exact match
    if (typeof this.listeners[event] !== 'undefined') {
      //this is a placeholder for class extensions...
      const data: EventData = { args: [], params: {} };
      matches.set(event, { event, pattern: event, data });
    }
    //return all the matches
    return matches;
  }
  
  /**
   * Adds a callback to the given event listener
   */
  public on<N extends EventName<M>>(
    event: N, 
    action: Task<M[N]>,
    priority = 0
  ) {
    //add the event to the listeners
    if (typeof this._listeners[event] === 'undefined') {
      this._listeners[event] = new Set<TaskItem<M[N]>>();
    }

    const listeners = this._listeners[event] as Set<TaskItem<M[N]>>;
    listeners.add({ item: action, priority });
    return this;
  }

  /**
   * Returns a task queue for given the event
   */
  public tasks<N extends EventName<M>>(event: N) {
    const matches = this.match(event);
    const queue = this.makeQueue<M[keyof M]>();

    for (const [ event, match ] of matches) {
      //if no direct observers
      if (typeof this._listeners[event] === 'undefined') {
        continue;
      }
      //then loop the observers
      const tasks = this._listeners[event] as Set<TaskItem<M[keyof M]>>;
      tasks.forEach(task => {
        queue.add(this._task(match, task), task.priority);
      });
    }

    return queue;
  }

  /**
   * Stops listening to an event
   */
  public unbind<N extends EventName<M>>(event: N, action: Task<M[N]>) {
    const set = this._listeners[event];
    if (set) {
      set.forEach(task => {
        if (task.item === action) {
          set.delete(task);
        }
      });
    }
    return this;
  }

  /**
   * Allows events from other emitters to apply here
   */
  public use(emitter: EventEmitter<M>) {
    //next this listen to what they were listening to
    //event listeners = event -> Set
    //loop through the listeners of the emitter
    for (const event in emitter.listeners) {
      //get the observers
      const tasks = emitter.listeners[event];
      //if no direct observers (shouldn't happen)
      if (typeof tasks === 'undefined') {
        //skip
        continue;
      }
      //then loop the tasks
      for (const { item, priority } of tasks) {
        //listen to each task one by one
        this.on(event, item, priority);
      }
    }
    return this;
  }

  /**
   * Returns a task for the given event and task
   * Allows for class extensions to overload this method
   */
  protected _task(match: EventMatch, task: TaskItem<M[keyof M]>) {
    return async (...args: M[keyof M]) => {
      //set the current
      this._event = { ...match, ...task, args, action: task.item };
      //before hook
      if (typeof this._before === 'function' 
        && await this._before(this._event) === false
      ) {
        return false;
      }
      //if this is the same event, call the 
      //method, if the method returns false
      if (await task.item(...args) === false) {
        return false;
      }
      //after hook
      if (typeof this._after === 'function' 
        && await this._after(this._event) === false
      ) {
        return false;
      }
    };
  }
}