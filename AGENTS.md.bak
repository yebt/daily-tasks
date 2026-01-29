# Agent Instructions

## Package Manager

**IMPORTANT**: Always use `bun` instead of `npm` for all package management commands.

### Common Commands

- Install dependencies: `bun install`
- Add a package: `bun add package-name`
- Add dev dependency: `bun add -d package-name`
- Remove a package: `bun remove package-name`
- Update packages: `bun update`
- Run scripts: `bun run script-name` or `bun script-name`

### Why Bun?

This project uses Bun as its package manager and JavaScript runtime. Using npm will create inconsistencies with the lock file (bun.lock) and may cause version conflicts.

### Never Use

- ❌ `npm install`
- ❌ `npm add`
- ❌ `npm run`
- ❌ `npm update`

### Always Use

- ✅ `bun install`
- ✅ `bun add`
- ✅ `bun run`
- ✅ `bun update`

## Build, Lint & Test Commands

### Development

- **Dev server**: `bun dev` - Starts Vite dev server with hot reload

### Building

- **Build for production**: `bun build` - Runs type-check then builds with Vite
- **Build only**: `bun run build-only` - Skips type-check, builds with Vite
- **Preview build**: `bun preview` - Preview production build locally

### Type Checking

- **Type check**: `bun run type-check` - Validates TypeScript (runs vue-tsc --build)

### Linting & Formatting

- **Lint all**: `bun lint` - Runs oxlint and eslint with fixes
- **Lint with oxlint**: `bun run lint:oxlint` - Fast linting with fix
- **Lint with eslint**: `bun run lint:eslint` - ESLint with cache
- **Format**: `bun run format` - Runs oxfmt for code formatting

### Testing

- **Run all tests**: `bun test:unit` - Runs Vitest
- **Run single test**: `bun test:unit path/to/test.spec.ts` - Run specific test file
- **Run tests in watch mode**: `bun test:unit --watch` - Runs Vitest in watch mode
- **Run tests with UI**: `bun test:unit --ui` - Vitest UI dashboard

## Code Style Guidelines

### TypeScript & Type Conventions

- **Strict mode**: Always enabled via tsconfig
- **Interfaces over Types**: Use `interface` for object shapes unless using `type` for unions/primitives
- **Explicit return types**: Always annotate function return types
- **No `any`**: Avoid `any`; use proper typing or `unknown` if necessary
- **Null handling**: Prefer `null` over `undefined` for explicit absence
- **Export types**: Use `export type` or `export interface` for external types

### Imports & Module Organization

- **Path aliases**: Use configured aliases (`@/`, `@core/`, `@shared/`, `@modules/`)
- **Order imports**:
  1. Node/external packages (vue, firebase, etc.)
  2. Path-aliased imports
  3. Relative imports
  4. Type imports marked with `type` keyword
- **Named imports**: Prefer named imports over default imports
- **Organize by domain**: Follow modular structure: `src/modules/[feature]/` with `services/`, `domain/`, `components/`, `store/`

### Formatting & Syntax

- **Semicolons**: None (configured in prettier/oxfmt: `semi: false`)
- **Quotes**: Single quotes only (configured: `singleQuote: true`)
- **Print width**: 100 characters max (prettier: `printWidth: 100`)
- **Indentation**: 2 spaces (ESLint default)
- **No trailing commas**: Handled by formatter

### Naming Conventions

- **Components**: PascalCase (e.g., `SettingsModal.vue`, `UserCard.vue`)
- **Services**: Suffix with `.service.ts` (e.g., `settings.service.ts`)
- **Entities/Models**: Suffix with `.entity.ts` or `.model.ts` (e.g., `user.model.ts`)
- **Stores**: Suffix with `.store.ts` (e.g., `settings.store.ts`)
- **Constants**: UPPER_SNAKE_CASE
- **Variables/functions**: camelCase

### Vue Component Structure

- **Single File Components** (SFCs) in `.vue` files
- **Template first**: `<template>` → `<script setup lang="ts">` → `<style>`
- **Typed props**: Always type component props with `defineProps<T>()`
- **Reactive data**: Use `ref()` and `computed()` from Vue Composition API

### Error Handling

- **Try-catch blocks**: Always wrap async operations and error-prone code
- **Logging errors**: Use `console.error()` with context (e.g., "Error fetching settings:")
- **Re-throw or handle**: Don't silently swallow errors; always re-throw after logging
- **Type errors**: Catch as `unknown`, then narrow type for safety

### DOM & Template Patterns

- **v-if over v-show**: Use `v-if` for conditional rendering (performance)
- **Event handling**: Use camelCase event names (`@click`, not `@onClick`)
- **Class bindings**: Use dynamic objects for multiple classes
- **Avoid inline styles**: Use UnoCSS utility classes or scoped `<style>` blocks

### Comments & Documentation

- **JSDoc**: Document public functions and complex logic with JSDoc comments
- **Inline comments**: Explain "why", not "what" (code already shows what)
- **TODO/FIXME**: Mark technical debt with `// TODO:` or `// FIXME:`

## Project Structure

```
src/
├── core/              # Global configuration, router, auth guards
├── modules/           # Feature modules (auth, settings, etc.)
│   └── [feature]/
│       ├── components/     # Vue components
│       ├── services/       # Business logic & API calls
│       ├── store/          # Pinia stores
│       └── domain/         # TypeScript types/interfaces
├── shared/            # Shared utilities, design system, infrastructure
└── __tests__/         # Unit test files
```

## Key Technologies

- **Framework**: Vue 3 with Composition API
- **Runtime**: Bun
- **Build**: Vite
- **Testing**: Vitest + Vue Test Utils
- **State**: Pinia
- **Styling**: UnoCSS
- **Linting**: ESLint + oxlint
- **Formatting**: oxfmt + Prettier
- **Backend**: Firebase + Vuefire
- **Validation**: TypeScript (5.9.x)
