//common
import type {
  Task, 
  TaskItem,
  Event, 
  EventMap, 
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
  //Event regular expression map
  public readonly regexp = new Set<string>();
  //called after each task
  protected _after?: EventHook<M[keyof M]>;
  //called before each task
  protected _before?: EventHook<M[keyof M]>;
  //Static event data analyzer
  protected _event?: Event<M[keyof M]>;
  //A route map to task queues
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
    //first do the obvious match
    if (typeof this.listeners[event] !== 'undefined') {
      const data: EventMatch['data'] = { args: [], params: {} };
      matches.set(event, { event, pattern: event, data });
    }
    //next do the calculated matches
    this.regexp.forEach(pattern => {
      //make regexp so we can compare against the trigger
      const regexp = new RegExp(
        // pattern,
        pattern.substring(
          pattern.indexOf('/') + 1,
          pattern.lastIndexOf('/')
        ),
        // flag
        pattern.substring(
          pattern.lastIndexOf('/') + 1
        )
      );
      //because String.matchAll only works for global flags ...
      const data: EventMatch['data'] = { args: [], params: {} };
      if (regexp.flags.indexOf('g') === -1) {
        const match = event.match(regexp);
        if (!match || !match.length) {
          return;
        }
        if (Array.isArray(match)) {
          data.args = match.slice();
          data.args.shift();
        }
      } else {
        const match = Array.from(event.matchAll(regexp));
        if (!Array.isArray(match[0]) || !match[0].length) {
          return;
        }

        data.args = match[0].slice();
        data.args.shift();
      }
      matches.set(pattern, { event, pattern, data });
    });

    return matches;
  }
  
  /**
   * Adds a callback to the given event listener
   */
  public on<N extends EventName<M>>(
    event: N|RegExp, 
    action: Task<M[N]>,
    priority = 0
  ) {
    //if it is a regexp object
    if (event instanceof RegExp) {
      //make it into a string
      event = event.toString() as N;
      //go ahead and add the pattern
      //set guarantees uniqueness
      this.regexp.add(event);
    }

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
        queue.add(async (...args) => {
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
        }, task.priority);
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
    //first concat their regexp with this one
    emitter.regexp.forEach(pattern => this.regexp.add(pattern));
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
}