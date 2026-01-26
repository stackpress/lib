//common
import type { 
  Body,
  Method, 
  CallableMap, 
  CallableNest ,
  CallableSession,
  RequestLoader,
  RequestOptions
} from '../types.js';
//data
import map from '../data/_map.js';
import cookie from '../data/cookie.js';
import { nest, isObject, objectFromQuery } from '../data/Nest.js';
//local
import { session } from './Session.js';

/**
 * Generic request wrapper that works with
 * IncomingMessage and WHATWG (Fetch) Request
 * 
 * - native body reader using loader()
 * - access to original request resource
 */
export default class Request<R = unknown> {
  //data controller
  public readonly data: CallableNest;
  //head controller
  public readonly headers: CallableMap<string, string|string[]>;
  //query controller
  public readonly query: CallableNest;
  //post controller
  public readonly post: CallableNest;
  //session controller
  public readonly session: CallableSession;
  //url controller
  public readonly url = new URL('http://unknownhost/');
  //request method
  public readonly method: Method;
  //payload body
  protected _body: Body|null;
  //body mimetype
  protected _mimetype: string;
  //whether if the body was loaded
  protected _loaded = false;
  //body loader
  protected _loader?: RequestLoader<R>;
  //original request resource
  protected _resource?: R;

  /**
   * Returns the body
   */
  public get body() {
    return typeof this._body !== 'undefined' ? this._body : null;
  }

  /**
   * Returns whether if the body was loaded
   */
  public get loaded() {
    return this._loaded;
  }

  /**
   * Returns the request body mimetype
   */
  public get mimetype() {
    return this._mimetype;
  }

  /**
   * Returns the original resource
   */
  public get resource() {
    return this._resource as R;
  }

  /**
   * Returns the type of body
   * ie. string|Buffer|Uint8Array|Record<string, unknown>|Array<unknown>
   */
  public get type() {
    if (this._body instanceof Buffer) {
      return 'buffer';
    } else if (this._body instanceof Uint8Array) {
      return 'uint8array';
    } else if (isObject(this._body)) {
      return 'object';
    } else if (Array.isArray(this._body)) {
      return 'array';
    } else if (typeof this._body === 'string') {
      return 'string';
    } else if (this._body === null) {
      return 'null';
    }
    return typeof this._body;
  }

  /**
   * Sets Loader
   */
  public set loader(loader: RequestLoader<R>) {
    this._loader = loader;
  }

  /**
   * Sets request defaults
   */
  public constructor(init: Partial<RequestOptions<R>> = {}) {
    this.data = nest();
    this.url = init.url instanceof URL ? init.url
      : typeof init.url === 'string' ? new URL(init.url)
      : new URL('http://unknownhost/');
    this.headers = map(
      init.headers instanceof Map
        ? Array.from(init.headers.entries())
        : isObject(init.headers)
        ? Object.entries(init.headers as Record<string, string|string[]>)
        : undefined
    );
    this.session = session(
      init.session instanceof Map
        ? Array.from(init.session.entries())
        : isObject(init.session)
        ? Object.entries(init.session as Record<string, string|string[]>)
        : this.headers.has('cookie')
        ? Object.entries(
          cookie.parse(this.headers.get('cookie') as string)
        ).filter(
          ([ _key, value ]) => typeof value !== 'undefined'
        ) as [string, string][]
        : undefined
    );
    this.query = nest(
      typeof init.query === 'string'
        ? objectFromQuery(init.query)
        : init.query instanceof Map
        ? Object.fromEntries(init.query)
        : isObject(init.query)
        ? init.query
        : this.url.search
        ? objectFromQuery(this.url.search)
        : Object.fromEntries(this.url.searchParams.entries())
    );
    this.post = nest(
      init.post instanceof Map
        ? Object.fromEntries(init.post)
        : isObject(init.post)
        ? init.post
        : undefined
    );

    this.method = init.method || 'GET';
    this._body = init.body || null;
    this._mimetype = init.mimetype || 'text/plain';
    this._resource = init.resource;
    
    if (this.query.size) {
      this.data.set(this.query.get());
    }
    if (this.post.size) {
      this.data.set(this.post.get());
    }
    if (init.data instanceof Map) {
      this.data.set(Object.fromEntries(init.data));
    } else if (isObject(init.data)) {
      this.data.set(init.data);
    }
  }

  /**
   * Loads the body
   */
  public async load() {
    //if it's already loaded, return
    if (this._loaded) {
      return this;
    }
    //if there is a loader is a function, use that
    if (typeof this._loader === 'function') {
      const data = await this._loader(this);
      if (data) {
        if (data.body) {
          this._body = data.body;
        }
        if (data.post instanceof Map) {
          const post = Object.fromEntries(Object.entries(data.post));
          this.post.set(post);
          this.data.set(post);
        } else if (isObject(data.post)) {
          this.post.set(data.post);
          this.data.set(data.post);
        }
      }
    }
    //flag as loaded
    this._loaded = true;
    return this;
  }
}

/**
 * Adds a default host to invalid URLs
 */
export function withUnknownHost(url: string) {
  if (url.indexOf('/') !== 0) {
    url = '/' + url;
  }

  return `http://unknownhost${url}`;
};