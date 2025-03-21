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
    //make regexp fragment from path
    const fragment = this._toFragment(path);
    //if any method
    if (method === '*') {
      //determine pattern
      const pattern = fragment !== path ? path: '';
      //complete the expression
      const expression = `^[A-Z]+ ${fragment}${this.separator}*$`;
      //listen to expression
      this._onExpression(expression, pattern, action, priority);
      //set the route (pattern should be in expressions ?)
      this.routes.set(`/${expression}/g`, { method, path });
      return this;
    }
    //make sure the method is uppercase
    method = method.toUpperCase();
    //determine the event key
    const event = `${method} ${path}`;
    //if the pattern is different
    if (fragment !== path) {
      //complete the expression
      const expression = `^${method} ${fragment}${this.separator}*$`;
      //listen to expression
      this._onExpression(expression, event, action, priority);
      //set the route (pattern should be in expressions ?)
      this.routes.set(`/${expression}/g`, { method, path });
      return this;
    }
    this._onLiteral(event, action, priority);
    //set the route (pattern should be in expressions ?)
    this.routes.set(event, { method, path });
    return this;
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
};