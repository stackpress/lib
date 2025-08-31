# Data Structures

Specialized formats for organizing, processing, storing, and retrieving data within a computer's memory. Data structures define the relationships between data elements and the operations that can be performed on them, with type-safe nested object manipulation, path-based data access with dot notation, built-in parsers for query strings, form data, and arguments, and chainable API for fluent data operations.

The choice of data structure significantly impacts the efficiency and performance of algorithms and overall program execution. Stackpress provides enhanced data structures that extend native JavaScript collections with additional functionality for common development patterns.

## 1. Nest

Hierarchical data management utilities for nested objects and arrays. The Nest class provides type-safe access to deeply nested data structures with convenient methods for manipulation, iteration, and serialization.

```typescript
import { nest, Nest, ReadonlyNest } from '@stackpress/lib';

type NestMap = {
  database: Record<string, { host: string, port: number}>
};

const callable = nest<NestMap>({
  database: {
    postgres: {
      host: 'localhost',
      port: 5432
    }
  }
});

const config = new Nest<NestMap>({
  database: {
    postgres: {
      host: 'localhost',
      port: 5432
    }
  }
});

const readonly = new ReadonlyNest<NestMap>({
  database: {
    postgres: {
      host: 'localhost',
      port: 5432
    }
  }
});
```

### 1.1. Properties

The following properties are available when instantiating a Nest.

| Property | Type | Description |
|----------|------|-------------|
| `data` | `M` | Raw nested data structure |
| `size` | `number` | Total number of top-level keys |
| `withArgs` | `ArgString` | Parser for terminal args |
| `withFormData` | `FormData` | Parser for multipart/form-data |
| `withPath` | `PathString` | Parser for path notations |
| `withQuery` | `QueryString` | Parser for query string |

### 1.2. Retrieving Data

The following example shows how to retrieve data from a nest using type-safe path navigation.

```typescript
config.get('database', 'postgres', 'port'); //--> 5432
config.get<number>('database', 'postgres', 'port'); //--> 5432
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `...path` | `Key[]` | A path of object keys leading to the value |

**Returns**

The value given the object key path. If you don't provide a generic, will follow the type map provided.

### 1.3. Setting Data

The following example shows how to add or update data in a nest with chainable operations.

```typescript
config.set('database', 'postgres', 'port', 5432); //--> Nest
config.set({ foo: 'bar', baz: 'qux' }); //--> Nest
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `...path` | `any[]` | A path of object keys leading to the value to be set, with the last argument being the value |

**Returns**

The nest object to allow chainability.

### 1.4. Checking For Data

The following example shows how to check if an object key path has been set.

```typescript
config.has('database', 'postgres', 'port'); //--> true
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `...path` | `Key[]` | A path of object keys leading to the value to check |

**Returns**

`true` if the object key path is set, `false` otherwise.

### 1.5. Deleting Data

The following example shows how to delete a value from the nested structure.

```typescript
config.delete('database', 'postgres', 'port'); //--> Nest
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `...path` | `Key[]` | A path of object keys leading to the value to be deleted |

**Returns**

The nest object to allow chainability.

### 1.6. Purging Data

The following example shows how to purge all data from the nest.

```typescript
config.clear(); //--> Nest
```

**Returns**

The nest object to allow chainability.

### 1.7. Getting the Top-Level Keys

The following example shows how to get the top-level keys in a nest.

```typescript
config.keys(); //--> [ 'database' ]
```

**Returns**

An array of object key strings.

### 1.8. Getting the Top-Level Values

The following example shows how to get the top-level values in a nest.

```typescript
config.values(); //--> [ { postgres: { host: 'localhost', port: 5432 } } ]
```

**Returns**

An array of arbitrary values.

### 1.9. Getting the Top-Level Entries

The following example shows how to get the top-level entries in a nest as key-value pairs.

```typescript
config.entries(); //--> [ ['database', { postgres: { host: 'localhost', port: 5432 } }] ]
```

**Returns**

An array of key-value pairs.

### 1.10. Retrieving Data Using a Key Path

