# ARCHITECT

These are the notes to dev and organize the ideas about the implementations

```sh
src/
├── core/                       # Lo que es común a toda la app
│   ├── assets/                 # Estilos globales, fuentes
│   ├── components/             # UI Atómica (Botones, Inputs - agnósticos al negocio)
│   ├── composables/            # Utilities de Vue globales (useDark, useToggle)
│   ├── plugins/                # Config de Vuefire, Pinia, UnoCSS
│   └── router/                 # Configuración base del router
│
├── modules/                    # SCREAM & VERTICAL SLICING
│   ├── auth/                   # Ejemplo de un "Slice" funcional
│   │   ├── components/         # Componentes exclusivos de Auth (LoginForm.vue)
│   │   ├── composables/        # Lógica de Vue para este módulo (useAuth)
│   │   ├── domain/             # CLEAN: Reglas de negocio y Modelos (User.entity.ts)
│   │   ├── services/           # CLEAN: Llamadas a Firebase/Vuefire
│   │   ├── store/              # Pinia: Estado de la autenticación
│   │   ├── views/              # Páginas del módulo (LoginPage.vue)
│   │   └── auth.routes.ts      # Definición de rutas del módulo
│   │
│   ├── products/               # Otro "Slice" independiente
│   │   ├── components/
│   │   ├── domain/             # Lógica de validación de productos
│   │   ├── services/           # Repositorios que conectan con Firestore
│   │   └── ...
│
├── shared/                     # Código compartido entre módulos pero con lógica
│   ├── domain/                 # Interfaces base o Value Objects comunes
│   └── infrastructure/         # Configuración de Firebase/Vuefire compartida
│
├── App.vue
└── main.ts

```

---

1. Architectural Philosophy: Clean Architecture
This project follows Clean Architecture principles adapted for a modern Vue.js frontend. The main goal is to separate the Business Logic from the UI Framework (Vue) and External Agencies (APIs, LocalStorage).

Core Principles:
Framework Independence: Vue.js is treated as a "plugin." We could replace it with React or Svelte without rewriting our core business logic.

Testability: Business rules can be tested without a browser or a web server.

Dependency Rule: Dependencies only point inwards. The internal logic (Entities) knows nothing about the external layers (UI/API).

2. Project Stack
Frontend Framework: Vue 3 (Composition API)

Language: TypeScript (for type safety and interfaces)

State Management: Pinia (as a global data cache)

API Client: Axios / Fetch API

Styling: Tailwind CSS

3. Folder Structure
The project is organized by layers, not just by file types.

Plaintext
src/
├── core/                # LAYER 1: The Heart (Domain)
│   ├── entities/        # Business models (Interfaces/Classes)
│   └── use-cases/       # Application-specific business rules
├── data/                # LAYER 2: Data Adapters (Infrastructure)
│   ├── repositories/    # Implementations of API calls
│   ├── mappers/         # Transforms raw API data to Entities
│   └── sources/         # Direct external connections (Axios instances)
├── presentation/        # LAYER 3: The UI (Vue.js)
│   ├── components/      # Reusable UI widgets
│   ├── views/           # Page-level components
│   ├── composables/     # Reactivity logic (The bridge)
│   └── store/           # Global state (Pinia)
└── main.ts              # Entry point
4. How to Work in This Project
A. Creating a New Feature
Define the Entity: Create the data structure in core/entities/.

Define the Repository Interface: Specify what methods are needed (e.g., save(user: User): Promise<void>).

Implement the Use Case: Write the logic in core/use-cases/.

Implement the Repository: Write the actual HTTP call in data/repositories/.

Connect to Vue: Create a Composable in presentation/composables/ that invokes the Use Case and manages the loading and error states.

Build the View: Use the Composable in a Vue component.

B. The Communication Flow
UI (View) calls a Composable.

Composable executes a Use Case.

Use Case interacts with a Repository.

Repository fetches data and returns an Entity.

Composable updates the Reactive State (ref/reactive).

UI re-renders.

5. Rules for the AI Agent
When generating new code:

Do not put API logic (axios) inside Vue components.

Do not put complex business logic (calculations, validations) inside Pinia stores.

Always define an Interface for repositories to allow for easy mocking in tests.

Keep components "lean": They should only handle UI events and display data.
