import { CallSite } from './types';

export default class Reflection {
  public static stack() {
    //NOTE: relies on v8 stack trace
    //if not v8 engine, then return empty array
    if (typeof Error.stackTraceLimit === 'undefined'
      || typeof Error.prepareStackTrace === 'undefined'
    ) {
      return [];
    }
    //remember the old prepare stack trace
    const trace = Error.prepareStackTrace;
    //override the prepare stack trace
    Error.prepareStackTrace = (_, stack)  => stack;
    //now get the stack
    const stack = new Error().stack;
    //restore the prepare stack trace
    Error.prepareStackTrace = trace;
    //if there is a stack to speak of
    if (stack !== null && typeof stack === 'object') {
      return (stack as CallSite[]).map(
        trace => new Reflection(trace)
      ).slice(1);
    }
    return [];
  };

  //the CallSite resource
  public readonly trace: CallSite;

  /**
   * If this function was defined in a script 
   * returns the current column number
   */
  public get column() {
    return this.trace.getColumnNumber();
  }

  /**
   * If this function was created using a call to eval 
   * returns a string representing the location where 
   * eval was called
   */
  public get evalOrigin() {
    return this.trace.getEvalOrigin();
  }

  /**
   * If this function was defined in a 
   * script returns the name of the script
   */
  public get file() {
    return this.trace.getFileName();
  }

  /**
   * Returns the current function
   */
  public get func() {
    return this.trace.getFunction();
  }

  /**
   * Returns the name of the current function, 
   * typically its name property. If a name 
   * property is not available an attempt is 
   * made to infer a name from the function’s 
   * context.
   */
  public get funcName() {
    return this.trace.getFunctionName();
  }

  /**
   * If this function was defined in a script 
   * returns the current line number
   */
  public get line() {
    return this.trace.getLineNumber();
  }

  /**
   * Returns the name of the property of this or one 
   * of its prototypes that holds the current function
   */
  public get method() {
    return this.trace.getMethodName();
  }

  /**
   * Returns the index of the promise element that was 
   * followed in Promise.all() or Promise.any() for 
   * async stack traces, or null if the CallSite is not 
   * an async Promise.all() or Promise.any() call.
   */
  public get promiseIndex() {
    return this.trace.getPromiseIndex();
  }

  /**
   * Returns the value of this
   */
  public get self() {
    return this.trace.getThis();
  }

  /**
   * Returns the type of this as a string. This is the name of the 
   * function stored in the constructor field of this, if available, 
   * otherwise the object’s [[Class]] internal property.
   */
  public get type() {
    return this.trace.getTypeName();
  }

  /**
   * Sets up the tracer
   */
  constructor(trace: CallSite) {
    this.trace = trace;
  }

  /**
   * Is this an async call?
   * i.e. await, Promise.all(), or Promise.any()
   */
  public isAsync() {
    return this.trace.isAsync();
  }

  /**
   * Is this a constructor call?
   */
  public isConstructor() {
    return this.trace.isConstructor();
  }

  /**
   * Does this call take place in 
   * code defined by a call to eval?
   */
  public isEval() {
    return this.trace.isEval();
  }

  /**
   * Is this call in native V8 code?
   */
  public isNative() {
    return this.trace.isNative();
  }

  /**
   * is this an async call to Promise.all()?
   */
  public isPromiseAll() {
    return this.trace.isPromiseAll();
  }

  /**
   * Is this a top-level invocation, that 
   * is, is this the global object?
   */
  public isTopLevel() {
    return this.trace.isToplevel();
  }

  /**
   * Returns an object representation of this reflection
   */
  public toObject() {
    return {
      column: this.column,
      evalOrigin: this.evalOrigin,
      file: this.file,
      func: this.func,
      funcName: this.funcName,
      line: this.line,
      method: this.method,
      promiseIndex: this.promiseIndex,
      self: this.self,
      type: this.type,
      isAsync: this.isAsync(),
      isConstructor: this.isConstructor(),
      isEval: this.isEval(),
      isNative: this.isNative(),
      isPromiseAll: this.isPromiseAll(),
      isTopLevel: this.isTopLevel()
    };
  }
}