import { mistralService } from './mistralService'

interface ArticleSummaryRequest {
  title: string
  url: string
  content?: string
}

interface ArticleSummaryResponse {
  summary: string
  success: boolean
  error?: string
}

class ArticleSummaryService {
  private isAvailable: boolean = true

  constructor() {
    this.isAvailable = mistralService.isServiceAvailable()
  }

  async generateSummary(request: ArticleSummaryRequest): Promise<ArticleSummaryResponse> {
    if (!this.isAvailable) {
      return {
        summary: '',
        success: false,
        error: 'AI summarization service is currently unavailable'
      }
    }

    try {
      // Try to fetch the full article content
      let fullContent = request.content || ''
      
      if (!fullContent && request.url) {
        // If no content provided, try to fetch from the URL
        // Note: This might fail due to CORS, but we'll try anyway
        try {
          const response = await fetch(request.url, {
            mode: 'cors',
            headers: {
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            }
          })
          
          if (response.ok) {
            const html = await response.text()
            // Basic HTML parsing to extract text content
            fullContent = this.extractTextFromHTML(html)
          }
        } catch (fetchError) {
          console.warn('Could not fetch article content:', fetchError)
        }
      }

      // If we still don't have content, use the title and URL
      const contentToSummarize = fullContent || `Title: ${request.title}\nURL: ${request.url}`

      // Create a system prompt for summarization
      const systemPrompt = `You are an expert scientific summarizer specializing in NASA space biology research. Your task is to create a comprehensive, accurate summary of the provided research article.

IMPORTANT INSTRUCTIONS:
1. Read the entire article content carefully
2. Identify the main research objectives, methods, findings, and conclusions
3. Extract key data points, statistics, and scientific results
4. Highlight the significance and implications of the research
5. Write a SINGLE, well-structured paragraph that covers all key aspects
6. Use clear, accessible language while maintaining scientific accuracy
7. Focus on the most important findings and their relevance to space biology
8. Keep the summary concise but comprehensive (aim for 4-6 sentences)

If the article content is limited or unavailable, work with what you have and clearly indicate any limitations.

RESPONSE FORMAT:
Provide a single, well-structured paragraph that includes:
- Research objectives and methods
- Key findings and data
- Scientific significance
- Implications for space biology`

      // Generate the summary using Mistral
      const summary = await mistralService.generateSummary(contentToSummarize, systemPrompt)
      
      if (summary) {
        return {
          summary,
          success: true
        }
      } else {
        return {
          summary: '',
          success: false,
          error: 'Failed to generate summary'
        }
      }

    } catch (error) {
      console.error('Error generating article summary:', error)
      return {
        summary: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  private extractTextFromHTML(html: string): string {
    // Basic HTML text extraction
    // Remove script and style elements
    let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    
    // Remove HTML tags
    text = text.replace(/<[^>]*>/g, '')
    
    // Decode HTML entities
    text = text.replace(/&nbsp;/g, ' ')
    text = text.replace(/&amp;/g, '&')
    text = text.replace(/&lt;/g, '<')
    text = text.replace(/&gt;/g, '>')
    text = text.replace(/&quot;/g, '"')
    text = text.replace(/&#39;/g, "'")
    
    // Clean up whitespace
    text = text.replace(/\s+/g, ' ').trim()
    
    // Limit to reasonable length (first 8000 characters)
    return text.substring(0, 8000)
  }

  isServiceAvailable(): boolean {
    return this.isAvailable && mistralService.isServiceAvailable()
  }
}

export const articleSummaryService = new ArticleSummaryService()
export type { ArticleSummaryRequest, ArticleSummaryResponse }
