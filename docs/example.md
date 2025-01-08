# Examples

This document provides examples of how to use various types from the @stackpress/types library in your TypeScript projects.

## Using Nest and EventEmitter

The `Nest` and `ReadonlyNest` types are useful for creating nested object structures with type safety.

For `Nest`
```typescript
import { Nest, ReadonlyNest } from '@stackpress/types';

// Using Nest
const userProfile: Nest<string | number> = {
    personal: {
        name: 'Alice Johnson',
        age: 28
    },
    professional: {
        company: 'Tech Innovations',
        position: 'Software Engineer',
        yearsOfExperience: 5
    }
};
```

For `ReadonlyNest`
```typescript
// Using ReadonlyNest
const appConfig: ReadonlyNest<string | number> = {
    server: {
        port: 3000,
        host: 'localhost'
    },
    database: {
        url: 'mongodb://localhost:27017',
        name: 'myapp'
    }
};

// Nest allows modifications
userProfile.personal.age = 29; // OK

// ReadonlyNest prevents modifications
// appConfig.server.port = 4000; // Error: Cannot assign to 'port' because it is a read-only property
```

## Using EventEmitter

The `EventEmitter` class provides a way to implement the observer pattern for handling events.

```typescript
import { EventEmitter } from '@stackpress/types';

const chatEmitter = new EventEmitter();

// Define event listeners
chatEmitter.on('message', (sender: string, content: string) => {
    console.log(`${sender}: ${content}`);
});
chatEmitter.on('userJoined', (username: string) => {
    console.log(`${username} has joined the chat.`);
});

// Emit events
chatEmitter.emit('userJoined', 'Bob');
chatEmitter.emit('message', 'Bob', 'Hello, everyone!');
```

## Using Status

The `Status` type can be used to represent the state of an operation or process.

```typescript
import { Status } from '@stackpress/types';

function processOrder(orderId: string): Status {
    // Simulating order processing
    if (Math.random() > 0.2) {
        return Status.Success;
    } else {
        return Status.Failure;
    }
}

const orderStatus = processOrder('12345');
console.log(`Order processing status: ${Status[orderStatus]}`);
```
