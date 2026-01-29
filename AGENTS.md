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

## Project Structure

```
src/
├── core/               # Shared services, router, guards
├── modules/            # Feature modules (auth, todo, settings)
├── shared/             # Shared components, utilities
├── __tests__/          # Unit tests
├── App.vue             # Root component
└── main.ts             # Application entry point
```

## Code Style Guidelines

### Imports & Modules

- Use ES6 module imports (already configured as `"type": "module"`)
- Organize imports: external → internal path aliases → relative
- Always use path aliases from `tsconfig.app.json`:
  - `@/*` → `./src/*`
  - `@core/*` → `./src/core/*`
  - `@shared/*` → `./src/shared/*`
  - `@modules/*` → `./src/modules/*`

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
- **Stores:** Pinia store functions prefixed with `use` (e.g., `useAuthStore`)
- **Enums:** PascalCase (e.g., `TodoStatus`, `TodoCategory`)
- **Constants:** UPPER_SNAKE_CASE for enum values
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

- Use Vitest with `@vue/test-utils`
- Test files: `src/**/__tests__/*.spec.ts`
- Use `describe` and `it` blocks
- Mock external dependencies (e.g., RouterView)

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
