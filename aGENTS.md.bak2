# Agent Instructions for Daily Tasks

## Package Manager

**CRITICAL**: Always use `bun` instead of `npm` for all package management commands. The lock file is `bun.lock`, and using npm will cause inconsistencies.

```bash
bun install          # Install dependencies
bun add package      # Add dependency
bun add -d package   # Add dev dependency
bun remove package   # Remove package
bun update           # Update all packages
bun run script       # Run npm script
```

---

## Build, Lint & Test Commands

### Development

- `bun dev` - Start Vite dev server with HMR

### Building

- `bun build` - Run type-check then build (recommended)
- `bun run build-only` - Build without type-check
- `bun preview` - Preview production build locally

### Type Checking

- `bun run type-check` - Validate TypeScript (vue-tsc --build)

### Linting & Formatting

- `bun lint` - Run all linters (oxlint + eslint with fixes)
- `bun run lint:oxlint` - Fast oxlint (fixes automatically)
- `bun run lint:eslint` - ESLint with cache
- `bun run format` - Format with oxfmt
- `bun run format:prettier` - Format with Prettier

### Testing

- `bun test:unit` - Run all tests (Vitest)
- `bun test:unit path/to/test.spec.ts` - Run single test file
- `bun test:unit --watch` - Watch mode
- `bun test:unit --ui` - Interactive UI dashboard

---

## Code Style Guidelines

### TypeScript & Types

- **Strict mode enabled** via tsconfig
- Use `interface` for object shapes; `type` for unions/primitives
- **Always** annotate function return types explicitly
- Avoid `any`; use `unknown` and narrow types
- Prefer explicit `null` over `undefined`
- Export types with `export type` or `export interface`

### Imports & Module Organization

- **Path aliases**: `@/*`, `@core/*`, `@shared/*`, `@modules/*`
- **Import order**:
  1. External packages (vue, firebase, pinia, etc.)
  2. Path-aliased imports
  3. Relative imports
  4. Type imports (`import type { ... }`)
- Prefer named imports over defaults
- Follow modular structure: `src/modules/[feature]/` with `components/`, `services/`, `store/`, `domain/`

### Formatting & Syntax

- **No semicolons** (configured)
- **Single quotes only** (configured)
- **Max line width**: 100 characters
- **Indentation**: 2 spaces
- **No trailing commas**

### Naming Conventions

- **Vue Components**: `PascalCase` (e.g., `UserCard.vue`, `SettingsModal.vue`)
- **Services**: `.service.ts` suffix (e.g., `api.service.ts`)
- **Models/Entities**: `.model.ts` or `.entity.ts` (e.g., `user.model.ts`)
- **Pinia Stores**: `.store.ts` suffix (e.g., `auth.store.ts`)
- **Constants**: `UPPER_SNAKE_CASE`
- **Functions/Variables**: `camelCase`

### Vue 3 Composition API Patterns

- Use `<script setup lang="ts">` in SFCs
- Type props with `defineProps<PropInterface>()`
- Use `ref()` and `computed()` for reactivity
- Template → Script → Style file order in SFCs

### Error Handling

- Always wrap async/error-prone code in try-catch
- Log errors with context: `console.error('Operation failed:', error)`
- Never silently swallow errors; re-throw after logging
- Catch errors as `unknown`, then narrow types

### DOM & Template

- Use `v-if` over `v-show` (performance-first)
- Use camelCase event handlers (`@click`, `@input`)
- Bind classes dynamically: `[class.active]: isActive`
- Use UnoCSS utility classes; avoid inline styles

### Comments & Documentation

- Document public functions/complex logic with JSDoc
- Inline comments explain "why", not "what"
- Mark technical debt: `// TODO:` or `// FIXME:`

---

## Project Structure

```
src/
├── core/              # Global config, router, auth guards
├── modules/           # Feature modules (organized by domain)
│   └── [feature]/
│       ├── components/     # Vue components
│       ├── services/       # Business logic, API calls
│       ├── store/          # Pinia stores
│       └── domain/         # TypeScript types, interfaces
├── shared/            # Shared utilities, components, design system
└── __tests__/         # Unit test files
```

---

## Tech Stack

