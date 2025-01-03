# Types

This document provides an overview of the common TypeScript types used in the project. It includes descriptions, examples, and usage guidelines to help developers understand and utilize these types effectively.

## Table of Contents

1. [Introduction](#introduction)
2. [Basic Types](#basic-types)
3. [Interfaces](#interfaces)
4. [Type Aliases](#type-aliases)
5. [Enums](#enums)
6. [Advanced Types](#advanced-types)
7. [Conclusion](#conclusion)

## Introduction

TypeScript is a strongly typed programming language that builds on JavaScript, giving you better tooling at any scale. This document outlines the types used in our project to ensure consistency and clarity.

## Basic Types

### Number

Represents both integer and floating-point numbers.

```typescript
let count: number = 42;
```

### String

Represents text data.

```typescript
let name: string = "Stackpress";
```

### Boolean

Represents true/false values.

```typescript
let isActive: boolean = true;
```

## Interfaces

### User Interface

Defines the structure of a User object.

```typescript
interface User {
    id: number;
    name: string;
    email: string;
}
```

## Type Aliases

### ID Type

Defines a type for identifiers, which can be a number or a string.

```typescript
type ID = number | string;
```

## Enums

### Direction Enum

Represents possible directions.

```typescript
enum Direction {
    Up,
    Down,
    Left,
    Right
}
```

## Advanced Types

### Staff Type

Combines the properties of `Person` and `Employee` interfaces.

```typescript
interface Person {
    name: string;
}

interface Employee {
    employeeId: number;
}

type Staff = Person & Employee;
```

