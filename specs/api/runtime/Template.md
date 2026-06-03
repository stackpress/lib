# Template

Small string-template engine plus built-in helpers.

## Import

```ts
import {
  TemplateEngine,
  helpers,
  escapeRegex,
  render
} from '@stackpress/lib';
```

## When To Use It

Use this module for simple build-time or utility rendering when you want interpolation, small helper blocks, and nested-object lookup without bringing in a larger template engine.

## API

### Constructor

```ts
const engine = new TemplateEngine();
```

`TemplateOptions` supports:

- `container`
- `delimiters`
- `helpers`
- `resolve`

### TemplateEngine Properties

| Name | Notes |
| --- | --- |
| `block` | Compiled block-helper regexp. |
| `container` | Wrapper used when resolving values, default `%s`. |
| `delimiters` | Default `['{{', '}}']`. |
| `helpers` | Helper registry. |
| `method` | Compiled method-helper regexp. |
| `resolve` | Value resolver. |
| `variable` | Compiled variable regexp. |

### TemplateEngine Methods

| Method | Returns |
| --- | --- |
| `render(template, props = {})` | `string` |

### Module Exports

| Export | Notes |
| --- | --- |
| `escapeRegex(str)` | Escapes text for `RegExp` construction. |
| `render(template, props = {}, options = {})` | One-shot helper that creates a `TemplateEngine` and renders. |
| `helpers` | Built-in runtime helpers. |

### Built-In Helpers

| Helper | Purpose |
| --- | --- |
| `?` | Conditional truthy block. |
| `!` | Conditional falsy block. |
| `|` | First truthy option. |
| `@` | Loop over arrays or objects. |
| `=` | Arithmetic formula evaluation. |
| `.` | Clip a string to a max length. |
| `A` | Uppercase. |
| `a` | Lowercase. |

## Example

```ts
import { render } from '@stackpress/lib';

const output = render(
  'Hello {{name}} {{#?:active}}(active){{|}}(inactive){{/?:active}}',
  { name: 'Ada', active: true }
);
```

## Related

- [Nest](../data/Nest.md)
- [Types](../types/README.md)
