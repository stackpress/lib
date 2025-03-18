## Desciptions For Each TSConfig

Because it's hella confusing.

## CommonJS

These compiler options for commonjs have worked for years without fail.

```js
{
  /* Module System */

  //type definitions to use
  "lib": [ "es2021", "es7", "es6", "dom" ],
  //module system for the program (import, require)
  "module": "commonjs",
  
  /* Developing */
  
  //Fixes import issues with cjs/umd/amd modules
  "esModuleInterop": true,
  //do not erase const enum declarations in generated code. 
  "preserveConstEnums": true,
  //allows importing modules with a .json extension
  "resolveJsonModule": true,
  //skip type checking of declaration files.
  "skipLibCheck": true,
  //js strict mode
  "strict": true,

  /* Compiling */
  
  //include `.d.ts` files
  "declaration": true,
  //strips all comments when converting into JavaScript
  "removeComments": true,
  //include `.map` files
  "sourceMap": false,
  //what code will compile to
  "target": "es6",

  /* Linting */
  
  //report errors on unused local variables.
  "noUnusedLocals": true
}
```

## EcmaScript

The following considerations are normally added to esm builds but, not 
added to the defaults.

 - `moduleDetection`
   - `auto` (default) - TypeScript will not only look for import and 
     export statements, but it will also check whether the "type" field 
     in a package.json is set to "module" when running with module: 
     nodenext or node16, and check whether the current file is a JSX 
     file when running under jsx: react-jsx.
   - `legacy` - The same behavior as 4.6 and prior, usings import and 
     export statements to determine whether a file is a module.
   - `force` - Ensures that every non-declaration file is treated as 
     a module.
 - `isolatedModules` - forbid files without import/export
 - `verbatimModuleSyntax` - any imports or exports without a type 
   modifier are left around. Anything that uses the type modifier 
   is dropped entirely.
 - `noImplicitOverride` - functions which override should include the 
   keyword override

```js
{ 
  /* Module System */

  //allow js files to be imported inside your project
  "allowJs": true,
  //type definitions to use
  "lib": [ "es2022", "dom", "dom.iterable" ],
  //module system for the program (import, require)
  "module": "esnext",
  
  /* Developing */
  
  //Fixes import issues with cjs/umd/amd modules
  "esModuleInterop": true,
  //Emit .js files with the JSX changed to _jsx calls 
  //(as opposed to React.createElement) optimized for 
  //production
  "jsx": "react-jsx",
  //do not erase const enum declarations in generated code. 
  "preserveConstEnums": true,
  //allows importing modules with a .json extension
  "resolveJsonModule": true,
  //skip type checking of declaration files.
  "skipLibCheck": true,
  //js strict mode
  "strict": true,

  /* Compiling */
  
  //include `.d.ts` files
  "declaration": true,
  //strips all comments when converting into JavaScript
  "removeComments": true,
  //include `.map` files
  "sourceMap": false,
  //what code will compile to
  "target": "es2022",

  /* Linting */
  
  //report errors on unused local variables.
  "noUnusedLocals": true,
  //report when arguments are unused (prefix _arg to ignore)
  "noUnusedParameters": true
}
```