# 📖 Stackpress Library

[![NPM Package](https://img.shields.io/npm/v/@stackpress/lib.svg?style=flat)](https://www.npmjs.com/package/@stackpress/lib)
[![Tests Status](https://img.shields.io/github/actions/workflow/status/stackpress/lib/test.yml)](https://github.com/stackpress/lib/actions)
[![Coverage Status](https://coveralls.io/repos/github/stackpress/lib/badge.svg?branch=main)](https://coveralls.io/github/stackpress/lib?branch=main)
[![Commits](https://img.shields.io/github/last-commit/stackpress/lib)](https://github.com/stackpress/lib/commits/main/)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg?style=flat)](https://github.com/stackpress/lib/blob/main/LICENSE)

Comprehensive API documentation for the Stackpress Library - a shared library used across Stackpress projects that standardizes type definitions and provides common utilities for developers.

## Installation

```bash
npm install @stackpress/lib
```

## API Reference

### [Data Structures](./docs/Structures.md)
Data structures in programming are specialized formats for organizing, processing, storing, and retrieving data within a computer's memory.  

**Key Features:**
- Type-safe nested object manipulation
- Path-based data access with dot notation
- Built-in parsers for query strings, form data, and arguments
- Chainable API for fluent data operations

### [Events](./docs/Events.md)
Event driven designed to support event chain reactions.

**Key Features:**
- Priority-based event listeners
- Type-safe event maps with TypeScript generics
- Before/after hooks for event execution
- Task queue management for event handling

### [Exception](./docs/Exception.md)
Enhanced error handling with expressive error reporting and stack trace support. Provides better error information than standard JavaScript errors.

**Key Features:**
- Template-based error messages
- Validation error aggregation
- Enhanced stack trace parsing
- HTTP status code integration

### [Queues](./docs/Queues.md)
Priority-based queue implementations for managing items and tasks with FIFO ordering. Includes both generic item queues and specialized task queues.

**Key Features:**
- Priority-based ordering (higher numbers execute first)
- FIFO ordering within same priority levels
- Task execution with before/after hooks
- Chainable API for queue operations

### [Routing](./docs/Routing.md)
Event-driven routing system with generic Request and Response wrappers that work across different platforms (HTTP, terminal, web sockets).

**Key Features:**
- Cross-platform request/response handling
- Parameter extraction from routes
- Event-driven architecture
- Generic type support for different mediums

### [File System](./docs/Systems.md)
Cross-platform file loading utilities for locating, loading, and importing files throughout your project and node_modules.

**Key Features:**
- Cross-platform path resolution
- Node modules discovery
- Dynamic import support
- Project root (@/) path shortcuts

## [Type Safety](./docs/Types.md)

The library is built with TypeScript and provides comprehensive type definitions. All components support generic types for enhanced type safety:

```typescript
// Type-safe nested data
type ConfigMap = {
  database: { host: string; port: number };
  cache: { ttl: number };
};
const config = new Nest<ConfigMap>();

// Type-safe event handling
type EventMap = {
  'user-login': [string, Date];
  'data-update': [object];
};
const emitter = new EventEmitter<EventMap>();

// Type-safe queue operations
const queue = new TaskQueue<[number, string]>();
```

## Browser Compatibility

Most components work in both Node.js and browser environments:

- ✅ **Nest** - Full browser support
- ✅ **EventEmitter** - Full browser support  
- ✅ **Exception** - Full browser support
- ✅ **Queue** - Full browser support
- ⚠️ **FileLoader/NodeFS** - Node.js only
