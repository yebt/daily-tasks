# AGENTS.md - Coding Guidelines for This Repository

This document provides essential guidelines for agentic coding agents operating in the daily-tasks repository.

## Build, Test, and Lint Commands

### Development

```bash
bun run dev              # Start dev server (Vite)
bun run build           # Full build with type-checking
bun run preview         # Preview production build
bun run type-check      # Run TypeScript type-checking
```

### Testing

```bash
bun run test:unit              # Run all tests with Vitest
bun run test:unit -- src/foo   # Run tests in specific directory
bun run test:unit -- --reporter=verbose  # Verbose test output
```

**Running Single Tests:**

```bash
# Run specific test file
bun run test:unit -- src/__tests__/App.spec.ts

# Run test matching pattern
bun run test:unit -- --grep "App renders"

# Watch mode for single test
bun run test:unit -- --watch src/__tests__/App.spec.ts
```

### Linting & Formatting

```bash
bun run lint            # Run all linters (oxlint + eslint)
bun run lint:oxlint     # Run oxlint with auto-fix
bun run lint:eslint     # Run eslint with auto-fix
bun run format          # Format with oxfmt
bun run format:prettier # Format with prettier (src only)
```

## Architectural Principles: Vertical Slicing & Clean Architecture

This project follows **Modular Vertical Slice Architecture** blended with **Clean Architecture**. Features are organized by **Business Domain** (Modules), not technical type.

### Layer Responsibilities

- **Domain** (`domain/*.entity.ts`, `domain/*.model.ts`): Pure business logic with **zero dependencies** on Firebase, Vue, or Pinia. Defines interfaces, enums, and models.
- **Services** (`services/*.service.ts`): Implementation of external tools (Firebase calls, data orchestration). Must be async and handle data transformation.
- **Store** (`store/*.store.ts`): State management using Pinia + VueFire. Use `useCollection`/`useDocument` for real-time reactivity.
- **Views/Components** (`views/*.vue`, `components/*.vue`): UI layer consuming Stores and Services.

### Development Workflow (Chain of Command)

**ALWAYS follow this sequence when implementing features:**

1. **Domain Definition** → Create/update entity or enum in `domain/`
2. **Infrastructure Service** → Implement Firebase logic in `services/`
3. **State Management** → Connect service to Pinia store in `store/`
4. **Presentation** → Build the UI in `views/`

### Critical Rules

- **Never import from `@modules` into `@core`** (unidirectional dependency)
- **Domain layer must have zero external dependencies**
- **Services must be async** and handle all Firebase/API logic
- **Stores must be reactive** via `useCollection` or `useDocument`
- **Views must be simple** and only call store actions
- **Always lint before finishing**: `bun run lint`
- **Always type-check before finishing**: `bun run build`

## Project Structure

```
src/
├── core/               # Singleton configurations & global orchestrators
│   ├── router/         # Main router and global Guards
│   ├── assets/         # Global styles (main.css, transitions)
│   └── services/       # Global services (Analytics, Error Logging)
├── modules/            # Domain-specific modules (The "Slices")
│   ├── auth/
│   │   ├── domain/     # Entities & Enums (user.model.ts)
│   │   ├── services/   # Business logic & Firebase calls (auth.service.ts)
│   │   ├── store/      # Reactive state (auth.store.ts)
│   │   └── views/      # Page components (LoginPage.vue)
│   └── todo/
│       ├── domain/     # todo.entity.ts, enums
│       ├── services/   # todo.service.ts
│       ├── store/      # todo.store.ts
│       └── views/      # TodoPage.vue
├── shared/             # Reusable logic across modules
│   ├── design-system/  # UI Kit (Atomic components, Modals)
│   ├── infrastructure/ # Firebase initialization & shared config
│   └── stores/         # Shared global stores
├── App.vue             # Root component
└── main.ts             # Application entry point
```

## Code Style Guidelines

### Imports & Modules

