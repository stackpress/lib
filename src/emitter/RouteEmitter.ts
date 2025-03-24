//common
import type { 
  Route, 
  RouteMap, 
  RouteAction
} from '../types';
//local
import type EventEmitter from './EventEmitter';
import ExpressEmitter from './ExpressEmitter';

/**
 * Event driven routing system. Bring 
 * your own request and response types.
 */
export default class RouteEmitter<R = unknown, S = unknown> 
  extends ExpressEmitter<RouteMap<R, S>> 
{
  //map of event names to routes 
  //event -> { method, path }
  public readonly routes = new Map<string, Route>;

  /**
   * Sets the pattern separator
   */
  public constructor() {
    super('/');
  }

  /**
   * Returns a route
   */
  public route(
    method: string, 
    path: string, 
    action: RouteAction<R, S>, 
    priority = 0
  ) {
    const event = this._eventNameFromRoute(method, path);
    return this._listen(event, action, priority);
  }

  /**
   * Allows events from other emitters to apply here
   */
  public use(emitter: EventEmitter<RouteMap<R, S>>) {
    //check if the emitter is a router
    if (emitter instanceof RouteEmitter) {
      //first concat their routes with this one
      emitter.routes.forEach(
        (route, event) => this.routes.set(event, route)
      );
    }
    //next merge the expressions
    //next merge the listeners
    super.use(emitter);
    return this;
  }

  /**
   * Determines the event name given a method and path
   * This also sets the route in the routes map. 
   */
  protected _eventNameFromRoute(method: string, path: string) {
    //make sure the method is uppercase
    method = method.toUpperCase();
    //make regexp fragment from path
    const fragment = this._toFragment(path);
    //if any method
    if (method === 'ANY') {
      //determine pattern
      const pattern = fragment !== path ? path: '';
      //complete the expression
      const expression = `^[A-Z]+ ${fragment}${this.separator}*$`;
      //listen to expression
      const event = this._eventNameFromExpression(expression, pattern);
      //set the route (pattern should be in expressions ?)
      this.routes.set(event, { method, path });
      return event;
    }
    //determine the event key
    let event = `${method} ${path}`;
    //if the pattern is different
    if (fragment !== path) {
      //complete the expression
      const expression = `^${method} ${fragment}${this.separator}*$`;
      //listen to expression
      event = this._eventNameFromExpression(expression, event);
      //set the route (pattern should be in expressions ?)
      this.routes.set(event, { method, path });
      return event;
    }
    //set the route (pattern should be in expressions ?)
    this.routes.set(event, { method, path });
    return event;
  }
};