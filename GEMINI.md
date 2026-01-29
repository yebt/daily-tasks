# GEMINI.md

This file provides a comprehensive overview of the **daily-tasks** project, intended as a context for AI-powered development assistance.

## Project Overview

**daily-tasks** is a modern web application designed for managing weekly tasks. It is built as a Single-Page Application (SPA) using **Vue.js 3** and **TypeScript**. The project is structured with a strong emphasis on modularity and separation of concerns, making it scalable and maintainable.

### Core Technologies

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

### Architecture

The project follows a modular, feature-based architecture rooted in **Vertical Slicing** and **Clean Architecture** principles. The source code is organized as follows:

- `src/core`: Contains the application's core setup, including the main CSS, router initialization, and guards. **Crucially, `@core` cannot import from `@modules`**.
- `src/modules`: The main application directory, where each feature (e.g., `auth`, `todo`) is a self-contained module. Each module is further divided by layer:
    - `domain`: Core business logic and type definitions (entities).
    - `services`: Business logic, API calls, and interaction with infrastructure like Firebase.
    - `store`: State management using Pinia and VueFire.
    - `views` or `components`: Vue components for the UI.
- `src/shared`: Contains code shared across different modules, such as design system components, composables, and infrastructure setup. If a component is reusable, it belongs here.

## Building and Running

The project uses `bun` as the **exclusive** package manager.

### Key Commands

- **Install dependencies:** `bun install`
- **Run the development server:** `bun dev`
- **Run unit tests:** `bun test:unit`
- **Lint and format code:** `bun lint` and `bun format`
- **Build for production:** `bun run build` (includes type-checking)

---

## Architectural & Development Guidelines

This section outlines the strict rules and patterns that **must** be followed to maintain code quality and architectural integrity.

### 1. The Development Workflow (Chain of Command)

When implementing any feature, the following sequence is mandatory:

1.  **Domain Definition (`domain/`)**: Start here. Define or update the necessary `interface`, `enum`, or `type` aliases. This layer is the source of truth for data shapes and must not contain external dependencies.
2.  **Infrastructure Service (`services/`)**: Implement the Firebase logic. All methods should be `async` and handle data manipulation (`addDoc`, `updateDoc`, `writeBatch`).
3.  **State Management (`store/`)**: Connect the service to the Pinia store. Use VueFire (`useCollection`, `useDocument`) for real-time data fetching, wrapped in a computed getter that reacts to the auth state.
4.  **Presentation (`views/`)**: Finally, build the UI. Components should be simple, sourcing their data from the store and calling store actions to trigger changes.

### 2. Layer Responsibilities

- **📂 Domain (`src/modules/*/domain/`)**:
    - **Allowed**: `interface`, `enum`, pure functions.
    - **Forbidden**: Imports from `firebase`, `vue`, `pinia`.
- **📂 Service (`src/modules/*/services/`)**:
    - **Allowed**: Firestore/Auth calls.
    - **Forbidden**: Reactive state (`ref`), UI logic.
- **📂 Store (`src/modules/*/stores/`)**:
    - **Allowed**: `useCollection`, `computed` getters.
    - **Forbidden**: Direct Firestore mutation logic (use a Service).
- **📂 View (`src/modules/*/views/`)**:
    - **Allowed**: UI state, UnoCSS classes, calling store actions.
    - **Forbidden**: Direct `firebase` imports.

### 3. Key Rules for Agents

1.  **Always lint before finishing**: Run `bun lint`.
2.  **Type-check before finishing**: Run `bun run build`.
3.  **Unidirectional Dependencies**: Never import from `@modules` into `@core`.
4.  **State Separation**: Use Pinia for shared/global state; use local `ref()` for component-specific UI state.
5.  **Small Components**: If a component exceeds 300 lines, refactor it by extracting sub-components.
6.  **Handle Auth Delay**: VueFire queries must be reactive to the user's authentication status to prevent permission errors.
7.  **Batch Operations**: Use `writeBatch` for any operation that modifies multiple documents at once.
8.  **Provide User Feedback**: Always implement `loading` states for asynchronous actions and use confirmation dialogs for destructive operations like deletion.
9.  **Error Handling**: Wrap all service calls in `try/catch` blocks. Log errors with context and never swallow them silently.

### 4. Code Style

- **Formatting**: No semicolons, single quotes, 2-space indentation.
- **Naming**:
    - Components: `PascalCase` (`UserCard.vue`)
    - Services: `*.service.ts` (`AuthService.ts`)
    - Stores: `*.store.ts` (`useAuthStore.ts`)
    - Types: `*.entity.ts` or `*.model.ts`
- **Vue**: Always use `<script setup lang="ts">`. Props are typed with `defineProps<Interface>()`.
- **Imports**: Order is 1. External packages, 2. Path aliases, 3. Relative imports.
- **Path Aliases**: Use `@/`, `@core/`, `@modules/`, `@shared/` for clean imports.