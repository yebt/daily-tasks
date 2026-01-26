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
