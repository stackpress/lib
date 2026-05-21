
//lib
import type { TypeOf } from '../types.js';
//data
import { objectFromArgs } from '../data/Nest.js';
//local
import Router from '../router/Router.js';
import control from './control.js';

export default class Terminal<R = unknown, S = unknown> 
  extends Router<R, S, Terminal<R, S>> 
{
  //the event command
  public readonly command: string;
  //input and output controls
  protected _control: ReturnType<typeof control>;
  //cached cli args
  protected _args: string[];
  //cached terminal params (parsed argv)
  protected _data?: Record<string, any>;

  /**
   * Returns the cli arguments
   */
  public get args() {
    return [ ...this._args ];
  }

  /**
   * Returns the terminal brand
   */
  public get brand() {
    return this._control.brand;
  }

  /**
   * Returns the terminal controls
   */
  public get control() {
    return Object.freeze(this._control);
  }

  /**
   * Returns the cli parameters
   */
  public get data() {
    if (!this._data) {
      this._data = objectFromArgs(this._args.join(' '));
    }
    return { ...this._data };
  }

  /**
   * Preloads the input and output settings
   */
  constructor(args: string[], brand = '') {
    super();
    //set event
    this.command = args[0] || '';
    //set cli args
    this._args = args.slice(1);
    //set controls
    this._control = control(brand);
  }

  /**
   * Retrieves the first value found from the given flag/s in cli
   */
  public expect<T>(flags: string[], defaults: TypeOf<T>) {
    for (const flag of flags) {
      if (this.data[flag]) {
        return this.data[flag] as T;
      }
    }
    return defaults;
  }

  /**
   * Runs the command
   */
  public run<T = unknown>() {
    const req = this.request({ data: this.data });
    const res = this.response();
    return this.resolve<T>(this.command, req, res);
  }
}