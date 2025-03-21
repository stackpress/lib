//common
import type { RouteAction } from '../types';
//local
import RouteEmitter from './RouteEmitter';

/**
 * Event driven routing system. Bring 
 * your own request and response types.
 */
export default class HttpEmitter<R = unknown, S = unknown> 
  extends RouteEmitter<R, S> 
{
  /**
   * Route for any method
   */
  public all(path: string, action: RouteAction<R, S>, priority?: number) {
    return this.route('*', path, action, priority);
  }

  /**
   * Route for CONNECT method
   */
  public connect(path: string, action: RouteAction<R, S>, priority?: number) {
    return this.route('CONNECT', path, action, priority);
  }

  /**
   * Route for DELETE method
   */
  public delete(path: string, action: RouteAction<R, S>, priority?: number) {
    return this.route('DELETE', path, action, priority);
  }

  /**
   * Route for GET method
   */
  public get(path: string, action: RouteAction<R, S>, priority?: number) {
    return this.route('GET', path, action, priority);
  }

  /**
   * Route for HEAD method
   */
  public head(path: string, action: RouteAction<R, S>, priority?: number) {
    return this.route('HEAD', path, action, priority);
  }

  /**
   * Route for OPTIONS method
   */
  public options(path: string, action: RouteAction<R, S>, priority?: number) {
    return this.route('OPTIONS', path, action, priority);
  }

  /**
   * Route for PATCH method
   */
  public patch(path: string, action: RouteAction<R, S>, priority?: number) {
    return this.route('PATCH', path, action, priority);
  }

  /**
   * Route for POST method
   */
  public post(path: string, action: RouteAction<R, S>, priority?: number) {
    return this.route('POST', path, action, priority);
  }

  /**
   * Route for PUT method
   */
  public put(path: string, action: RouteAction<R, S>, priority?: number) {
    return this.route('PUT', path, action, priority);
  }

  /**
   * Route for TRACE method
   */
  public trace(path: string, action: RouteAction<R, S>, priority?: number) {
    return this.route('TRACE', path, action, priority);
  }
};