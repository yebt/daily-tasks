export interface Daily {
  id: string // UUID v4
  userId: string
  content: string
  template: string
  includeIncomplete: boolean
  tasksIncluded: string[] // IDs of tasks included in generation
  title: string // Date with time (e.g., "2025-01-30 14:30")
  createdAt: number // Timestamp in milliseconds
  generatedAt: number // When AI generated it
}

export interface DailyTemplate {
  id?: string
  userId: string
  template: string
  isDefault: boolean
  createdAt: number
  updatedAt: number
}

export const DEFAULT_DAILY_TEMPLATE = `# Registro Diario — {{fecha}}

## Objetivo
- 

## Progreso
- 

## Tareas
- [ ] 
- [ ] 
- [ ] 

## Bloqueos
- 

## Próximos Pasos
- 

## Notas
- `

export const DAILY_COLLECTION = 'dailies'
export const DAILY_TEMPLATE_COLLECTION = 'daily_templates'
