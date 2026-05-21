# cookie

Cookie parse and serialize helpers with the same API shape as the default export and named functions.

## Import

```ts
import { cookie } from '@stackpress/lib';

const { parse, serialize } = cookie;
```

If you prefer named access inside your own wrapper, read the methods from the default export. The package does not expose `parse` and `serialize` as separate root-level named exports.

## When To Use It

Use `cookie` when you need a small dependency-free parser and serializer for request cookies and response `Set-Cookie` values.

## API

### `parse(serial, options?)`

Parses a request cookie header into `Record<string, string | undefined>`.

```ts
const session = cookie.parse('sessionId=abc123; user=ada');
```

The optional `decode` function in `CookieParseOptions` overrides value decoding.

### `serialize(name, value, options?)`

Builds one `Set-Cookie` value.

```ts
const header = cookie.serialize('sessionId', 'abc123', {
  httpOnly: true,
  sameSite: 'strict',
  path: '/'
});
```

Supported options come from `CookieSerializeOptions` and include:

- `domain`
- `encode`
- `expires`
- `httpOnly`
- `maxAge`
- `partitioned`
- `path`
- `priority`
- `sameSite`
- `secure`

## Example

```ts
import { cookie } from '@stackpress/lib';

const cookies = cookie.parse('theme=dark; sessionId=abc123');

const setCookie = cookie.serialize('theme', 'light', {
  path: '/',
  maxAge: 3600
});
```

## Related

- [Session](../router/Session.md)
- [Types](../types/README.md)
