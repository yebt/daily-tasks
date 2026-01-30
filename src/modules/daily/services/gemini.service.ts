import type { Todo } from '@modules/todo/domain/todo.entity'

interface GeminiRequest {
  contents: Array<{
    parts: Array<{
      text: string
    }>
  }>
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string
      }>
    }
  }>
}

class GeminiService {
  private apiKey: string = ''
  private model: string = 'gemini-1.5-flash'
  private baseUrl: string = 'https://generativelanguage.googleapis.com/v1beta/models'

  setApiKey(apiKey: string): void {
    this.apiKey = apiKey
  }

  isConfigured(): boolean {
    return !!this.apiKey
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

    const request: GeminiRequest = {
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/${this.model}:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request),
        },
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || 'Failed to generate daily')
      }

      const data: GeminiResponse = await response.json()

      if (
        !data.candidates ||
        data.candidates.length === 0 ||
        !data.candidates[0]?.content ||
        !data.candidates[0]?.content?.parts ||
        !data.candidates[0]?.content?.parts[0]
      ) {
        throw new Error('No content generated')
      }

      return data.candidates[0]!.content.parts[0]!.text
    } catch (error) {
      console.error('Gemini API error:', error)
      throw error
    }
  }
}

export const geminiService = new GeminiService()
