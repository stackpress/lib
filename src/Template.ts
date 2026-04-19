import type { TemplateHelper, TemplateOptions, TemplateResolver } from './types.js';
import Nest, { isObject } from './data/Nest.js';

/**
 * Tiny Engine for Tiny Templates (Template)
 * 
 * ex. "{{title}}" => ${data.title}
 * ex. "{{name.substring(0, 24)}}" => ${data.name.substring(0, 24)}
 * ex. "{{slug.toLowerCase()}}" => ${data.slug.toLowerCase()}
 * ex. "{{clip:title 24}}" => ${data.title.substring(0, 24)}
 * ex. "{{id}} {{title}}" => ${data.id} ${data.title}
 * ex. "{{#?:active}}Yes{{|}}No{{/?:active}}" => ${data.active ? 'Yes' : 'No'}
 * ex. "{{#!:active}}No{{|}}Yes{{/!:active}}" => ${!data.active ? 'No' : 'Yes'}
 * ex. "{{#@:list item i}}{{i}} - {{item}}{{/@:list}}" 
 *     => ${data.list.map((item, i) => `${i} - ${item}`).join('')}
 * 
 * NOTE: This is not a full-featured template engine and is only meant 
 * to be used for simple template rendering during build time. It is not 
 * meant to be used for complex scenarios or runtime rendering.
 * 
 * For example, rendering can fail if the following template was used:
 * "{{#?:active}}{{#?:active}}Yes{{|}}No{{/?:active}}{{/?:active}}"
 * Error: doesn't deal with the exact same nested helper type and name.
 * 
 * Just avoid scenarios like that and it should work fine...
 */
export class TemplateEngine {
  //block pattern
  public readonly block: RegExp;
  //method pattern
  public readonly method: RegExp;
  //variable pattern
  public readonly variable: RegExp;
  //container used for wrapping variables
  public readonly container: string;
  //delimeters
  public readonly delimiters: [ string, string ];
  //helper registry
  //ex. '?': ('list', props,'{{i}} - {{item}}', 'item i', engine) => ...
  public readonly helpers: Record<string, TemplateHelper>;
  //resolver
  public readonly resolve: TemplateResolver;

  /**
   * Sets up the template engine with the given options
   */
  public constructor(options: TemplateOptions = {}) {
    const { 
      container = '%s',
      helpers = {}, 
      delimiters = [ '{{', '}}' ],
      resolve
    } = options;
    this.container = container;
    this.helpers = helpers || {};
    this.delimiters = delimiters;
    this.resolve = resolve || (options => {
      const { path, nest } = options;
      const value = nest.withPath.get(path);
      return value !== undefined && value !== null
        ? this.container.replace('%s', String(value))
        : '';
    });
    const [ open, close ] = delimiters.map(escapeRegex);
    //GUIDE: /\{\{#(.*?):([^\s\}]+)\s*(.*?)\}\}(.*?)\{\{\/\1:\2\}\}/g
    //ex. {{#?:active}}Yes{{|}}No{{/?:active}}
    this.block = new RegExp(open 
      + '#(.*?):([^\\s'
      + close 
      +']+)\\s*(.*?)' 
      + close 
      + '(.*?)' 
      + open 
      + '\\/\\1:\\2' 
      + close, 
      'gs'
    );
    //GUIDE: /\{\{(.*?):([^\s\}]+)\s*(.*?)\}\}/g
    //ex. {{clip:title 24}}
    this.method = new RegExp(open 
      + '([^\\s\\}]+?):([^\\s\\}]+)\\s*(.*?)' 
      + close, 
      'gs'
    );
    //GUIDE: /\{\{(.*?)\}\}/g
    //ex. {{title}}
    this.variable = new RegExp(open + '(.*?)' + close, 'g');
  }

  /**
   * Uses the helpers to render the given template string with the 
   * provided properties
   */
  public render(template: string, props: Record<string, any> = {}) {
    const nest = new Nest(props);
    return template.replace(
      this.block, 
      (_, type, path, args, body) => type in this.helpers
        ? this.helpers[type]({ path, nest, body, args, engine: this })
        : ''
    )
    .replace(
      this.method, 
      (_, type, path, args) => type in this.helpers
        ? this.helpers[type]({ path, nest, body: '', args, engine: this })
        : ''
    )
    .replace(this.variable, (_, path) => this.resolve({ path, nest }));
  }
};

