//common
import type { 
  TaskAction, 
  EventMap, 
  EventName,
  EventData,
  EventMatch,
  EventExpression
} from '../types.js';
//local
import EventEmitter from './EventEmitter.js';

export const VARIABLE_NAME = /(\:[a-zA-Z0-9\-_]+)/g;
export const EVENT_PATTERNS = /(\:[a-zA-Z0-9\-_]+)|(\*\*)|(\*)/g;

export default class ExpressEmitter<M extends EventMap> 
  extends EventEmitter<M> 
{
  //pattern separator
  public readonly separator: string;
  //map of event names to expressions
  //expressions = { event -> { pattern, regexp } }
  public readonly expressions = new Map<string, EventExpression>();

  /**
   * Sets the pattern separator
   */
  public constructor(separator = '/') {
    super();
    this.separator = separator;
  }

  /**
   * Returns possible event matches
   */
  public match(event: string) {
    //first do the obvious match
    const matches = super.match(event);
    //next do the calculated matches
    this.expressions.forEach((expression, key) => {
      //try to get the parameters
      const match = this._match(event, expression);
      //if we have a match
      if (match) {
        //add to the matches
        matches.set(key, match);
      }
    });
    //return all the matches
    return matches;
  }

  /**
   * Adds a callback to the given event listener
   */
  public on<N extends EventName<M>>(
    event: N|RegExp, 
    action: TaskAction<M[N]>,
    priority = 0
  ) {
    event = this._eventName(event);
    //listen to the literal event
    return this._listen(event, action, priority);
  }

  /**
   * Allows events from other emitters to apply here
   */
  public use(emitter: EventEmitter<M>) {
    //if the emitter is a typeof this
    if (emitter instanceof ExpressEmitter) {
      //first concat their regexp with this one
      emitter.expressions.forEach(
        (expression, event) => this.expressions.set(event, expression)
      );
    }
    //next merge the listeners
    super.use(emitter);
    return this;
  }

  /**
   * Determines the event name from the given event
   * This also sets the expression in the expressions map.
   * Allows for class extensions to overload this method.
   */
  protected _eventName<N extends EventName<M>>(event: N|RegExp) {
    //if it is a regexp object
    if (event instanceof RegExp) {
      return this._eventNameFromRegExp(event, '') as N;
    } else {
      //make event into a regular expression fragment
      const fragment = this._toFragment(event);
      //if the fragment is different from the original event
      if (fragment !== event) {
        return this._eventNameFromExpression(`^${fragment}$`, event) as N;
      }
    }
    return event as N;
  }

  /**
   * Adds a callback to the given expression.
   * This also sets the expression in the expressions map.
   * Allows for class extensions to overload this method.
   */
  protected _eventNameFromExpression(expression: string, pattern: string) {
    const regexp = new RegExp(expression, 'g');
    const event = regexp.toString();
    //add the expression
    this.expressions.set(event, { pattern, regexp });
    return event;
  }

  /**
   * Adds a callback to the given regular expression
   * This also sets the expression in the expressions map.
   * Allows for class extensions to overload this method.
   */
  protected _eventNameFromRegExp(regexp: RegExp, pattern: string) {
    //event key is the stringified regexp
    const event = regexp.toString();
    //add the expression
    //set pattern to empty
    this.expressions.set(event, { pattern, regexp });
    return event;
  }

  /**
   * Listens to the literal event
   * Allows for class extensions to overload this method.
   */
  protected _listen<N extends EventName<M>>(
    event: N, 
    action: TaskAction<M[N]>,
    priority = 0
  ) {
    //listen to the literal event
    return super.on(event, action, priority);
  }
  
  /**
   * Returns dynamic variables extracted from the event
   * using the given pattern. This is used in `match()`,
   * but you can use this freely for other purposes.
   * Allows for class extensions to overload this method.
   */
  protected _match(event: string, expression: EventExpression) {
    const { pattern, regexp } = expression;
    //because String.matchAll only works for global flags ...
    const data: EventData = { args: [], params: {} };
    //now check to see if the emitted event matches the pattern
    if (regexp.flags.indexOf('g') === -1) {
      //if global use match()
      const match = event.match(regexp);
      if (!match || !match.length) {
        return null;
      }
      if (Array.isArray(match)) {
        data.args = match.slice();
        data.args.shift();
      }
    } else {
      //not global use matchAll()
      const match = Array.from(event.matchAll(regexp));
      if (!Array.isArray(match[0]) || !match[0].length) {
        return null;
      }

      data.args = match[0].slice();
      data.args.shift();
    }

    //if there is a pattern
    if (pattern.length === 0) {
      return { event, pattern: regexp.toString(), data } as EventMatch;
    }
    //find and organize all the dynamic parameters for mapping
    const map = Array.from(
      pattern.matchAll(EVENT_PATTERNS)
    ).map(match => match[0]);
    //args are really the pure matches
    //extracted from the event
    const args = data.args;
    //reset the args
    data.args = [];
    //loop through the original args
    args.forEach((param, i) => {
      //so matches will look like
      // [ 'foo', 'bar' ]
      //and map will look like
      // [ ':foo', ':bar' ]
      //if it's a * param
      if (typeof map[i] !== 'string' 
        || map[i].indexOf('*') === 0
      ) {
        //if no / in param
        if (param.indexOf('/') === -1) {
          //single push
          return data.args.push(param);
        }

        //push multiple values
        return Array.prototype.push.apply(
          data.args, 
          param.split('/')
        );
      }

      //if it's a :parameter
      if (typeof map[i] === 'string') {
        data.params[map[i].substring(1)] = param;
      }
    });
    //if we are here, then the event matches the pattern
    return { event, pattern, data } as EventMatch;
  }

  /**
   * Converts an event pattern to a regular expression
   * Allows for class extensions to overload this method.
   */
  protected _toFragment(pattern: string) {
    const sep = `[^${this.separator}]+`;
    //make pattern into an event key
    return pattern
      //replace the :variable-_name01
      .replace(VARIABLE_NAME, '*')
      //replace the stars
      //* -> ([^/]+)
      .replaceAll('*', `(${sep})`)
      //** -> ([^/]+)([^/]+) -> (.*)
      .replaceAll(`(${sep})(${sep})`, '(.*)');
  }
}