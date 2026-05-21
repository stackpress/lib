# Terminal

CLI-oriented router plus prompt and console helpers.

## Import

```ts
import { Terminal, control, input } from '@stackpress/lib';
```

For direct subpath imports, `control` and `input` are also available through `@stackpress/lib/terminal/*` because the package exports `./terminal/*`.

## When To Use It

Use `Terminal` when a command-line entrypoint should route commands through the same emitter and response patterns as the rest of the library. Use `control` and `input` when you only need prompting or formatted console output.

## Terminal API

### Constructor

```ts
const terminal = new Terminal(process.argv.slice(2), '[app]');
```

### Properties

| Name | Type | Notes |
| --- | --- | --- |
| `args` | `string[]` | CLI args after the command name. |
| `brand` | `string` | Prefix used by `control()`. |
| `command` | `string` | First CLI token. |
| `control` | frozen controls object | Output and prompt helpers. |
| `data` | `Record<string, any>` | Parsed CLI args produced by `objectFromArgs()`. |

### Methods

| Method | Returns | Notes |
| --- | --- | --- |
| `expect(flags, defaults)` | typed value | Returns the first truthy parsed flag value. |
| `run()` | `Promise<Partial<StatusResponse<T>>>` | Resolves the current command through the inherited router. |

## `control(brand = '')`

Returns a small console-helper object with:

- `brand`
- `error(message, variables?)`
- `info(message, variables?)`
- `input(question, answer?)`
- `output(message, variables?, color?)`
- `success(message, variables?)`
- `system(message, variables?)`
- `warning(message, variables?)`

The formatting helpers replace `%s` placeholders in order and prepend the brand when present.

## `input(config, context?)`

Prompt helper for interactive terminal input.

Important config fields from `TerminalInputConfig`:

- `default`
- `message`
- `pattern`
- `patternError`
- `prefill`
- `required`
- `theme`
- `transformer`
- `validate`

Named exports also include:

- `createAbortError(message?)`
- `formatValue(config, value, isFinal)`
- `renderPrompt(config, state)`
- `clearRender(output, lines)`
- `validateInput(config, value)`

## Example

```ts
import { Terminal } from '@stackpress/lib';

const terminal = new Terminal(['user:list', '--page', '2'], '[users]');

terminal.route('ANY', 'user:list', async (req, res) => {
  const page = req.data('page');
  res.results({ page });
});

const result = await terminal.run<{ page: number }>();
```

## Related

- [Router](../router/Router.md)
- [Nest](../data/Nest.md)
- [Types](../types/README.md)
