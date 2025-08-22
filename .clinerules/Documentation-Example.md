# Nest

Hierarchical data management utilities for nested objects and arrays.

```typescript
type NestMap = {
  database: Record<string, { host: string, port: number}>
};
const config = new Nest<NestMap>({
  database: {
    postgres: {
      host: 'localhost',
      port: 5432
    }
  }
});
```

## Properties

The following properties are available when instantiating a nest.

| Property | Type | Description |
|----------|------|-------------|
| `data` | `object` | Raw nested data structure |
| `size` | `number` | Total number of leaf nodes |

## Methods

The following methods are available when instantiating a nest.

### Retrieving Data

The following examples shows how to retrieve data from a nest.

```typescript
config.get('database', 'postgres', 'port'); //--> 5432
config.get<number>('database', 'postgres', 'port'); //--> 5432
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `...path` | `string[]` | A path of object keys leading to the value |

**Returns**

The value given the object key path. If you don't provide a generic, 
will follow the type map provided.

### Setting Data

The following example shows how to add or update data in a nest.

```typescript
config.set('database', 'postgres', 'port', 5432); //--> Nest
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `...path` | `string[]` | A path of object keys leading to the value to be set |
| `value` | `any` | The new value to set |

**Returns**

The nest object to allow chainability.

### Checking For Data

The following example shows how to check if an object key path has been set.

```typescript
config.has('database', 'postgres', 'port'); //--> true
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `...path` | `string[]` | A path of object keys leading to the value to be set |
| `value` | `any` | The new value to set |

**Returns**

`true` if the object key path is set, `false` otherwise.

### Deleting Data

The following example shows how to delete a value.

```typescript
config.delete('database', 'postgres', 'port'); //--> Nest
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `...path` | `string[]` | A path of object keys leading to the value to be deleted |

**Returns**

The nest object to allow chainability.

### Purging Data

The following example shows how to purge the nest.

```typescript
config.clear(); //--> Nest
```

**Returns**

The nest object to allow chainability.

### Getting the Top-Level Keys

The following example shows how to get the top-level keys in a nest.

```typescript
config.keys(); //--> [ 'database' ]
```

**Returns**

An array of object key strings.

### Getting the Top-Level Values

The following example shows how to get the top-level values in a nest.

```typescript
config.values(); //--> [ { postgres: { host: 'localhost', port: 5432 } } ]
```

**Returns**

An array of arbitrary values.

### Retrieving Data Using a Key Path

The following examples shows how to retrieve data from a nest using a key dot path.

```typescript
config.path('database.postgres.port'); //--> 5432
config.path<number>('database.postgres.port'); //--> 5432
config.path('database', 'mysql', 3306); //--> 3306
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `path` | `string` | An object key path separated by dots leading to the value |

**Returns**

The value given the object key path. If you don't provide a generic, 
will follow the type map provided.

### Converting a Nest to a JSON

The following examples shows how to generate a JSON string from a nest.

```typescript
config.toString('database.postgres.port'); 
//--> { database: { postgres: { host: 'localhost', port: 5432 } } }
```

**Returns**

A JSON string derrived from the nest.