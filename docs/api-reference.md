# API Reference

This document provides a detailed reference for the main types, classes, and utilities available in the @stackpress/types library.

## Nest and ReadonlyNest

### Nest<T>

A type for creating mutable nested objects with a consistent type `T` at any level of nesting.

```typescript
type Nest<T> = {
    [key: string]: T | Nest<T>;
};
```

### ReadonlyNest<T>

Similar to `Nest<T>`, but creates immutable nested structures.

```typescript
type ReadonlyNest<T> = {
    readonly [key: string]: T | ReadonlyNest<T>;
};
```
## EventEmitter

A class that implements the observer pattern for handling events.

### Methods

- `on(eventName: string, listener: Function): void` Adds a listener function to the specified event.

- `emit(eventName: string, ...args: any[]): void` Triggers all listener functions attached to the specified event.
- `removeListener(eventName: string, listener: Function): void` Removes a specific listener function from the specified event.

- `removeAllListeners(eventName?: string): void` Removes all listeners, or those of the specified event.

## Status

An enum representing the state of operations or processes.

```typescript
enum Status {
    Success,
    Failure,
    Pending
    // Add more status types as needed
}
```

## Exception

A class extending the built-in `Error` class for more structured error handling.

### Constructor

```typescript
constructor(message: string, code?: string | number, metadata?: any)
```

### Properties

- `message: string` The error message.

- `code?: string | number` An optional error code.

- `metadata?: any` Optional additional data related to the error.

### Methods

- `toString(): string` Returns a formatted string representation of the error.

## Reflection

A set of utility functions for runtime type checking and manipulation.

### Type Checking Function


- `isString(value: any): boolean` Checks if the value is a string.

- `isNumber(value: any): boolean` Checks if the value is a number.

- `isBoolean(value: any): boolean` Checks if the value is a boolean.

- `isObject(value: any): boolean` Checks if the value is an object.

- `isArray(value: any): boolean` Checks if the value is an array.

### Type Conversion Utilities

- `toString(value: any): string` Converts the value to a string.

- `toNumber(value: any): number` Converts the value to a number.

- `toBoolean(value: any): boolean` Converts the value to a boolean.

### Object Reflection

- `getPropertyNames(obj: object): string[]` Returns an array of property names for the given object.

- `hasProperty(obj: object, prop: string): boolean` Checks if the object has the specified property.