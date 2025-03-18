//local
import type { NestedObject, Trace, ErrorResponse } from './types';
import Status from './Status';

/**
 * Exceptions are used to give more information
 * of an error that has occured
 */
export default class Exception extends Error {
  /**
   * General use expressive reasons
   */
  public static for(message: string, ...values: unknown[]) {
    values.forEach(function(value) {
      message = message.replace('%s', String(value));
    });

    return new this(message);
  }

  /**
   * Expressive error report
   */
  public static forErrors(errors: NestedObject<string>) {
    const exception = new this('Invalid Parameters');
    exception.withErrors(errors);
    return exception;
  }

  /**
   * Requires that the condition is true
   */
  public static require(
    condition: boolean, 
    message: string, 
    ...values: any[]
  ): void {
    if (!condition) {
      for (const value of values) {
        message = message.replace('%s', value);
      } 

      throw new this(message);
    }
  }

  /**
   * In house syncronous try catch. Async already has this 
   */
  public static try<T = unknown, E = Exception>(callback: () => T) {
    return {
      catch: (catcher: (error: E, kind: string) => T) => {
        try {
          return callback();
        } catch (error) {
          if (error instanceof Exception) {
            return catcher(error as E, error.type);
          } else if (error instanceof Error) {
            const e = Exception.upgrade(error);
            return catcher(e as E, e.type);
          } else if (typeof error === 'string') {
            const e = Exception.for(error);
            return catcher(e as E, e.type);
          }
          return catcher(error as E, 'unknown');
        }
      }
    };
  }

  /**
   * Upgrades an error to an exception
   */
  public static upgrade(error: Error, code = 500) {
    if (error instanceof Exception) {
      return error;
    }
    const exception = new this(error.message, code);
    exception.name = error.name;
    exception.stack = error.stack;
    return exception;
  }

  //error code
  protected _code: number;
  //error code
  protected _status: string;
  //error code
  protected _type: string;
  //itemized errors
  protected _errors: NestedObject<string> = {};
  //starting index
  protected _start = 0;
  //ending index
  protected _end = 0;

  /**
   * Returns the error code
   */
  public get code() {
    return this._code;
  }

  /**
   * Returns the ending char position of the error
   */
  public get end() {
    return this._end;
  }

  /**
   * Returns the error list
   */
  public get errors() {
    return { ...this._errors };
  }

  /**
   * Returns the starting char position of the error
   */
  public get start() {
    return this._start;
  }

  /**
   * Returns the error type
   */
  public get type() {
    return this._type;
  }

  /**
   * An exception should provide a message and a name
   */
  public constructor(message: string, code = 500) {
    super(message);
    this.name = this.constructor.name;
    this._type = this.constructor.name;
    this._code = code;
    this._status = Status.get(code)?.status || 'Unknown';
  }

  /**
   * Converts error to JSON
   */
  public toJSON() {
    return JSON.stringify(this.toResponse(), null, 2);
  }

  /**
   * Converts error to Response object
   */
  public toResponse(start = 0, end = 0) {
    const json: ErrorResponse = {
      code: this._code,
      status: this._status,
      error: this.message,
      start: this._start,
      end: this._end,
      stack: this.trace(start, end)
    };
    if (Object.keys(this._errors).length > 0) {
      json.errors = this._errors;
    }
    return json;
  }

  /**
   * Returns the stack trace
   */
  public trace(start = 0, end = 0) {
    if (typeof this.stack !== 'string') {
      return [];
    }
    const trace = this.stack
      .split('\n')
      //0 => Exception: Something good is 3
      //1 => at Function.for (/path/to/file.ts:2:438)
      .slice(start, end || this.stack.length)
      .map(line => line.trim())
      .map(trace => {
        //extract method, file, line, char
        //from string: at Function.for (/path/to/file.ts:1:2)
        //from string: at func1 (<anonymous>:2:3)
        //from string: at <anonymous>:1:5
        if (!trace.startsWith('at')) {
          return false;
        }
        let [ _, method, location ] = trace.split(' ');
        if (!location) {
          location = `(${method})`;
          method = '<none>';
        }
        const [ file, line, char ] = location
          .substring(1, location.length - 1)
          .split(':');

        return { 
          method, 
          file, 
          line: parseInt(line) || 0, 
          char: parseInt(char) || 0 
        };
      })
      .filter(Boolean);
    return trace as Trace[];
  }

  /**
   * Expressive way to set an error code
   */
  public withCode(code: number) {
    this._code = code;
    return this;
  }
  
  /**
   * Adds error list
   */
  public withErrors(errors: NestedObject<string>) {
    this._errors = errors;
    return this;
  }

  /**
   * Expressive way to set syntax position
   */
  public withPosition(start: number, end: number) {
    this._start = start;
    this._end = end;
    return this;
  }
}