export function escapeRegex(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

export function render(
  template: string, 
  props: Record<string, any> = {},
  options: TemplateOptions = {}
) {
  options.helpers = options.helpers || helpers;
  const engine = new TemplateEngine(options);
  return engine.render(template, props);
};

//runtime helpers
export const helpers: Record<string, TemplateHelper> = {
  //if
  '?': ({ path, nest, body, engine }) => {
    const [ truthy, falsy = '' ] = body.split(engine.delimiters.join('|'));
    return nest.withPath.get(path) 
      ? engine.render(truthy.trim(), nest.get()) 
      : engine.render(falsy.trim(), nest.get());
  },
  //if not
  '!': ({ path, nest, body, engine }) => {
    const [ falsy, truthy = '' ] = body.split(engine.delimiters.join('|'));
    return !nest.withPath.get(path) 
      ? engine.render(falsy.trim(), nest.get()) 
      : engine.render(truthy.trim(), nest.get());
  },
  //either
  '|': ({ path, nest, args }) => {
    //ex. {{|:status user.active inactive}}
    const options = [ 
      path, 
      ...args.split(' ').filter(Boolean) 
    ].map(option => nest.withPath.has(option) ? nest.withPath.get(option)
        : !isNaN(Number(option)) ? Number(option)
        : option === 'true' ? true
        : option === 'false' ? false
        : option.startsWith("'") && option.endsWith("'") ? option.slice(1, -1)
        : option.startsWith('"') && option.endsWith('"') ? option.slice(1, -1)
        : option
    );
    for (const option of options) {
      //return the first truthy option as a string
      if (option) return String(option);
    }
    return '';
  },
  //for each
  '@': ({ path, nest, body, args, engine }) => {
    //ex. {{@:list item i}}{{i}} - {{item}}{{/@:list}}
    //ex. {{@:list item i <br />}}{{i}} - {{item}}{{/@:list}}
    const [ 
      itemName = '@this', 
      keyName = '@key', 
      ...join
    ] = args.split(' ');
    const list = nest.withPath.get(path);
    if (Array.isArray(list)) {
      return list.map(
        (item, key) => engine.render(body.trim(), {
          ...(isObject(item) ? item : {}),
          [keyName]: key, 
          [itemName]: item,
          '@index': key,
          '@first': key === 0,
          '@last': key === list.length - 1,
          '@odd': key % 2 === 1,
          '@even': key % 2 === 0
        })
      ).join(join.join(' '));
    } else if (isObject(list)) {
      return Object.entries(list as Record<string, any>).map(
        ([ key, item ], i) => engine.render(body.trim(), {
          ...(isObject(item) ? item : {}),
          [keyName]: key, 
          [itemName]: item,
          '@index': i,
          '@first': i === 0,
          '@last': i === Object.entries(list).length - 1,
          '@odd': i % 2 === 1,
          '@even': i % 2 === 0
        })
      ).join(join.join(' '));
    }
    return '';
  },
  //formula
  '=': ({ path, nest, body, engine }) => {
    const formula = engine.render(
      body, 
      nest.withPath.get(path) || nest.get()
    );
    //Only allow basic arithmetic characters.
    if (!/^[0-9+\-*/().\s]+$/.test(formula)) {
      return '';
    }
    try {
      const result = Function(`"use strict"; return (${formula});`)();
      return String(result);
    } catch (e) {
      return '';
    }
  },
  //clip
  '.': ({ path, nest, args }) => {
    let [ end = 25, ...append ] = args.split(' ');
    let value = nest.withPath.get<string>(path);
    if (typeof value === 'undefined' || value === null) {
      return '';
    }
    end = Number(end) || 0;
    value = String(value);
    if (!end || value.length <= end) return value;
    return value.substring(0, end) + append.join(' ');
  },
  //uppercase
  'A': ({ path, nest }) => {
    return String(nest.withPath.get(path)).toUpperCase();
  },
  //lowercase
  'a': ({ path, nest }) => {
    return String(nest.withPath.get(path)).toLowerCase();
  }
};

export default render;