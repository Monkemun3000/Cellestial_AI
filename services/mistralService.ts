import { HfInference } from '@huggingface/inference'

// Configuration
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY || 'your-api-key-here'
const MISTRAL_MODEL = 'mistralai/Mistral-7B-Instruct-v0.2'

// Initialize Hugging Face client
const hf = new HfInference(HUGGINGFACE_API_KEY)

interface NasaPublication {
  title: string
  link: string
  similarity_score?: number
  content_preview?: string
  has_content?: boolean
}

interface ConversationMessage {
  role: 'user' | 'assistant'
  content: string
}

class MistralService {
  private isAvailable: boolean = true

  constructor() {
    console.log('Mistral 7B service initialized with model:', MISTRAL_MODEL)
  }

  isServiceAvailable(): boolean {
    return this.isAvailable
  }

  async generateResponse(userMessage: string, searchResults: NasaPublication[] = [], conversationHistory: ConversationMessage[] = []): Promise<string | null> {
    if (!this.isServiceAvailable()) {
      return null
    }

    try {
      // Check if we have relevant NASA data
      const hasRelevantData = searchResults && searchResults.length > 0

      // Create context from search results
      let context = ""
      if (hasRelevantData) {
        context = "Based on the following NASA space biology research papers:\n\n"
        for (let i = 0; i < Math.min(searchResults.length, 3); i++) {
          const result = searchResults[i]
          context += `Source ${i + 1}: ${result.title}\n`
          context += `   Link: ${result.link}\n`
          if (result.content_preview) {
            context += `   Content: ${result.content_preview.substring(0, 600)}...\n`
          }
        }
        context += "\nWhen referencing these sources in your response, use 'Source 1', 'Source 2', etc. or the paper title names.\n\n"
      }

      // Create different system messages based on data availability
      let systemMessage: string
      if (hasRelevantData) {
        systemMessage = `You are Cellestial AI, a NASA bioscience assistant specializing in space biology research. You have access to a database of 600+ research papers about space biology, microgravity effects, space radiation, and related topics.

Your primary role is to ANSWER THE USER'S QUESTION directly and comprehensively. Use the NASA research context as supporting evidence, but focus on providing a clear, informative answer to what the user is asking.

You are having a conversation with the user, so you can reference previous questions and answers in your responses. Maintain context throughout the conversation and build upon previous discussions.

IMPORTANT: If this is a follow-up question or the user is asking for clarification about something mentioned earlier, acknowledge the previous context and build upon it. For example, if the user asks "What about the effects on muscles?" after discussing bone loss, you should reference the previous discussion about bone loss and then discuss muscle effects.

RESPONSE STRUCTURE:
1. Start by directly answering the user's question
2. Use NASA research findings to support your answer with specific data, percentages, or conclusions
3. Explain the practical implications or significance
4. Keep source citations brief and integrated naturally into your response
5. At the end, include a "Sources:" section listing the research papers by their title names (do not include links)

DO NOT:
- Lead with source summaries
- List papers without connecting them to the user's question
- Focus on describing what the papers contain rather than answering the question

DO:
- Answer the question first and foremost
- Use research findings to support your answer
- Make connections between different studies when relevant
- Provide practical insights and implications

Focus on topics like:
- Effects of microgravity on human physiology
- Space radiation and biological impacts
- Plant growth in space environments
- Bone and muscle loss in astronauts
- Immune system changes during spaceflight
- Cardiovascular and neurological effects
- Countermeasures and space medicine`
      } else {
        systemMessage = `You are Cellestial AI, a NASA bioscience assistant. However, no relevant NASA space biology research was found in our database for this question.

Your role is to provide a helpful response based on your general knowledge, but you must clearly indicate that this information is not from NASA research data.

IMPORTANT: Start your response with: "No relevant NASA space biology research found in our database for this question. However, I can provide some general information:"

Then provide a helpful response based on your knowledge, but make it clear this is general information, not from NASA research.

Do NOT include a "Sources:" section since no NASA research papers are available.`
      }

      // Build conversation messages
      const messages = [
        { role: 'system', content: systemMessage }
      ]

      // Add conversation history (limit to last 10 messages to avoid token limits)
      const recentHistory = conversationHistory.slice(-10)
      console.log('Adding conversation history:', recentHistory.length, 'messages')
      for (const msg of recentHistory) {
        console.log('Adding message:', msg.role, msg.content.substring(0, 50) + '...')
        messages.push({
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: msg.content
        })
      }

      // Add current user message with context
      const userContent = `${context}User Question: ${userMessage}`
      messages.push({ role: 'user', content: userContent })

      console.log(`Calling Mistral 7B API for query: ${userMessage.substring(0, 50)}... (with ${conversationHistory.length} previous messages)`)
      console.log('Messages being sent to API:', JSON.stringify(messages, null, 2))

      // Make the API call using chat completion
      const response = await hf.chatCompletion({
        model: MISTRAL_MODEL,
        messages: messages,
        max_tokens: 750,
        temperature: 0.7
      })

      if (response && response.choices && response.choices.length > 0) {
        const generatedText = response.choices[0].message?.content?.trim()
        
        if (generatedText) {
          console.log(`Mistral 7B response generated successfully (${generatedText.length} chars)`)
          return generatedText
        }
      }

      console.log('Mistral 7B API returned empty response')
      return null

    } catch (error) {
      console.error('Mistral 7B API error:', error)
      this.isAvailable = false
      
      // Check if it's a rate limit or inference limit error
      const errorMessage = error instanceof Error ? error.message : String(error)
      if (errorMessage.includes('rate limit') || errorMessage.includes('quota') || errorMessage.includes('limit') || errorMessage.includes('inference')) {
        console.log('Mistral API hit inference limits - returning special error message')
        return 'API_LIMIT_ERROR' // Special return value to indicate inference limits
      }
      
      return null
    }
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    if (!this.isServiceAvailable()) {
      return { success: false, message: 'Mistral service not available' }
    }

    try {
      const response = await hf.chatCompletion({
        model: MISTRAL_MODEL,
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: 'Hello, this is a test.' }
        ],
        max_tokens: 10,
        temperature: 0.1
      })

