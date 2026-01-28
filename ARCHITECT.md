This document establishes the architectural standards, folder structure, and development principles for the project. It serves as the "Source of Truth" for both human developers and AI agents.

---

# ARCHITECTS.md

## 1. Architectural Philosophy: Vertical Slicing & Clean Architecture

This project follows a **Modular Vertical Slice Architecture** blended with **Clean Architecture** principles. Instead of grouping files strictly by technical type (all components together, all services together), we group by **Business Feature** (Modules).

### Layer Responsibilities

- **Domain**: Pure business logic. Defines interfaces, entities, enums, and models. It must have **zero dependencies** on external frameworks (Firebase, Vue, etc.).
- **Infrastructure**: Implementation of external tools. Includes routes, API configurations, and database-specific setups (Firebase).
- **Application/Services**: The bridge between Domain and Infrastructure. Contains data orchestration and business rules.
- **Presentation (Views/Components)**: Vue components and styles. They consume Stores and Services to display data.

---

## 2. Project Directory Structure

```text
src/
├── core/               # Singleton configurations & global orchestrators
│   ├── router/         # Main router and global Guards
│   ├── assets/         # Global styles (main.css, transitions)
│   └── services/       # Global services (Analytics, Error Logging)
├── modules/            # Domain-specific modules (The "Slices")
│   ├── auth/           # Authentication Module
│   └── todo/           # Todo/Task Management Module
│       ├── domain/     # Entities & Enums (todo.entity.ts)
│       ├── services/   # Business logic & Firebase calls (todo.service.ts)
│       ├── store/      # Reactive state (todo.store.ts)
│       └── views/      # Page components (TodoPage.vue)
├── shared/             # Reusable logic across multiple modules
│   ├── design-system/  # UI Kit (Atomic components, Modals)
│   ├── infrastructure/ # Firebase initialization & shared config
│   └── stores/         # Shared global stores
└── main.ts             # App entry point

```

---

## 3. Key Principles & Best Practices

### Data Flow

1. **Views** call **Actions** in the **Store**.
2. **Stores** use **Services** to interact with **Infrastructure** (Firebase).
3. **Services** return **Domain** objects.
4. **VueFire** provides real-time synchronization between Firestore and the Store.

### Naming Conventions

- **Components**: PascalCase (e.g., `ConfirmModal.vue`).
- **Services/Stores**: camelCase with suffix (e.g., `todo.service.ts`, `auth.store.ts`).
- **Entities**: camelCase with suffix (e.g., `user.model.ts`).

### State Management (Pinia + VueFire)

- Favor `useCollection` and `useDocument` within Stores for real-time reactivity.
- Keep logic out of the `.vue` files; move it to Stores or Services.
- Use `computed` in stores to filter data (e.g., `getTodosByDay`).

### Security

- **Client-side**: Use `auth.guard.ts` to protect routes via `meta: { requiresAuth: true }`.
- **Server-side**: Always implement Firestore Security Rules based on `request.auth.uid`.

---

## 4. Tech Stack Standards

- **Framework**: Vue 3 (Composition API + `<script setup>`).
- **Language**: TypeScript (Strict Mode).
- **Styling**: UnoCSS (Atomic CSS) + Lucide Icons.
- **Database/Auth**: Firebase via VueFire.
- **Tooling**: Vite + Bun (Package Manager).

---

## 5. Development Workflow for AI & Humans

1. **Define the Domain first**: Create/Update the entity or enum in `domain/`.
2. **Implement the Infrastructure**: Add necessary routes or Firebase services.
3. **Update the Store**: Ensure reactive data is available.
4. **Build the View**: Create the UI using UnoCSS and the established Design System tokens.

---

**Next Step**: Would you like me to create a **Navbar** component that follows this architecture to handle the **Logout** logic and the "Show all days" toggle?
