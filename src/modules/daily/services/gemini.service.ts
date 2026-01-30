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
      month: 'long',
      day: 'numeric',
    })

    let prompt = template.replace('{{fecha}}', dateFormatted)

    // If template contains {{tareas}}, replace with formatted tasks
    if (prompt.includes('{{tareas}}')) {
      prompt = prompt.replace('{{tareas}}', this.formatTasksForTemplate(tasks))
    }

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

    try {
      const response = await this.ai!.models.generateContent({
        model: this.model,
        contents: prompt,
      })
      if (!response.text) {
        throw new Error('No content generated')
      }
      return response.text
    } catch (error) {
      console.error('Gemini SDK error:', error)
      throw error
    }
  }
}

export const geminiService = new GeminiService()
