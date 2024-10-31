import type { 
  Event, 
  EventMap, 
  EventName, 
  EventAction, 
  EventMatch, 
  Task 
} from './types';
import TaskQueue from './TaskQueue';
import StatusCode from './StatusCode';

/**
 * Allows the ability to listen to events made known by another
 * piece of functionality. Events are items that transpire based
 * on an action. With events you can add extra functionality
 * right after the event has triggered.
 */
export default class EventEmitter<M extends EventMap> {
  //A route map to task queues
  protected _listeners: { [ K in keyof M ]?: Set<Task<M[K]>> } = {};
  //Event regular expression map
  public readonly regexp = new Set<string>();

  //Static event data analyzer
  protected _event?: Event<Array<any>>;

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
    return { ...this._listeners };
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
      return StatusCode.NOT_FOUND;
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
      matches.set(event, { event, pattern: event, parameters: [] });
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
      let match, parameters: string[];
      if (regexp.flags.indexOf('g') === -1) {
        const match = event.match(regexp);
        if (!match || !match.length) {
          return;
        }
        parameters = [];
        if (Array.isArray(match)) {
          parameters = match.slice();
          parameters.shift();
        }
      } else {
        match = Array.from(event.matchAll(regexp));
        if (!Array.isArray(match[0]) || !match[0].length) {
          return;
        }

        parameters = match[0].slice();
        parameters.shift();
      }
      matches.set(pattern, { event, pattern, parameters });
    });

    return matches;
  }
  
  /**
   * Adds a callback to the given event listener
   */
  public on<N extends EventName<M>>(
    event: N|RegExp, 
    action: EventAction<M[N]>,
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
      this._listeners[event] = new Set<Task<M[N]>>();
    }

    const listeners = this._listeners[event] as Set<Task<M[N]>>;
    listeners.add({ action, priority });
    return this;
  }

  /**
   * Returns a task queue for given the event
   */
  public tasks<N extends EventName<M>>(event: N) {
    const matches = this.match(event);
    const queue = this.makeQueue<M[N]>();

    for (const [ event, match ] of matches) {
      //if no direct observers
      if (typeof this._listeners[event] === 'undefined') {
        continue;
      }
      //then loop the observers
      const tasks = this._listeners[event] as Set<Task<M[N]>>;
      tasks.forEach(task => {
        const event: Event<M[N]> = { ...match, ...task };
        queue.add(async (...args) => {
          //set the current
          this._event = event;
          //if this is the same event, call the 
          //method, if the method returns false
          return await task.action(...args);
        }, task.priority);
      });
    }

    return queue;
  }

  /**
   * Stops listening to an event
   */
  public unbind<N extends EventName<M>>(event: N, action: EventAction<M[N]>) {
    const set = this._listeners[event];
    if (set) {
      set.forEach(task => {
        if (task.action === action) {
          set.delete(task);
        }
      });
    }
    return this;
  }

  /**
   * Allows events from other emitters to apply here
   */
  use(emitter: EventEmitter<M>) {
    //first concat their regexp with this one
    emitter.regexp.forEach(pattern => this.regexp.add(pattern));
    //next this listen to what they were listening to
    //event listeners = event -> TaskQueue
    for (const event in emitter.listeners) {
      const tasks = emitter.listeners[event];
      if (typeof tasks === 'undefined') {
        continue;
      }

      for (const { action, priority } of tasks ) {
        this.on(event, action, priority);
      }
    }
    return this;
  }
}