      if (response && response.choices && response.choices.length > 0) {
        return { success: true, message: 'Mistral 7B API connection successful' }
      } else {
        return { success: false, message: 'API returned empty response' }
      }

    } catch (error) {
      return { success: false, message: `Connection test failed: ${error}` }
    }
  }

  async generateSummary(content: string, systemPrompt: string): Promise<string | null> {
    if (!this.isServiceAvailable()) {
      return null
    }

    try {
      const messages = [
        { role: 'system' as const, content: systemPrompt },
        { role: 'user' as const, content: `Please summarize this article:\n\n${content}` }
      ]

      console.log(`Generating summary for content (${content.length} chars)...`)

      const response = await hf.chatCompletion({
        model: MISTRAL_MODEL,
        messages: messages,
        max_tokens: 1000,
        temperature: 0.5
      })

      if (response && response.choices && response.choices.length > 0) {
        const summary = response.choices[0].message?.content?.trim()
        
        if (summary) {
          console.log(`Summary generated successfully (${summary.length} chars)`)
          return summary
        }
      }
      
      console.log("Summary generation returned empty response")
      return null
      
    } catch (error) {
      console.error(`Error generating summary: ${error}`)
      this.isAvailable = false
      return null
    }
  }

  async testConversationContext(): Promise<{ success: boolean; message: string }> {
    if (!this.isServiceAvailable()) {
      return { success: false, message: 'Mistral service not available' }
    }

    try {
      const testHistory: ConversationMessage[] = [
        { role: 'user', content: 'What is microgravity?' },
        { role: 'assistant', content: 'Microgravity is the condition of apparent weightlessness experienced in space.' }
      ]

      const response = await this.generateResponse('What about its effects on bones?', [], testHistory)
      
      if (response && response.includes('microgravity') && response.includes('bone')) {
        return { success: true, message: 'Conversation context test successful - AI referenced previous context' }
      } else {
        return { success: false, message: 'Conversation context test failed - AI did not reference previous context' }
      }

    } catch (error) {
      return { success: false, message: `Conversation context test failed: ${error}` }
    }
  }
}

// Create and export a singleton instance
export const mistralService = new MistralService()
