//data
import type Nest from '../Nest.js';

export default class ArgString {
  /**
   * The main nest
   */
  public nest: Nest;

  /**
   * Sets the nest 
   */
  constructor(nest: Nest) {
    this.nest = nest;
  }

  /**
   * Creates the name space given the space
   * and sets the value to that name space
   */
  set(argv: string|string[], skip = 0): Nest {
    if (typeof argv === 'string') {
      let buffer = '';
      let quote: string|null = null;
      const args: string[] = [];
      for (let i = 0; i < argv.length; i++) {
        const char = argv[i];
        //if we are in a quote
        if (quote) {
          //if we are closing the quote
          if (char === quote) {
            quote = null;
            continue;
          }
          //add to buffer
          buffer += char;
          continue;
        }
        //if we are not in a quote
        if (char === '"' || char === "'") {
          //set the quote
          quote = char;
          continue;
        }
        //if we are here, then no quotes
        if (char === ' ') {
          //push the buffer to args
          args.push(buffer);
          buffer = '';
          continue;
        }
        //add to buffer
        buffer += char;
      }
      //push the last buffer to args
      if (buffer) {
        args.push(buffer);
      }
      return this.set(args, skip);
    }
    // [ '-xyz', '--foo=bar', '--foo', 'bar' ]
    // [ '-xyz', '--foo[]', 'bar', '--foo[bar]', 'bar' ]
    // [ '--foo[bar]=a b c', '--foo[]=a b c', '--foo[bar][]=a b c' ]
    const args = argv.slice(skip);

    if (args.length < 1) {
      return this.nest;
    }

    //this will hold all the key/value pairs per string
    const query: string[] = [];
    //key tmp buffer
    let index = 0, key: string|number|null = null;
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      //if key is set
      if (key) {
        //take the arg as the value (no matter what it is)
        query.push(`${key}=${arg}`);
        //reset the key
        key = null;
        continue;
      }
      //if we are here, then no key yet...
      if (arg.startsWith('--')) {
        key = arg.substring(2);
        //key can be: '', 'x', 'xy'
        continue;
      }
      //if flag
      if (arg.startsWith('-')) {
        // [x, y, z]
        let flags = arg.substring(1);
        flags.split('').forEach(flag => query.push(`${flag}=true`));
        continue;
      }
      //if we are here, then no - nor -- nor name=value
      query.push(`${index++}=${arg}`);
    }

    if (query.length > 0) {
      this.nest.withQuery.set(query.join('&'));
    }
    
    return this.nest;
  }
}