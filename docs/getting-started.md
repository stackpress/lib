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

## Project Setup

1. Initialize

```bash
mkdir my-ingest-app
cd my-ingest-app
yarn init -y
```

2. Install dependencies:

```bash
yarn add @stackpress/ingest
```

## Development Mode

To run your application in development mode:

```bash
yarn dev
```

## Building for Production

To build your application for production:

```bash
yarn build
```


