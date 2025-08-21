# Data Structures

Data structures in programming are specialized formats for organizing, processing, storing, and retrieving data within a computer's memory. They define the relationships between data elements and the operations that can be performed on them. The choice of data structure significantly impacts the efficiency and performance of algorithms and overall program execution. 

## Nest

Hierarchical data management utilities for nested objects and arrays.

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

### Properties

The following properties are available when instantiating a Nest.

| Property | Type | Description |
|----------|------|-------------|
| `data` | `M` | Raw nested data structure |
| `size` | `number` | Total number of top-level keys |
| `withArgs` | `ArgString` | Parser for terminal args |
| `withFormData` | `FormData` | Parser for multipart/form-data |
| `withPath` | `PathString` | Parser for path notations |
| `withQuery` | `QueryString` | Parser for query string |

### Methods

The following methods are available when instantiating a Nest.

#### Retrieving Data

The following example shows how to retrieve data from a nest.

```typescript
config.get('database', 'postgres', 'port'); //--> 5432
config.get<number>('database', 'postgres', 'port'); //--> 5432
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `...path` | `Key[]` | A path of object keys leading to the value |

**Returns**

The value given the object key path. If you don't provide a generic, 
will follow the type map provided.

#### Setting Data

The following example shows how to add or update data in a nest.

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

#### Checking For Data

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

#### Deleting Data

The following example shows how to delete a value.

```typescript
config.delete('database', 'postgres', 'port'); //--> Nest
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `...path` | `Key[]` | A path of object keys leading to the value to be deleted |

**Returns**

The nest object to allow chainability.

#### Purging Data

The following example shows how to purge the nest.

```typescript
config.clear(); //--> Nest
```

**Returns**

The nest object to allow chainability.

#### Getting the Top-Level Keys

The following example shows how to get the top-level keys in a nest.

```typescript
config.keys(); //--> [ 'database' ]
```

**Returns**

An array of object key strings.

#### Getting the Top-Level Values

The following example shows how to get the top-level values in a nest.

```typescript
config.values(); //--> [ { postgres: { host: 'localhost', port: 5432 } } ]
```

**Returns**

An array of arbitrary values.

#### Getting the Top-Level Entries

The following example shows how to get the top-level entries in a nest.

```typescript
config.entries(); //--> [ ['database', { postgres: { host: 'localhost', port: 5432 } }] ]
```

**Returns**

An array of key-value pairs.

#### Retrieving Data Using a Key Path

The following example shows how to retrieve data from a nest using a key dot path.

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

The value given the object key path. If you don't provide a generic, 
will follow the type map provided.

#### Iterating Over Data

The following example shows how to iterate over data at a specific path.

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

#### Converting a Nest to a JSON

The following example shows how to generate a JSON string from a nest.

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

#### Callable Nest

Creates a callable Nest instance that can be invoked as a function to get nested values.

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



## Maps

Creates a callable Map instance that can be invoked as a function to get values.

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

### Properties

The following properties are available on a callable map.

| Property | Type | Description |
|----------|------|-------------|
| `size` | `number` | Number of key-value pairs in the map |

### Methods

The following methods are available on a callable map.

#### Direct Invocation

The following example shows how to use the map as a function.

```typescript
const value = myMap('key'); // Equivalent to myMap.get('key')
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `key` | `K` | The key to retrieve the value for |

**Returns**

The value associated with the key, or `undefined` if not found.

#### Setting Values

The following example shows how to set key-value pairs.

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

#### Getting Values

The following example shows how to get values by key.

```typescript
const value = myMap.get('key');
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `key` | `K` | The key to retrieve the value for |

**Returns**

The value associated with the key, or `undefined` if not found.

#### Checking Key Existence

The following example shows how to check if a key exists.

```typescript
const exists = myMap.has('key'); // true or false
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `key` | `K` | The key to check for existence |

**Returns**

`true` if the key exists, `false` otherwise.

#### Deleting Keys

The following example shows how to delete a key-value pair.

```typescript
const deleted = myMap.delete('key'); // true if deleted, false if not found
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `key` | `K` | The key to delete |

**Returns**

`true` if the key was deleted, `false` if the key didn't exist.

#### Clearing All Data

The following example shows how to remove all key-value pairs.

```typescript
myMap.clear();
console.log(myMap.size); // 0
```

**Returns**

`undefined`

#### Iterating Over Entries

The following example shows how to iterate over all key-value pairs.

```typescript
for (const [key, value] of myMap.entries()) {
  console.log(key, value);
}
```

**Returns**

An iterator of `[key, value]` pairs.

#### Iterating Over Keys

The following example shows how to iterate over all keys.

```typescript
for (const key of myMap.keys()) {
  console.log(key);
}
```

**Returns**

An iterator of keys.

#### Iterating Over Values

The following example shows how to iterate over all values.

```typescript
for (const value of myMap.values()) {
  console.log(value);
}
```

**Returns**

An iterator of values.

#### Using forEach

The following example shows how to execute a function for each key-value pair.

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







## Sets

Creates a callable Set instance that can be invoked as a function to get values by index.

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

### Properties

The following properties are available on a callable set.

| Property | Type | Description |
|----------|------|-------------|
| `size` | `number` | Number of values in the set |

### Methods

The following methods are available on a callable set.

#### Direct Invocation

The following example shows how to use the set as a function to get values by index.

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

#### Getting Values by Index

The following example shows how to get values by index using the index method.

```typescript
const value = mySet.index(0); // Same as mySet(0)
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `index` | `number` | The index of the value to retrieve |

**Returns**

The value at the specified index, or `undefined` if index is out of bounds.

#### Adding Values

The following example shows how to add values to the set.

```typescript
mySet.add('newValue');
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `value` | `V` | The value to add to the set |

**Returns**

The Set instance to allow method chaining.

#### Checking Value Existence

The following example shows how to check if a value exists.

```typescript
const exists = mySet.has('value'); // true or false
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `value` | `V` | The value to check for existence |

**Returns**

`true` if the value exists, `false` otherwise.

#### Deleting Values

The following example shows how to delete a value.

```typescript
const deleted = mySet.delete('value'); // true if deleted, false if not found
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `value` | `V` | The value to delete |

**Returns**

`true` if the value was deleted, `false` if the value didn't exist.

#### Clearing All Data

The following example shows how to remove all values.

```typescript
mySet.clear();
console.log(mySet.size); // 0
```

**Returns**

`undefined`

#### Iterating Over Entries

The following example shows how to iterate over all value pairs.

```typescript
for (const [value1, value2] of mySet.entries()) {
  console.log(value1, value2); // Both values are the same in a Set
}
```

**Returns**

An iterator of `[value, value]` pairs.

#### Iterating Over Values

The following example shows how to iterate over all values.

```typescript
for (const value of mySet.values()) {
  console.log(value);
}
```

**Returns**

An iterator of values.

#### Using forEach

The following example shows how to execute a function for each value.

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