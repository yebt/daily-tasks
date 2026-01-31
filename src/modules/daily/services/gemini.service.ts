import { GoogleGenAI } from '@google/genai'
import type { Todo } from '@modules/todo/domain/todo.entity'

interface AvailableModel {
  name: string
  displayName: string
  description: string
}

class GeminiService {
  private apiKey: string = ''
  private model: string = 'gemini-1.5-flash'
  private ai: GoogleGenAI | null = null

  setApiKey(apiKey: string): void {
    this.apiKey = apiKey
    this.ai = new GoogleGenAI({ apiKey: this.apiKey })
  }

  setModel(model: string): void {
    this.model = model
  }

  isConfigured(): boolean {
    return !!this.apiKey && !!this.ai
  }

  async getAvailableModels(): Promise<AvailableModel[]> {
    if (!this.isConfigured()) {
      throw new Error('Gemini API key not configured')
    }

    try {
      const pager = await this.ai!.models.list()
      const models: AvailableModel[] = []

      for await (const model of pager) {
        models.push({
          name: model.name || '',
          displayName: model.displayName || model.name || '',
          description: model.description || '',
        })
      }

      return models
    } catch (error) {
      console.error('Error fetching available models:', error)
      throw error
    }
  }

  private formatTasksForTemplate(tasks: Todo[]): string {
    if (tasks.length === 0) {
      return ''
    }
    return tasks.map((task) => `- [ ] ${task.text}`).join('\n')
  }

  private buildPrompt(template: string, tasks: Todo[], date: Date = new Date()): string {
    const dateFormatted = date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })

    const prompt = `
Tu tarea es generar el reporte del dayli siguiendo la plantilla suministrada. La lsita de las\nsolo responde con el la template llena. Organiza cada tarea para mejorar la redacción y hacerla algo tecnica sin sonar rebuscada

## Información:
Date: ${dateFormatted}
Tareas:
${this.formatTasksForTemplate(tasks)}

## Plantilla:
${template}

NOTA: Asegúrate de mantener el formato y la estructura de la plantilla proporcionada.
No responndas mas cosas aparte de la plantilla completa.
---
`
    return prompt
  }

  async generateDaily(
    template: string,
    tasks: Todo[] = [],
    date: Date = new Date(),
  ): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('Gemini API key not configured')
    }

    const prompt = this.buildPrompt(template, tasks, date)
    const schema = {
      description: 'Generar un título y contenido de plantilla',
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'El título descriptivo',
        },
        templateContent: {
          type: 'string',
          description: 'El cuerpo o contenido de la plantilla en markdown',
        },
      },
      required: ['title', 'templateContent'],
    }

    try {
      const response = await this.ai!.models.generateContent({
        model: this.model,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseJsonSchema: schema,
        },
      })

      if (!response.text) {
        throw new Error('No content generated')
      }

      const datos = JSON.parse(response.text)

      // return response.text
      return datos.templateContent
    } catch (error) {
      console.error('Gemini SDK error:', error)
      throw error
    }
  }
}

export const geminiService = new GeminiService()
