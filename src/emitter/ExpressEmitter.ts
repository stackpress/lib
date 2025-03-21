//common
import type { 
  Task, 
  EventMap, 
  EventName,
  EventData,
  EventMatch,
  EventExpression
} from '../types';
//local
import EventEmitter from './EventEmitter';

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
    action: Task<M[N]>,
    priority = 0
  ) {
    //if it is a regexp object
    if (event instanceof RegExp) {
      //listen to the regular expression event
      return this._onRegExp(event, '', action, priority);
    }
    //make event into a regular expression fragment
    const fragment = this._toFragment(event);
    //if the fragment is different from the original event
    if (fragment !== event) {
      //listen to the expression event
      return this._onExpression(`^${fragment}$`, event, action, priority);
    }
    //listen to the literal event
    return this._onLiteral(event, action, priority);
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
   * Adds a callback to the given expression
   * Allows for class extensions to overload this method.
   */
  protected _onExpression<N extends EventName<M>>(
    expression: string,
    pattern: string,
    action: Task<M[N]>,
    priority = 0
  ) {
    const regexp = new RegExp(expression, 'g');
    const event = regexp.toString();
    //add the expression
    this.expressions.set(event, { pattern, regexp });
    //add the listener
    super.on(event as N, action, priority);
    return this;
  }

  /**
   * Adds a callback to the given expression
   * Allows for class extensions to overload this method.
   */
  protected _onLiteral<N extends EventName<M>>(
    event: string,
    action: Task<M[N]>,
    priority = 0
  ) {
    //add the listener
    super.on(event as N, action, priority);
    return this;
  }

  /**
   * Adds a callback to the given regular expression
   * Allows for class extensions to overload this method.
   */
  protected _onRegExp<N extends EventName<M>>(
    regexp: RegExp, 
    pattern: string,
    action: Task<M[N]>,
    priority = 0
  ) {
    //event key is the stringified regexp
    const event = regexp.toString();
    //add the expression
    //set pattern to empty
    this.expressions.set(event, { pattern, regexp });
    //add the listener
    super.on(event as N, action, priority);
    return this;
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