import type { Method, Route, RouterMap, RouterAction } from './types';

import EventEmitter from './EventEmitter';

/**
 * Event driven routing system. Bring 
 * your own request and response types.
 */
export default class Router<R, S> extends EventEmitter<RouterMap<R, S>> {
  //map of event names to routes 
  //^${method}\\s${pattern}/*$ -> { method, path }
  public readonly routes = new Map<string, Route>;

  /**
   * Route for any method
   */
  public all(path: string, action: RouterAction<R, S>, priority?: number) {
    return this.route('[A-Z]+', path, action, priority);
  }

  /**
   * Route for CONNECT method
   */
  public connect(path: string, action: RouterAction<R, S>, priority?: number) {
    return this.route('CONNECT', path, action, priority);
  }

  /**
   * Route for DELETE method
   */
  public delete(path: string, action: RouterAction<R, S>, priority?: number) {
    return this.route('DELETE', path, action, priority);
  }

  /**
   * Route for GET method
   */
  public get(path: string, action: RouterAction<R, S>, priority?: number) {
    return this.route('GET', path, action, priority);
  }

  /**
   * Route for HEAD method
   */
  public head(path: string, action: RouterAction<R, S>, priority?: number) {
    return this.route('HEAD', path, action, priority);
  }

  /**
   * Route for OPTIONS method
   */
  public options(path: string, action: RouterAction<R, S>, priority?: number) {
    return this.route('OPTIONS', path, action, priority);
  }

  /**
   * Route for PATCH method
   */
  public patch(path: string, action: RouterAction<R, S>, priority?: number) {
    return this.route('PATCH', path, action, priority);
  }

  /**
   * Route for POST method
   */
  public post(path: string, action: RouterAction<R, S>, priority?: number) {
    return this.route('POST', path, action, priority);
  }

  /**
   * Route for PUT method
   */
  public put(path: string, action: RouterAction<R, S>, priority?: number) {
    return this.route('PUT', path, action, priority);
  }

  /**
   * Returns a route
   */
  public route(
    method: Method|'[A-Z]+', 
    path: string, 
    action: RouterAction<R, S>, 
    priority?: number
  ) {
    //convert path to a regex pattern
    const pattern = path
      //replace the :variable-_name01
      .replace(/(\:[a-zA-Z0-9\-_]+)/g, '*')
      //replace the stars
      //* -> ([^/]+)
      .replaceAll('*', '([^/]+)')
      //** -> ([^/]+)([^/]+) -> (.*)
      .replaceAll('([^/]+)([^/]+)', '(.*)');
    //now form the event pattern
    const event = new RegExp(`^${method}\\s${pattern}/*$`, 'ig');
    this.routes.set(event.toString(), {
      method: method === '[A-Z]+' ? 'ALL' : method,
      path: path
    });
    //add to tasks
    this.on(event, action, priority);
    return this;
  }

  /**
   * Route for TRACE method
   */
  public trace(path: string, action: RouterAction<R, S>, priority?: number) {
    return this.route('TRACE', path, action, priority);
  }
};