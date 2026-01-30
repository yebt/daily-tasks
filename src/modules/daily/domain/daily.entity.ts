export interface Daily {
  id?: string
  userId: string
  content: string
  template: string
  includeIncomplete: boolean
  tasksIncluded: string[] // IDs of tasks included in generation
  createdAt: number
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