- Use ES6 module imports (already configured as `"type": "module"`)
- **Import Order**: External packages → Path aliases (`@/`, `@core/`, `@modules/`, `@shared/`) → Relative imports
- Always use path aliases from `tsconfig.app.json`:
  - `@/*` → `./src/*`
  - `@core/*` → `./src/core/*`
  - `@shared/*` → `./src/shared/*`
  - `@modules/*` → `./src/modules/*`

**Example:**

```typescript
// 1. External packages
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { query, collection } from 'firebase/firestore'

// 2. Path aliases
import { db } from '@shared/infrastructure/firebase'
import type { Todo } from '@modules/todo/domain/todo.entity'

// 3. Relative imports
import { getTodoData } from '../services/todo.service'
```

### Formatting

- **Print Width:** 100 characters (Prettier)
- **Semicolons:** None
- **Quotes:** Single quotes only
- **Indentation:** 2 spaces
- Run `bun run format` before committing

### TypeScript & Typing

- Strict mode enabled via `@vue/tsconfig`
- Always add explicit return types to functions
- Use `interface` for object contracts, `type` for unions/primitives
- Enums for fixed sets of values (see TodoStatus/TodoCategory examples)
- No implicit `any` types

**Example:**

```typescript
export interface Todo {
  id?: string
  text: string
  status: TodoStatus
  userId: string
  createdAt: number
  updatedAt: number
}

export const getTodoStatusIcon = (status: TodoStatus): string => {
  return TodoStatusIcon[status]
}
```

### Naming Conventions

- **Files:** `camelCase.ts`, `PascalCase.vue`, `camelCase.spec.ts`
- **Components:** PascalCase (e.g., `LoginPage.vue`)
- **Services:** `*.service.ts` with camelCase prefix (e.g., `todo.service.ts`)
- **Stores:** `*.store.ts` prefixed with `use` (e.g., `useAuthStore`, `useTodoStore`)
- **Entities/Models:** `*.entity.ts` or `*.model.ts` (e.g., `todo.entity.ts`, `user.model.ts`)
- **Enums:** PascalCase (e.g., `TodoStatus`, `TodoCategory`)
- **Constants:** UPPER_SNAKE_CASE for enum values (e.g., `WAITING`, `IN_PROGRESS`)
- **Functions/Methods:** camelCase (e.g., `handleLogin`, `getTodoStatus`)
- **Boolean variables/functions:** Prefix with `is`, `has`, `can` (e.g., `isAuthenticated`, `canAccess`)

### Vue Components

- Use `<script setup lang="ts">` for all components
- Use Composition API with ref/computed
- Group props, refs, computed, methods logically
- Template uses UnoCSS utility classes (Tailwind-like)

**Example:**

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const count = ref(0)
const isVisible = computed(() => count.value > 0)

const handleClick = (): void => {
  count.value++
}
</script>

<template>
  <button @click="handleClick">
    {{ count }}
  </button>
