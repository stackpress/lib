# File System

Cross-platform file loading utilities for locating, loading, and importing files throughout your project and node_modules. Provides cross-platform path resolution, Node modules discovery, dynamic import support, and project root (@/) path shortcuts for efficient file management across different environments.

```typescript
import { NodeFS, FileLoader } from '@stackpress/lib';

const loader = new FileLoader(new NodeFS());
```

## 1. FileLoader

Cross-platform file loading utilities that provide a unified interface for file operations across different environments. The FileLoader class abstracts filesystem operations and provides convenient methods for path resolution, module discovery, and dynamic imports.

### 1.1. Properties

The following properties are available when instantiating a FileLoader.

| Property | Type | Description |
|----------|------|-------------|
| `cwd` | `string` | Current working directory |
| `fs` | `FileSystem` | Filesystem interface being used |

### 1.2. Getting Absolute Paths

The following example shows how to get absolute paths from various path formats with automatic resolution.

```typescript
// Project root paths (@ prefix)
const path1 = await loader.absolute('@/src/index.ts');
// Returns: /project/root/src/index.ts

// Relative paths
const path2 = await loader.absolute('./utils/helper.js');
// Returns: /current/directory/utils/helper.js

// Node modules
const path3 = await loader.absolute('@types/node');
// Returns: /project/node_modules/@types/node

// Absolute paths (unchanged)
const path4 = await loader.absolute('/usr/local/bin');
// Returns: /usr/local/bin
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `pathname` | `string` | Path to resolve (supports @/, ./, ../, and node_modules) |
| `pwd` | `string` | Working directory (default: current working directory) |

**Returns**

A promise that resolves to the absolute path string.

### 1.3. Getting Base Paths

The following example shows how to remove file extensions from paths for clean path manipulation.

```typescript
const basePath = loader.basepath('/path/to/file.js');
// Returns: '/path/to/file'

const noExt = loader.basepath('/path/to/file');
// Returns: '/path/to/file' (unchanged if no extension)
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `pathname` | `string` | Path to process |

**Returns**

The path without the file extension.

### 1.4. Locating Node Modules

The following example shows how to locate node_modules directories for package resolution.

```typescript
// Find node_modules containing a specific package
const modulesPath = await loader.modules('@types/node');
// Returns: '/project/node_modules'

// Find node_modules from a specific directory
const modulesPath2 = await loader.modules('lodash', '/some/path');
// Returns: '/some/path/node_modules' or traverses up
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `pathname` | `string` | Package name to locate |
| `pwd` | `string` | Starting directory (default: current working directory) |
| `meta` | `boolean` | Use import.meta.resolve if available (default: true) |

**Returns**

A promise that resolves to the node_modules directory path.

### 1.5. Locating Library Path

The following example shows how to locate the @stackpress/lib installation directory.

```typescript
const libPath = await loader.lib();
// Returns: '/project/node_modules' (where @stackpress/lib is installed)

const libPath2 = await loader.lib('/custom/path');
// Returns: node_modules path containing @stackpress/lib from custom path
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `pwd` | `string` | Starting directory (default: current working directory) |

**Returns**

A promise that resolves to the node_modules directory containing @stackpress/lib.

### 1.6. Importing Files

The following example shows how to dynamically import various file types with type safety.

```typescript
// Import JavaScript/TypeScript modules
const module = await loader.import('./utils/helper.js');
console.log(module.default); // Default export
console.log(module.namedExport); // Named export

// Import JSON files
const config = await loader.import('./config.json');
console.log(config); // Parsed JSON object

// Import with default extraction
const defaultExport = await loader.import('./module.js', true);
// Returns only the default export
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `pathname` | `string` | Path to the file to import |
| `getDefault` | `boolean` | Return only the default export (default: false) |

**Returns**

A promise that resolves to the imported module or JSON data.

### 1.7. Getting Relative Paths

The following example shows how to get relative paths between files for import statements.

```typescript
// Get relative path from source to target
const relativePath = loader.relative(
  '/project/src/components/Button.js',
  '/project/src/utils/helper.js'
);
// Returns: '../utils/helper'

// Include file extension
const relativeWithExt = loader.relative(
  '/project/src/components/Button.js',
  '/project/src/utils/helper.js',
  true
);
// Returns: '../utils/helper.js'
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `pathname` | `string` | Source file path |
| `require` | `string` | Target file path |
| `withExtname` | `boolean` | Include file extension (default: false) |

**Returns**

The relative path from source to target.

### 1.8. Resolving Paths

The following example shows how to resolve and verify path existence with error handling.

