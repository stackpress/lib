//modules
import { input } from '@inquirer/prompts';
//common
import type { Hash } from '../types';
//local
import EventEmitter from './EventEmitter';

export default class EventTerminal extends EventEmitter<Record<string, [Hash]>> {
  // brand to prefix in all logs
  public static brand: string = '';

  /**
   * Outputs an colorful (red) log 
   */
  public static error(message: string, variables: string[] = []) {
    this.output(message, variables, '\x1b[31m%s\x1b[0m');
  }

  /**
   * Retrieves the first value found from the given flag/s in cli
   */
  public static expect<T>(args: string[], flags: string[], defaults: T) {
    const params = this.params(args);
    for (const flag of flags) {
      if (params[flag]) {
        return params[flag] as T;
      }
    }
    return defaults;
  }

  /**
   * Outputs an colorful (blue) log 
   */
  public static info(message: string, variables: string[] = []) {
    this.output(message, variables, '\x1b[34m%s\x1b[0m');
  }

  /**
   * Asks for input
   */
  public static async input(question: string, answer?: string) {
    return await input({
      message: question,
      default: answer,
      required: typeof answer !== 'string'
    });
  }

  /**
   * Outputs a log 
   */
  public static output(
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
  }

  /**
   * Creates the name space given the space
   * and sets the value to that name space
   */
  public static params(args: string[]) {
    const params: Record<string, any> = {};

    const format = (
      key: string|number, 
      value: any, 
      override?: boolean
    ) => {
      //parse value
      switch (true) {
        case typeof value !== 'string':
          break;
        case value === 'true':
          value = true;
          break;
        case value === 'false':
          value = false;
          break;
        case !isNaN(value) && !isNaN(parseFloat(value)):
          value = parseFloat(value);
          break;
        case !isNaN(value) && !isNaN(parseInt(value)):
          value = parseInt(value);
          break;
      }
  
      key = String(key);
  
      //if it's not set yet
      if (typeof params[key] === 'undefined' || override) {
        //just set it
        params[key] = value;
        return;
      }
  
      //it is set
      const current = params[key];
      //if it's not an array
      if (!Array.isArray(current)) {
        //make it into an array
        params[key] = [current, value];
        return;
      }
  
      //push the value
      current.push(value);
      params[key] = current;
      return;
    };

    let key, index = 0, i = 0, j = args.length;
    for (; i < j; i++) {
      const arg = args[i];
      const equalPosition = arg.indexOf('=');
      // --foo --bar=baz
      if (arg.substr(0, 2) === '--') { 
        // --foo --foo baz
        if (equalPosition === -1) {
          key = arg.substr(2);
          // --foo value
          if ((i + 1) < j && args[i + 1][0] !== '-') {
            format(key, args[i + 1]);
            i++;
            continue;
          }
          // --foo
          format(key, true);
          continue;
        }

        // --bar=baz
        format(
          arg.substr(2, equalPosition - 2), 
          arg.substr(equalPosition + 1)
        );
        continue;
      } 

      // -k=value -abc
      if (arg.substr(0, 1) === '-') {
        // -k=value
        if (arg.substr(2, 1) === '=') {
          format(arg.substr(1, 1), arg.substr(3));
          continue;
        }

        // -abc
        const chars = arg.substr(1);
        for (let k = 0; k < chars.length; k++) {
          key = chars[k];
          format(key, true);
        }

        // -a value1 -abc value2
        if ((i + 1) < j && args[i + 1][0] !== '-') {
          format(key as string, args[i + 1], true);
          i++;
        }

        continue;
      }

      if (equalPosition !== -1) {
        format(
          arg.substr(0, equalPosition), 
          arg.substr(equalPosition + 1)
        );
        continue;
      }

      if (arg.length) {
        // plain-arg
        format(index++, arg);
      }
    }
    
    return params;
  }

  /**
   * Outputs a success log 
   */
  public static success(message: string, variables: string[] = []) {
    this.output(message, variables, '\x1b[32m%s\x1b[0m');
  }

  /**
   * Outputs a system log 
   */
  public static system(message: string, variables: string[] = []) {
    this.output(message, variables, '\x1b[35m%s\x1b[0m');
  }

  /**
   * Outputs a warning log 
   */
  public static warning(message: string, variables: string[] = []) {
    this.output(message, variables, '\x1b[33m%s\x1b[0m');
  }

  //current working directory
  public readonly cwd: string;
  //access to static methods from the instance
  public readonly terminal: typeof EventTerminal;
  //the event command
  public readonly command: string;
  //cached cli args
  protected _args: string[];
  //cached terminal params (parsed argv)
  protected _params?: Record<string, any>;

  /**
   * Returns the cli arguments
   */
  public get args() {
    return [ ...this._args ];
  }

  /**
   * Returns the cli parameters
   */
  public get params() {
    if (!this._params) {
      this._params = this.terminal.params(this._args);
    }
    return { ...this._params };
  }

  /**
   * Preloads the input and output settings
   */
  constructor(args: string[], cwd = process.cwd()) {
    super();
    //set current working directory
    this.cwd = cwd;
    this.terminal = this.constructor as typeof EventTerminal;
    //set event
    this.command = args[0] || '';
    //set cli args
    this._args = args.slice(1);
  }

  /**
   * Retrieves the first value found from the given flag/s in cli
   */
  public expect<T>(flags: string[], defaults: T) {
    for (const flag of flags) {
      if (this.params[flag]) {
        return this.params[flag] as T;
      }
    }
    return defaults;
  }

  /**
   * Runs the command
   */
  public run() {
    return this.emit(this.command, this.params);
  }
}