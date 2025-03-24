//modules
import { input } from '@inquirer/prompts';
//data
import { objectFromArgs } from '../data/Nest';
//local
import Router from './Router';

/**
 * Returns a list of control methods for the terminal
 */
export function terminalControls(brand = '') {
  const controls = {
    brand,
    
    /**
     * Outputs an colorful (red) log 
     */
    error(message: string, variables: string[] = []) {
      this.output(message, variables, '\x1b[31m%s\x1b[0m');
    },

    /**
     * Outputs an colorful (blue) log 
     */
    info(message: string, variables: string[] = []) {
      this.output(message, variables, '\x1b[34m%s\x1b[0m');
    },

    /**
     * Asks for input
     */
    async input(question: string, answer?: string) {
      return await input({
        message: question,
        default: answer,
        required: typeof answer !== 'string'
      });
    },

    /**
     * Outputs a log 
     */
    output(
      message: string, 
      variables: string[] = [],
      color?: string
    ) {
      //add variables to message
      for (const variable of variables) {
        message = message.replace('%s', variable);
      }
      //add brand to message
      message = `${this.brand} ${message}`;
      //colorize the message
      if (color) {
        console.log(color, message);
        return;
      }
      //or just output the message
      console.log(message);
    },

    /**
     * Outputs a success log 
     */
    success(message: string, variables: string[] = []) {
      this.output(message, variables, '\x1b[32m%s\x1b[0m');
    },

    /**
     * Outputs a system log 
     */
    system(message: string, variables: string[] = []) {
      this.output(message, variables, '\x1b[35m%s\x1b[0m');
    },

    /**
     * Outputs a warning log 
     */
    warning(message: string, variables: string[] = []) {
      this.output(message, variables, '\x1b[33m%s\x1b[0m');
    }
  };

  return controls;
}

export default class Terminal<R = unknown, S = unknown> 
  extends Router<R, S, Terminal<R, S>> 
{
  //the event command
  public readonly command: string;
  //input and output controls
  protected _controls: ReturnType<typeof terminalControls>;
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
   * Returns the terminal controls
   */
  public get controls() {
    return Object.freeze(this._controls);
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
    this._controls = terminalControls(brand);
  }

  /**
   * Retrieves the first value found from the given flag/s in cli
   */
  public expect<T>(flags: string[], defaults: T) {
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
  public run() {
    const req = this.request({ data: this.data });
    const res = this.response();
    return this.emit(this.command, req, res);
  }
}