```typescript
// Resolve path (returns null if not found)
const resolved = await loader.resolve('./config.json');
// Returns: '/project/config.json' or null

// Resolve with existence check (throws if not found)
try {
  const resolved = await loader.resolve('./config.json', process.cwd(), true);
  console.log('File exists:', resolved);
} catch (error) {
  console.log('File not found');
}

// Resolve from specific directory
const resolved2 = await loader.resolve('@/src/index.ts', '/custom/pwd');
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `pathname` | `string` | Path to resolve |
| `pwd` | `string` | Working directory (default: current working directory) |
| `exists` | `boolean` | Throw error if path doesn't exist (default: false) |

**Returns**

A promise that resolves to the absolute path or null if not found.

### 1.9. Resolving Files with Extensions

The following example shows how to resolve files with automatic extension detection and fallbacks.

```typescript
// Try multiple extensions
const file = await loader.resolveFile('./module', ['.js', '.ts', '.json']);
// Tries: ./module.js, ./module.ts, ./module.json, ./module/index.js, etc.

// Resolve with existence check
try {
  const file = await loader.resolveFile('./module', ['.js'], process.cwd(), true);
  console.log('Found file:', file);
} catch (error) {
  console.log('No file found with specified extensions');
}
```

**Parameters**

| Parameter | Type | Description |
|----------|------|-------------|
| `pathname` | `string` | Path to resolve (without extension) |
| `extnames` | `string[]` | File extensions to try (default: ['.js', '.json']) |
| `pwd` | `string` | Working directory (default: current working directory) |
| `exists` | `boolean` | Throw error if file doesn't exist (default: false) |

**Returns**

A promise that resolves to the resolved file path or null if not found.

## 2. Path Resolution Patterns

FileLoader supports several path resolution patterns for flexible file access across different project structures and environments.

### 2.1. Project Root Paths (@/)

The @ symbol refers to the project root directory, providing a consistent way to reference files from the project base.

```typescript
// @ refers to the project root (cwd)
await loader.absolute('@/src/index.ts');
await loader.absolute('@/config/database.json');
```

### 2.2. Relative Paths

Standard relative path resolution for files relative to the current working directory or specified path.

```typescript
// Standard relative paths
await loader.absolute('./utils/helper.js');
await loader.absolute('../shared/constants.ts');
```

### 2.3. Node Modules

Automatic resolution from node_modules directories with support for scoped packages and nested dependencies.

```typescript
// Automatically resolves from node_modules
await loader.absolute('lodash');
await loader.absolute('@types/node');
await loader.absolute('@company/private-package');
```

### 2.4. Absolute Paths

Absolute paths are returned as-is with symlink resolution for consistent file access.

```typescript
// Absolute paths are returned as-is (with symlink resolution)
await loader.absolute('/usr/local/bin/node');
await loader.absolute('C:\\Program Files\\Node\\node.exe');
```

## 3. File System Abstraction

FileLoader works with any FileSystem implementation, allowing for flexible filesystem backends and testing scenarios.

```typescript
import { NodeFS } from '@stackpress/lib';

// Node.js filesystem
const nodeLoader = new FileLoader(new NodeFS());

// Custom filesystem (for testing, virtual fs, etc.)
class CustomFS implements FileSystem {
  // Implement required methods...
}
const customLoader = new FileLoader(new CustomFS());
```

## 4. Cross-Platform Compatibility

FileLoader handles platform differences automatically to ensure consistent behavior across different operating systems and environments.

### 4.1. Platform Features

The following features ensure cross-platform compatibility.

 - **Path separators** — Automatically uses correct separators (/ vs \\)
 - **Symlinks** — Resolves symbolic links to real paths
 - **Case sensitivity** — Respects filesystem case sensitivity rules
 - **Module resolution** — Works with both CommonJS and ES modules

## 5. Error Handling

FileLoader provides clear error messages for common issues to help with debugging and development.

```typescript
try {
  await loader.modules('non-existent-package');
} catch (error) {
  // Error: Cannot find non-existent-package in any node_modules
}

try {
  await loader.resolve('missing-file.js', process.cwd(), true);
} catch (error) {
  // Error: Cannot resolve 'missing-file.js'
}
```

## 6. Usage Examples

The following examples demonstrate common usage patterns for the FileLoader in real-world scenarios.

### 6.1. Loading Configuration Files

```typescript
// Load config with fallbacks
const config = await loader.import('@/config.json').catch(() => ({}));

// Load environment-specific config
const env = process.env.NODE_ENV || 'development';
const envConfig = await loader.import(`@/config/${env}.json`);
```

### 6.2. Module Resolution

```typescript
// Resolve module paths for bundling
const modulePath = await loader.absolute('lodash');
const relativePath = loader.relative('./src/index.js', modulePath);

// Find all modules in a directory
const modules = await loader.modules('.');
```

### 6.3. Dynamic Imports

```typescript
// Dynamically import plugins
const pluginPath = await loader.resolveFile(`./plugins/${name}`, ['.js', '.ts']);
if (pluginPath) {
  const plugin = await loader.import(pluginPath, true);
  // Use plugin.default
}
