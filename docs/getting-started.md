# Getting Started with Types

## Installation
```bash
npm install @stackpress/types
```

## Quick Start
To start using `types` in  your TypeScript project, follow these steps:

1. Import the types you need:

```javascript
import { Nest, ReadonlyNest, EventEmitter } from '@stackpress;
```
2. Use the imported types in your code:

```javascript
// Using Nest
const data: Nest<string> = {
    user: {
        name: 'John Doe',
        email: 'john@example.com'
    }
};

// Using ReadonlyNest
const config: ReadonlyNest<string> = {
    api: {
        url: 'https://api.example.com',
        version: 'v1'
    }
};

// Using EventEmitter
const emitter = new EventEmitter();
emitter.on('message', (data: string) => {
    console.log('Received message:', data);
});
emitter.emit('message', 'Hello, world!');
```
3. Take advantage of TypeScript type checking:

```javascript
// TypeScript will catch type errors
data.user.age == 30; // Error: Property 'age' does not exist on type '{ name: string; email: string; }'
// ReadonlyNest prevents modifications

config.api.url = 'https://newapi.example.com'; // Error: Cannot assign to 'url' because it is a read-only property
```

For more detailed information on available types and their usage, refer to the API documentation.


This quick start guide provides a basic introduction to using the @stackpress/types package. It covers:

1. How to import types from the package
2. Examples of using some common types like `Nest`, `ReadonlyNest`, and `EventEmitter`
3. Demonstrates the benefits of TypeScript's type checking with these types