</template>
```

### Store Management (Pinia)

- Use Pinia's `defineStore` with Composition API syntax
- Accept HMR updates for hot module reload
- Return store state, computed, and actions as object

**Example:**

```typescript
import { defineStore, acceptHMRUpdate } from 'pinia'
import { computed, ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const isAuthenticated = computed(() => !!user.value)

  const login = async (email: string, password: string): Promise<void> => {
    // login logic
  }

  return { user, isAuthenticated, login }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot))
}
```

### Error Handling

- Use `try-catch` blocks for async operations
- Always catch and log errors with context
- Include error messages in UI feedback when appropriate
- Use `console.error()` for debugging (remove before production)

**Example:**

```typescript
const handleLogin = async (): Promise<void> => {
  try {
    loading.value = true
    await authStore.login(email.value, password.value, rememberMe.value)
    router.push('/')
  } catch (error) {
    console.error('Login failed:', error)
    errorMsg.value = 'Invalid credentials'
  } finally {
    loading.value = false
  }
}
```

### Testing

**Test Structure:**

- Test files: `src/**/__tests__/*.spec.ts` (colocated with source)
- Use `describe` and `it` blocks
- Use Vitest with `@vue/test-utils`
- Mock external dependencies (e.g., RouterView, Firebase, Pinia stores)

**Test Hierarchy by Layer:**

1. **Domain Tests** (`domain/*.spec.ts`): Pure functions, enums, types

   ```typescript
   import { describe, it, expect } from 'vitest'
   import { TodoStatus } from '../todo.entity'

   describe('TodoStatus enum', () => {
     it('has correct values', () => {
       expect(TodoStatus.Waiting).toBe('WAITING')
     })
   })
   ```

2. **Service Tests** (`services/*.spec.ts`): Firebase calls, data transformations

   ```typescript
   import { describe, it, expect, vi } from 'vitest'
   import { getTodos } from '../todo.service'

   describe('Todo Service', () => {
     it('transforms Firebase data to domain objects', async () => {
       // Mock Firebase calls
       const mockData = [{ id: '1', text: 'Test' }]
       // Assert transformations
     })
   })
   ```

3. **Store Tests** (`store/*.spec.ts`): Pinia actions, computed getters

   ```typescript
   import { describe, it, expect, beforeEach, vi } from 'vitest'
   import { setActivePinia, createPinia } from 'pinia'
   import { useTodoStore } from '../todo.store'

   describe('Todo Store', () => {
     beforeEach(() => {
       setActivePinia(createPinia())
     })

     it('adds todo to state', () => {
       const store = useTodoStore()
       store.addTodo({ text: 'Test' })
       expect(store.todos).toHaveLength(1)
     })
   })
   ```

4. **View Tests** (`views/*.spec.ts`): Component rendering, user interactions

   ```typescript
   import { describe, it, expect } from 'vitest'
   import { mount } from '@vue/test-utils'
   import TodoPage from '../TodoPage.vue'

   describe('TodoPage', () => {
     it('renders todo list', () => {
       const wrapper = mount(TodoPage, {
         global: { stubs: { RouterView: true } },
       })
       expect(wrapper.find('[data-testid="todos"]').exists()).toBe(true)
     })
   })
   ```

**Best Practices:**

- Always mock Firebase before testing stores
- Use `data-testid` attributes for component selectors
- Test user interactions, not implementation details
- Setup/teardown with `beforeEach`, `afterEach`
- Keep tests focused on a single behavior
- Never test multiple layers in one test file

- All programming is in english

## Key Architectural Patterns

### Real-Time Data & VueFire

- Use `useCollection` and `useDocument` from VueFire within Stores
- Wrap queries in computed getters that react to auth state
- Always handle auth state delay to prevent permission errors

### State Separation

- Use Pinia for shared/global state
- Use local `ref()` for component-specific UI state
- Keep Firebase logic in Services, reactive state in Stores

### Component Size

- If a component exceeds 300 lines, extract sub-components
- Keep logic out of `.vue` files; move to Stores or Services

### Asynchronous Operations

- Always implement `loading` states for async actions
- Use confirmation dialogs for destructive operations (deletion)
- Implement `writeBatch` for multi-document modifications

### Security

- **Client-side**: Use `auth.guard.ts` to protect routes via `meta: { requiresAuth: true }`
- **Server-side**: Always implement Firestore Security Rules based on `request.auth.uid`

## Tools & Technologies

- **Framework:** Vue 3.5+
- **Language:** TypeScript 5.9
- **Testing:** Vitest 4.0 + Vue Test Utils
- **Linting:** ESLint 9 + Oxlint 1.41
- **Formatting:** Prettier 3.8
- **Build:** Vite (beta)
- **State Management:** Pinia 3
- **Backend:** Firebase with Vuefire
- **UI:** UnoCSS with Tailwind preset
- **Icons:** Lucide (via @iconify-json/lucide)

## Important Notes

- Node version required: 20.19.0 or 22.12.0+
- All code must pass type-checking, linting, and tests
- Never commit code with failing linters or tests
- Use relative paths for local imports within modules
- Use absolute path aliases across module boundaries

