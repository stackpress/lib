//common
import type { 
  Route,
  RouterMap, 
  RouterAction,
  RequestOptions, 
  ResponseOptions,
  StatusResponse,
  EventMatch, 
  TaskItem 
} from '../types';
import Status from '../Status';
//data
import { isObject } from '../data/Nest';
//event
import type EventEmitter from '../emitter/EventEmitter';
import ExpressEmitter from '../emitter/ExpressEmitter';
//local
import Request from './Request'; 
import Response from './Response';

/**
 * Event driven routing system. Bring 
 * your own request and response types.
 */
export default class Router<R = unknown, S = unknown> 
  extends ExpressEmitter<RouterMap<R, S>> 
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
   * Calls all the callbacks of the given event passing the given arguments
   */
  public async emit(event: string, req: Request<R>, res: Response<S>) {
    const queue = this.tasks(event);
    
    //if there are no events found
    if (queue.size === 0) {
      //report a 404
      return Status.codes.NOT_FOUND;
    }

    return await queue.run(req, res, this);
  }

  /**
   * Emits an event and returns the response
   */
  public async resolve<T = unknown>(
    event: string, 
    request?: Request<R> | Record<string, any>, 
    response?: Response<S>
  ): Promise<Partial<StatusResponse<T>>>;
  
  /**
   * Routes to another route and returns the response
   */
  public async resolve<T = unknown>(
    method: string, 
    path: string, 
    request?: Request<R> | Record<string, any>, 
    response?: Response<S>
  ): Promise<Partial<StatusResponse<T>>>;
  
  /**
   * Emits an event and returns the response, or
   * Routes to another route and returns the response
   */
  public async resolve<T = unknown>(
    methodPath: string, 
    pathRequest?: string | Request<R> | Record<string, any>, 
    requestResponse?: Request<R> | Record<string, any> | Response<S>, 
    response?: Response<S>
  ) {
    //if 2nd argument is a string
    if (typeof pathRequest === 'string') {
      //then this is route related
      return this._resolveRoute<T>(
        methodPath, 
        pathRequest, 
        requestResponse, 
        response
      );
    }
    //otherwise this is event related
    return this._resolveEvent<T>(
      methodPath, 
      pathRequest, 
      requestResponse as Response<S>
    );
  }

  /**
   * Creates a new request
   */
  public request(init: Partial<RequestOptions<R>> = {}) {
    return new Request<R>(init);
  }

  /**
   * Creates a new response
   */
  public response(init: Partial<ResponseOptions<S>> = {}) {
    return new Response<S>(init);
  }
  
  /**
   * Returns a route
   */
  public route(
    method: string, 
    path: string, 
    action: RouterAction<R, S>, 
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
  public use(emitter: EventEmitter<RouterMap<R, S>>) {
    //check if the emitter is a router
    if (emitter instanceof Router) {
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
   * Emits an event and returns the response
   */
  protected async _resolveEvent<T = unknown>(
    event: string, 
    request?: Request<R> | Record<string, any>, 
    response?: Response<S>
  ) {
    if (!request) {
      request = this.request();
    } else if (isObject(request)) {
      const data = request as Record<string, any>;
      request = this.request({ data });
    }
    const req = request as Request<R>;
    const res = response || this.response();
    await this.emit(event, req, res);  
    return res.toStatusResponse<T>();
  }

  /**
   * Routes to another route and returns the response
   */
  protected async _resolveRoute<T = unknown>(
    method: string, 
    path: string, 
    request?: Request<R>|Record<string, any>,
    response?: Response<S>
  ) {
    const event = `${method.toUpperCase()} ${path}`;
    return await this._resolveEvent<T>(event, request, response);  
  }
  
  /**
   * Returns a task for the given event and task
   */
  protected _task(
    match: EventMatch, 
    task: TaskItem<[ Request<R>, Response<S>, Router<R, S> ]>
  ) {
    return async (
      req: Request<R>, 
      res: Response<S>, 
      ctx: Router<R, S>
    ) => {
      //set the current
      this._event = { 
        ...match, 
        ...task, 
        args: [ req, res, ctx ], 
        action: task.item 
      };
      //add the params to the request data
      req.data.set(match.data.params);
      //are there any args?
      if (match.data.args.length) {
        //add the args to the request data
        req.data.set(match.data.args);
      }
      //before hook
      if (typeof this._before === 'function' 
        && await this._before(this._event) === false
      ) {
        return false;
      }
      //if this is the same event, call the 
      //method, if the method returns false
      if (await task.item(req, res, this) === false) {
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
};