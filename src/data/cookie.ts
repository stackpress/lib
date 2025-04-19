/**
 * This is a port from the `cookie` package. The original code 
 * does not provide an ESM nor a dual build. Note that `cookie-es` 
 * provides ESM but not CJS.
 */

//common
import type { 
  CookieParseOptions,
  CookieSerializeOptions
} from '../types.js';

/**
 * Parse the given cookie header string into an object
 * The object has the various cookies as keys(names) => values
 */
export function parse(
  serial: string,
  options?: CookieParseOptions,
): Record<string, string | undefined> {
  const results: Record<string, string | undefined> = new NullObject();
  // RFC 6265 sec 4.1.1, RFC 2616 2.2 defines a cookie 
  //name consists of one char minimum, plus '='.
  if (serial.length < 2) return results;

  const dec = options?.decode || decode;
  let index = 0;

  do {
    const eq = serial.indexOf('=', index);
    if (eq === -1) break; // No more cookie pairs.

    const colon = serial.indexOf(';', index);
    const end = colon === -1 ? serial.length : colon;

    if (eq > end) {
      // backtrack on prior semicolon
      index = serial.lastIndexOf(';', eq - 1) + 1;
      continue;
    }

    const keyStart = startIndex(serial, index, eq);
    const keyEnd = endIndex(serial, eq, keyStart);
    const key = serial.slice(keyStart, keyEnd);

    // only assign once
    if (results[key] === undefined) {
      let valStartIdx = startIndex(serial, eq + 1, end);
      let valEndIdx = endIndex(serial, end, valStartIdx);

      const value = dec(serial.slice(valStartIdx, valEndIdx));
      results[key] = value;
    }

    index = end + 1;
  } while (index < serial.length);

  return results;
};

/**
 * Serialize a name value pair into a cookie string suitable for
 * http headers. An optional options object specifies cookie parameters.
 *
 * serialize('foo', 'bar', { httpOnly: true }) => 'foo=bar; httpOnly'
 */
export function serialize(
  name: string,
  val: string,
  options?: CookieSerializeOptions,
): string {
  const encode = options?.encode || encodeURIComponent;

  if (!cookieNameRegExp.test(name)) {
    throw new TypeError(`argument name is invalid: ${name}`);
  }

  const value = encode(val);

  if (!cookieValueRegExp.test(value)) {
    throw new TypeError(`argument val is invalid: ${val}`);
  }

  let serial = name + '=' + value;
  if (!options) return serial;

  if (options.maxAge !== undefined) {
    if (!Number.isInteger(options.maxAge)) {
      throw new TypeError(`option maxAge is invalid: ${options.maxAge}`);
    }
    serial += '; Max-Age=' + options.maxAge;
  }

  if (options.domain) {
    if (!domainValueRegExp.test(options.domain)) {
      throw new TypeError(`option domain is invalid: ${options.domain}`);
    }
    serial += '; Domain=' + options.domain;
  }

  if (options.path) {
    if (!pathValueRegExp.test(options.path)) {
      throw new TypeError(`option path is invalid: ${options.path}`);
    }
    serial += '; Path=' + options.path;
  }

  if (options.expires) {
    if (
      !isDate(options.expires) ||
      !Number.isFinite(options.expires.valueOf())
    ) {
      throw new TypeError(`option expires is invalid: ${options.expires}`);
    }
    serial += '; Expires=' + options.expires.toUTCString();
  }

  if (options.httpOnly) {
    serial += '; HttpOnly';
  }

  if (options.secure) {
    serial += '; Secure';
  }

  if (options.partitioned) {
    serial += '; Partitioned';
  }

  if (options.priority) {
    const priority =
      typeof options.priority === 'string'
        ? options.priority.toLowerCase()
        : undefined;
    switch (priority) {
      case 'low':
        serial += '; Priority=Low';
        break;
      case 'medium':
        serial += '; Priority=Medium';
        break;
      case 'high':
        serial += '; Priority=High';
        break;
      default:
        throw new TypeError(`option priority is invalid: ${options.priority}`);
    }
  }

  if (options.sameSite) {
    const sameSite =
      typeof options.sameSite === 'string'
        ? options.sameSite.toLowerCase()
        : options.sameSite;
    switch (sameSite) {
      case true:
      case 'strict':
        serial += '; SameSite=Strict';
        break;
      case 'lax':
        serial += '; SameSite=Lax';
        break;
      case 'none':
        serial += '; SameSite=None';
        break;
      default:
        throw new TypeError(`option sameSite is invalid: ${options.sameSite}`);
    }
  }

  return serial;
};

const cookie = { parse, serialize };
export default cookie;

//RegExp to match cookie-name in RFC 6265 sec 4.1.1
//This refers out to the obsoleted definition of token in RFC 2616 
//sec 2.2 which has been replaced by the token definition in RFC 7230 
//appendix B.
const cookieNameRegExp = /^[\u0021-\u003A\u003C\u003E-\u007E]+$/;

//RegExp to match cookie-value in RFC 6265 sec 4.1.1
const cookieValueRegExp = /^[\u0021-\u003A\u003C-\u007E]*$/;

//RegExp to match domain-value in RFC 6265 sec 4.1.1
const domainValueRegExp = (
  /^([.]?[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)([.][a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/i
);

//RegExp to match path-value in RFC 6265 sec 4.1.1
const pathValueRegExp = /^[\u0020-\u003A\u003D-\u007E]*$/;

const __toString = Object.prototype.toString;

const NullObject = /* @__PURE__ */ (() => {
  const C = function () {};
  C.prototype = Object.create(null);
  return C;
})() as unknown as { new (): any };

function startIndex(serial: string, index: number, max: number) {
  do {
    const code = serial.charCodeAt(index);
    if (code !== 0x20 /*   */ && code !== 0x09 /* \t */) return index;
  } while (++index < max);
  return max;
}

function endIndex(serial: string, index: number, min: number) {
  while (index > min) {
    const code = serial.charCodeAt(--index);
    if (code !== 0x20 /*   */ && code !== 0x09 /* \t */) return index + 1;
  }
  return min;
}

/**
 * URL-decode string value. Optimized to skip native call when no %.
 */
function decode(str: string): string {
  if (str.indexOf('%') === -1) return str;

  try {
    return decodeURIComponent(str);
  } catch (e) {
    return str;
  }
}

/**
 * Determine if value is a Date.
 */
function isDate(val: any): val is Date {
  return __toString.call(val) === '[object Date]';
}