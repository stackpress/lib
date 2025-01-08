
<div align='center'>
    <h1>Types</h1>
    <a href='https://www.npmjs.com/package/@stackpress/types'><img  src='https://img.shields.io/npm/v/@stackpress/types.svg?style=flat' /></a>
    <a href='https://github.com/stackpress/types/blob/main/LICENSE'><img  src='https://img.shields.io/badge/license-Apache%202.0-blue.svg?style=flat' /></a>
    <a href='https://github.com/stackpress/types/commits/main/'><img src="https://img.shields.io/github/last-commit/stackpress/types" /></a>
    <a href='https://github.com/stackpress/types/actions'><img src='https://img.shields.io/github/actions/workflow/status/stackpress/types/test.yml' /></a>
    <a href="https://github.com/stackpress/types/blob/main/docs/contribute.md"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" /></a>
    <br/>
    <hr/>
</div>

> Common typescript types

The purpose of this project is likely to offer a set of reusable, well-defined TypeScript types that developers can use in their own projects. This can help standardize type definitions across different TypeScript projects and potentially save time for developers who would otherwise need to define these common types themselves.

## Install

```bash
$ npm install -D @stackpress/types
```

## How It Works

1. @stackpress/types provides a collection of commonly used TypeScript types that you can import and use in your projects.
2. Once imported, you can use these types to annotate your variables, function parameters, return types, etc.
3. TypeScript will now use these imported types to provide better type checking, autocompletion, and other IDE features.

## Benefits

- **Standardization**: By using @stackpress/types, you ensure consistent type definitions across your projects and team.
- **Time-saving**: Avoid reinventing the wheel by leveraging pre-defined, well-tested types.
- **Improved Code Quality**: Well-defined types lead to fewer runtime errors and more self-documenting code.
- **Enhanced Developer Experience**: Benefit from better autocompletion and type checking in your IDE.
- **Easier Maintenance**: Standardized types make it easier to understand and maintain code, especially in large projects.

## Usage

Here's a basic example of how to use types:

```typescript
import { Optional, Nullable } from '@stackpress/types';

// Using Optional type
function greet(name: Optional<string>): string {
    return `Hello, ${name ?? 'Guest'}!`;
}

// Using Nullable type
function processData(data: Nullable<string[]>): number {
    return data?.length ?? 0;
}

// Example
console.log(greet('Alice')); // Output: Hello, Alice!
console.log(greet()); // Output: Hello, Guest!

console.log(processData(['a', 'b', 'c'])); // Output: 3
console.log(processData(null)); // Output: 0
```


