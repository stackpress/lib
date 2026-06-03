# Parsers

Adapters that write structured input into a `Nest` instance.

## Import

```ts
import {
  ArgString,
  QueryString,
  FormData,
  PathString,
  FileData,
  Nest
} from '@stackpress/lib';
```

## When To Use Them

Use these classes when the input format is already fixed and you want the parsed result to end up in a `Nest` store with the same path rules as manual `.set()` calls.

## API

### ArgString

```ts
const store = new Nest();
store.withArgs.set(['--name', 'Ada', '-v']);
```

`ArgString#set(argv, skip = 0)` supports:

- `--name value`
- `-xyz` boolean flags
- positional args
- nested keys such as `--filter[type] user`
- array appends such as `--tags[] api`

String input is tokenized first, then parsed as argv.

### QueryString

```ts
const store = new Nest();
store.withQuery.set('filter[type]=user&tags[]=one&tags[]=two');
```

`QueryString#set(...path, query)` parses query-string syntax, URL decoding, scalars, arrays, nested objects, and JSON-looking values when `JSON.parse` succeeds.

### FormData

```ts
const store = new Nest();
store.withFormData.set(multipartBody);
```

`FormData#set(...path, body)` parses multipart form bodies into nested fields. Uploaded files are wrapped in `FileData`.

### PathString

`PathString` extends `ReadonlyPath` with write helpers:

- `get(notation, separator = '.')`
- `has(notation, separator = '.')`
- `forEach(notation, callback, separator = '.')`
- `set(notation, value, separator = '.')`
- `delete(notation, separator = '.')`

### FileData

`FileData` is a lightweight file wrapper used by the form-data parser.

| Property | Type |
| --- | --- |
| `data` | `Buffer \| string` |
| `name` | `string` |
| `type` | `string` |

## Example

```ts
import { Nest } from '@stackpress/lib';

const store = new Nest();

store.withArgs.set('--name "Ada Lovelace" --roles[]=admin');
store.withQuery.set('page=1&filter[active]=true');
store.withPath.set('meta.loaded', true);

const active = store.get('filter', 'active');
const firstRole = store.path<string>('roles.0');
```

## Related

- [Nest](./Nest.md)
- [cookie](./Cookie.md)
