# NodeFS

`FileSystem` implementation backed by `node:fs`.

## Import

```ts
import { NodeFS } from '@stackpress/lib';
```

## When To Use It

Use `NodeFS` when you want the library filesystem interface but your runtime is standard Node.js.

## API

### Constructor

```ts
const fs = new NodeFS();
```

You can inject a compatible `node:fs` object for testing.

### Properties

| Name | Type | Notes |
| --- | --- | --- |
| `fs` | `typeof import('node:fs')` | Underlying Node filesystem module. |

### Methods

| Method | Returns |
| --- | --- |
| `exists(path)` | `Promise<boolean>` |
| `readFile(path, encoding)` | `Promise<string>` |
| `realpath(path)` | `Promise<string>` |
| `stat(path)` | `Promise<FileStat>` |
| `writeFile(path, data)` | `Promise<void>` |
| `mkdir(path, options?)` | `Promise<void>` |
| `createReadStream(path)` | `FileStream` |
| `unlink(path)` | `Promise<void>` |

## Example

```ts
import { NodeFS } from '@stackpress/lib';

const fs = new NodeFS();

if (await fs.exists('./package.json')) {
  const json = await fs.readFile('./package.json', 'utf8');
  console.log(json.length);
}
```

## Related

- [FileLoader](./FileLoader.md)
- [Types](../types/README.md)