| Tool                   | Purpose                        |
| ---------------------- | ------------------------------ |
| **Vue 3**              | Framework with Composition API |
| **Bun**                | Runtime & package manager      |
| **Vite**               | Build tool                     |
| **Vitest**             | Unit testing                   |
| **Pinia**              | State management               |
| **UnoCSS**             | Atomic CSS                     |
| **ESLint + oxlint**    | Linting                        |
| **oxfmt + Prettier**   | Code formatting                |
| **Firebase + Vuefire** | Backend & realtime             |
| **TypeScript 5.9**     | Type safety                    |

---

## Key Rules for Agents

1. Always run `bun lint` before committing
2. Run full `bun build` to catch type errors early
3. For quick testing: `bun test:unit --watch`
4. Export types explicitly for cross-module usage
5. Never import `@modules/` into `@core/` (unidirectional dependency)
6. Use Pinia for global state; local state with `ref()`
7. Keep components small and focused

This file is designed as a "Standard Operating Procedure" (SOP) for any AI agent or developer joining the project. It focuses on the **methodology** and **execution** rather than the business logic.

---

# AGENTS.md: Technical Execution & Contribution Guide

This guide explains **how** to write code for this project. Any agent acting on this repository must follow these structural and logical patterns to maintain the integrity of the **Vertical Slicing** and **Clean Architecture**.

## 1. The Development Workflow (The "Chain of Command")

When asked to implement a feature, do not start with the UI. Follow this strict sequence:

1. **Domain Definition**: Check `domain/`. Create or update Enums and Interfaces. Ensure types are exhaustive.
2. **Infrastructure Service**: Implement the Firebase logic in `services/`. Use `serverTimestamp()` for all date-related fields.
3. **State Management**: Connect the service to the Store in `stores/`. Use VueFire for real-time data.
4. **Presentation**: Build the View using UnoCSS and the Store.

## 2. Layer Responsibilities

### 📂 Domain Layer (`src/modules/*/domain/`)

* **Allowed**: Interfaces, Enums, Type aliases, Pure functions (calculators, formatters).
* **Forbidden**: Imports from `firebase`, `vue`, `pinia`, or other modules.
* **Rule**: This is the "Source of Truth" for the data shape.

### 📂 Service Layer (`src/modules/*/services/`)

* **Allowed**: Firestore calls (`addDoc`, `updateDoc`, `writeBatch`), Auth calls.
* **Forbidden**: Reactive state (ref/reactive), UI logic, routing.
* **Rule**: Methods should be `async` and return Promises. Use `Omit<Entity, 'id'>` for create methods.

### 📂 Store Layer (`src/modules/*/stores/`)

* **Allowed**: `useCollection`, `useDocument`, `computed` getters for filtering.
* **Forbidden**: Direct Firestore mutation logic (this belongs in the Service).
* **Rule**: Always wrap VueFire queries in a getter: `useCollection(() => query)`.

### 📂 View Layer (`src/modules/*/views/`)

* **Allowed**: UI state (toggles, local inputs), UnoCSS classes, Lucide icons.
* **Forbidden**: Direct Firebase imports.
* **Rule**: Use `v-for` on store getters. Logic should be limited to "calling store actions".

---

## 3. Standard Coding Patterns

### Real-time Collections

Always handle the "Auth Delay". Queries must be reactive to the user's UID:

```typescript
const todosQuery = computed(() => {
  if (!authStore.user?.uid) return null; // Prevents SSR/Permission errors
  return query(collection(db, 'todos'), where('userId', '==', authStore.user.uid));
});
const allTodos = useCollection(todosQuery);

```

### Batching Operations

For operations affecting more than one document (like "Transfer tasks"), always use `writeBatch`. Never loop through IDs calling `updateDoc` individually.

### UI/UX Standards

* **Scannability**: Use UnoCSS to create visual hierarchy.
* **Feedback**: Always include `loading` states for async buttons.
* **Safety**: Use `confirm()` or a modal before `delete` operations.

---

## 4. Communication & Refactoring

* **Shared vs. Local**: If you find yourself creating a component in a module that looks reusable (e.g., a Button or Modal), stop. Move it to `src/shared/design-system/components/`.
* **Single Responsibility**: One component = One job. If a View grows beyond 300 lines, extract sub-components into the module's `/components` folder.

## 5. Error Handling

* **Graceful Failures**: Wrap Service calls in `try/catch`.
* **Silent Success**: Don't alert "Success" for standard Firestore writes (real-time UI is enough), but do alert on "Error".