The following example shows how to retrieve data from a nest using a dot-separated key path.

```typescript
config.path('database.postgres.port'); //--> 5432
config.path<number>('database.postgres.port'); //--> 5432
config.path('database.mysql.port', 3306); //--> 3306
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `path` | `string` | An object key path separated by dots leading to the value |
| `defaults` | `TypeOf<T>` | Default value to return if path doesn't exist |

**Returns**

The value given the object key path. If you don't provide a generic, will follow the type map provided.

### 1.11. Iterating Over Data

The following example shows how to iterate over data at a specific path with async callback support.

```typescript
await config.forEach('database', (value, key) => {
  console.log(key, value);
  return true; // continue iteration
});
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `...path` | `any[]` | A path of object keys leading to the data to iterate, with the last argument being the callback function |

**Returns**

A promise that resolves to `true` if all iterations completed, `false` if stopped early.

### 1.12. Converting a Nest to a JSON

The following example shows how to generate a JSON string from a nest with formatting options.

```typescript
config.toString(); 
//--> { "database": { "postgres": { "host": "localhost", "port": 5432 } } }
config.toString(false); //--> {"database":{"postgres":{"host":"localhost","port":5432}}}
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `expand` | `boolean` | Whether to format the JSON with indentation (default: true) |
| `...path` | `Key[]` | Optional path to convert only a subset of the data |

**Returns**

A JSON string derived from the nest.

### 1.13. Callable Nest

Creates a callable Nest instance that can be invoked as a function to get nested values with functional programming patterns.

```typescript
import { nest } from '@stackpress/lib';

const config = nest<NestMap>({
  database: {
    postgres: {
      host: 'localhost',
      port: 5432
    }
  }
});

config('database', 'postgres', 'host'); // 'localhost'
config<string>('database', 'postgres', 'host'); // 'localhost'
```

## 2. Maps

Creates a callable Map instance that can be invoked as a function to get values. The enhanced Map provides additional functionality while maintaining compatibility with the native Map interface.

```typescript
import { map } from '@stackpress/lib';

const userMap = map<string, User>([
  ['john', { name: 'John', age: 30 }],
  ['jane', { name: 'Jane', age: 25 }]
]);

// Use as function to get values
const john = userMap('john'); // { name: 'John', age: 30 }

// Use as Map
userMap.set('bob', { name: 'Bob', age: 35 });
console.log(userMap.size); // 3
```

### 2.1. Properties

The following properties are available on a callable map.

| Property | Type | Description |
|----------|------|-------------|
| `size` | `number` | Number of key-value pairs in the map |

### 2.2. Direct Invocation

The following example shows how to use the map as a function for convenient value access.

```typescript
const value = myMap('key'); // Equivalent to myMap.get('key')
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `key` | `K` | The key to retrieve the value for |

**Returns**

The value associated with the key, or `undefined` if not found.

### 2.3. Setting Values

The following example shows how to set key-value pairs with method chaining support.

```typescript
myMap.set('newKey', 'newValue');
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `key` | `K` | The key to set |
| `value` | `V` | The value to associate with the key |

**Returns**

The Map instance to allow method chaining.

### 2.4. Getting Values

The following example shows how to get values by key using the standard Map interface.

```typescript
const value = myMap.get('key');
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `key` | `K` | The key to retrieve the value for |

**Returns**

The value associated with the key, or `undefined` if not found.

### 2.5. Checking Key Existence

The following example shows how to check if a key exists in the map.

```typescript
const exists = myMap.has('key'); // true or false
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `key` | `K` | The key to check for existence |

**Returns**

`true` if the key exists, `false` otherwise.

### 2.6. Deleting Keys

The following example shows how to delete a key-value pair from the map.

```typescript
const deleted = myMap.delete('key'); // true if deleted, false if not found
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `key` | `K` | The key to delete |

**Returns**

`true` if the key was deleted, `false` if the key didn't exist.

### 2.7. Clearing All Data

The following example shows how to remove all key-value pairs from the map.

