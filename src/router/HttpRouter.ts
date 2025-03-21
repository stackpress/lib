//common
import type { RouterAction } from '../types';
//local
import Router from './Router';

export default class HttpRouter<R = unknown, S = unknown> 
  extends Router<R, S> 
{
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
   * Route for TRACE method
   */
  public trace(path: string, action: RouterAction<R, S>, priority?: number) {
    return this.route('TRACE', path, action, priority);
  }
}