```typescript
myMap.clear();
console.log(myMap.size); // 0
```

**Returns**

`undefined`

### 2.8. Iterating Over Entries

The following example shows how to iterate over all key-value pairs in the map.

```typescript
for (const [key, value] of myMap.entries()) {
  console.log(key, value);
}
```

**Returns**

An iterator of `[key, value]` pairs.

### 2.9. Iterating Over Keys

The following example shows how to iterate over all keys in the map.

```typescript
for (const key of myMap.keys()) {
  console.log(key);
}
```

**Returns**

An iterator of keys.

### 2.10. Iterating Over Values

The following example shows how to iterate over all values in the map.

```typescript
for (const value of myMap.values()) {
  console.log(value);
}
```

**Returns**

An iterator of values.

### 2.11. Using forEach

The following example shows how to execute a function for each key-value pair in the map.

```typescript
myMap.forEach((value, key, map) => {
  console.log(`${key}: ${value}`);
});
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `callback` | `(value: V, key: K, map: Map<K, V>) => void` | Function to execute for each element |

**Returns**

`undefined`

## 3. Sets

Creates a callable Set instance that can be invoked as a function to get values by index. The enhanced Set provides indexed access while maintaining compatibility with the native Set interface.

```typescript
import { set } from '@stackpress/lib';

const tags = set(['javascript', 'typescript', 'node.js']);

// Use as function to get by index
const firstTag = tags(0); // 'javascript'
const secondTag = tags(1); // 'typescript'

// Use as Set
tags.add('react');
console.log(tags.size); // 4
```

### 3.1. Properties

The following properties are available on a callable set.

| Property | Type | Description |
|----------|------|-------------|
| `size` | `number` | Number of values in the set |

### 3.2. Direct Invocation

The following example shows how to use the set as a function to get values by index position.

```typescript
const value = mySet(0); // Get first item
const value2 = mySet(2); // Get third item
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `index` | `number` | The index of the value to retrieve |

**Returns**

The value at the specified index, or `undefined` if index is out of bounds.

### 3.3. Getting Values by Index

The following example shows how to get values by index using the explicit index method.

```typescript
const value = mySet.index(0); // Same as mySet(0)
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `index` | `number` | The index of the value to retrieve |

**Returns**

The value at the specified index, or `undefined` if index is out of bounds.

### 3.4. Adding Values

The following example shows how to add values to the set with method chaining support.

```typescript
mySet.add('newValue');
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `value` | `V` | The value to add to the set |

**Returns**

The Set instance to allow method chaining.

### 3.5. Checking Value Existence

The following example shows how to check if a value exists in the set.

```typescript
const exists = mySet.has('value'); // true or false
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `value` | `V` | The value to check for existence |

**Returns**

`true` if the value exists, `false` otherwise.

### 3.6. Deleting Values

The following example shows how to delete a value from the set.

```typescript
const deleted = mySet.delete('value'); // true if deleted, false if not found
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `value` | `V` | The value to delete |

**Returns**

`true` if the value was deleted, `false` if the value didn't exist.

### 3.7. Clearing All Data

The following example shows how to remove all values from the set.

```typescript
mySet.clear();
console.log(mySet.size); // 0
```

**Returns**

`undefined`

### 3.8. Iterating Over Entries

The following example shows how to iterate over all value pairs in the set.

```typescript
for (const [value1, value2] of mySet.entries()) {
  console.log(value1, value2); // Both values are the same in a Set
}
```

**Returns**

An iterator of `[value, value]` pairs.

### 3.9. Iterating Over Values

The following example shows how to iterate over all values in the set.

```typescript
for (const value of mySet.values()) {
  console.log(value);
}
```

**Returns**

An iterator of values.

### 3.10. Using forEach

The following example shows how to execute a function for each value in the set.

```typescript
mySet.forEach((value1, value2, set) => {
  console.log(value1); // value1 and value2 are the same
});
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `callback` | `(value: V, value2: V, set: Set<V>) => void` | Function to execute for each element |

**Returns**

`undefined`
