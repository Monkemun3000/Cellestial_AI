import axios from 'axios'
import { 
  initializeRealNasaService, 
  searchRealNasaPublications, 
  isRealNasaServiceInitialized 
} from './realNasaService'
import { mistralService } from './mistralService'

// NASA API endpoints
const NASA_API_BASE = 'https://api.nasa.gov'
const NASA_API_KEY = 'DEMO_KEY' // In production, use environment variable

interface NASAArticle {
  title: string
  description: string
  url: string
  date_published?: string
  author?: string
  image_url?: string
}

interface AIResponse {
  content: string
  articles: NASAArticle[]
}

class NASAService {
  // Initialize the real NASA service and test Mistral AI
  async initializeService(): Promise<void> {
    try {
      await initializeRealNasaService()
      
      // Test Mistral AI connection
      if (mistralService.isServiceAvailable()) {
        console.log('Testing Mistral 7B API connection...')
        const testResult = await mistralService.testConnection()
        if (testResult.success) {
          console.log('✅ Mistral 7B API is ready!')
          
          // Test conversation context
          console.log('Testing conversation context...')
          const contextTest = await mistralService.testConversationContext()
          if (contextTest.success) {
            console.log('✅ Conversation context is working!')
          } else {
            console.warn('⚠️ Conversation context test failed:', contextTest.message)
          }
        } else {
          console.warn('⚠️ Mistral 7B API test failed:', testResult.message)
        }
      } else {
        console.warn('⚠️ Mistral 7B service is not available')
      }
    } catch (error) {
      console.error('Error initializing services:', error)
    }
  }

  // Fetch NASA articles based on query using real NASA publications
  async searchArticles(query: string): Promise<NASAArticle[]> {
    try {
      // First try to get real NASA publications
      if (isRealNasaServiceInitialized()) {
        const realArticles = searchRealNasaPublications(query, 5)
        
        if (realArticles.length > 0) {
          return realArticles.map(article => ({
            title: article.title,
            description: article.content_preview || article.title,
            url: article.link,
            date_published: undefined,
            author: 'NASA Research',
            image_url: undefined
          }))
        }
      }

      // Fallback to original NASA APIs if no real articles found
      const [apodResponse, newsResponse] = await Promise.all([
        this.getAPOD(),
        this.getNews(query)
      ])

      const articles: NASAArticle[] = []

      // Add APOD as featured content
      if (apodResponse) {
        articles.push({
          title: apodResponse.title,
          description: apodResponse.explanation,
          url: apodResponse.url,
          date_published: apodResponse.date,
          image_url: apodResponse.hdurl || apodResponse.url
        })
      }

      // Add news articles
      if (newsResponse && newsResponse.items) {
        newsResponse.items.slice(0, 3).forEach((item: any) => {
          articles.push({
            title: item.title,
            description: item.description,
            url: item.link,
            date_published: item.pubDate,
            author: item.author
          })
        })
      }

      return articles
    } catch (error) {
      console.error('Error fetching NASA articles:', error)
      return []
    }
  }

  // Get Astronomy Picture of the Day
  private async getAPOD() {
    try {
      const response = await axios.get(`${NASA_API_BASE}/planetary/apod`, {
        params: { api_key: NASA_API_KEY }
      })
      return response.data
    } catch (error) {
      console.error('Error fetching APOD:', error)
      return null
    }
  }

  // Get NASA news (using a news API as NASA doesn't have a direct news API)
  private async getNews(query: string) {
    try {
      // For demo purposes, we'll simulate news data
      // In a real implementation, you might use NASA's RSS feeds or other news APIs
      return {
        items: [
          {
            title: "NASA's James Webb Space Telescope Discovers New Exoplanet",
            description: "The James Webb Space Telescope has identified a new exoplanet with potential for habitability, expanding our understanding of planetary systems.",
            link: "https://www.nasa.gov/webb-telescope-exoplanet-discovery",
            pubDate: new Date().toISOString(),
            author: "NASA Science Team"
          },
          {
            title: "Mars Rover Perseverance Finds Evidence of Ancient Water",
            description: "New data from the Perseverance rover suggests the presence of ancient water systems on Mars, providing clues about the planet's past habitability.",
            link: "https://www.nasa.gov/perseverance-water-evidence",
            pubDate: new Date(Date.now() - 86400000).toISOString(),
            author: "NASA Mars Exploration Program"
          },
          {
            title: "Artemis Program Prepares for Moon Landing Mission",
            description: "NASA's Artemis program is making significant progress toward returning humans to the Moon, with new technologies and mission planning underway.",
            link: "https://www.nasa.gov/artemis-moon-mission",
            pubDate: new Date(Date.now() - 172800000).toISOString(),
            author: "NASA Artemis Team"
          }
        ]
      }
    } catch (error) {
      console.error('Error fetching news:', error)
      return null
    }
  }

  // Generate AI response using Mistral AI with NASA research context
  async getAIResponse(query: string, conversationHistory: Array<{role: 'user' | 'assistant', content: string}> = []): Promise<AIResponse> {
    try {
      // Get relevant NASA research articles
      const articles = await this.searchArticles(query)
      
      // Convert articles to the format expected by Mistral service
      const searchResults = articles.map(article => ({
        title: article.title,
        link: article.url,
        similarity_score: 0.8, // Default score since we're using real NASA data
        content_preview: article.description,
        has_content: true
      }))
      
      // Use Mistral AI to generate response
      if (mistralService.isServiceAvailable()) {
        console.log('Using Mistral 7B API for response...')
        console.log('Conversation history passed to Mistral:', conversationHistory.length, 'messages')
        const mistralResponse = await mistralService.generateResponse(query, searchResults, conversationHistory)
        
        if (mistralResponse) {
          // Check if Mistral returned a special error message for API limits
          if (mistralResponse === 'API_LIMIT_ERROR') {
            return {
              content: "The AI model is currently unavailable due to inference client limits. However, I can still provide you with relevant NASA research sources below. Please try again later for AI-generated responses.",
              articles: articles.slice(0, 3)
            }
          }
          
          return {
            content: mistralResponse,
            articles: articles.slice(0, 3) // Return top 3 most relevant articles
          }
        }
      }
      
      // Fallback to simple response if Mistral fails
      const content = this.generateFallbackResponse(query, articles)
      
      return {
        content,
        articles: articles.slice(0, 3)
      }
    } catch (error) {
      console.error('Error generating AI response:', error)
      return {
        content: "I'm sorry, I'm having trouble accessing NASA's latest information right now. Please try again in a moment.",
        articles: []
      }
    }
  }

  // Fallback response generation when Mistral AI is not available
  private generateFallbackResponse(query: string, articles: NASAArticle[]): string {
    const lowerQuery = query.toLowerCase()
    
    // Check for specific topics and provide relevant responses
    if (lowerQuery.includes('mars') || lowerQuery.includes('rover')) {
      return `Based on the latest NASA data, Mars continues to be a fascinating subject of exploration. The Perseverance rover has been making incredible discoveries about the Red Planet's geological history and potential for past life. Here are some recent findings that might interest you:`
    }
    
    if (lowerQuery.includes('james webb') || lowerQuery.includes('telescope')) {
      return `The James Webb Space Telescope is revolutionizing our understanding of the universe! It's providing unprecedented views of distant galaxies, exoplanets, and stellar nurseries. Here's what NASA's latest observations have revealed:`
    }
    
    if (lowerQuery.includes('moon') || lowerQuery.includes('artemis')) {
      return `NASA's Artemis program is paving the way for humanity's return to the Moon! This ambitious program aims to establish a sustainable human presence on the lunar surface. Here are the latest updates on this exciting mission:`
    }
    
    if (lowerQuery.includes('exoplanet') || lowerQuery.includes('planet')) {
      return `The search for exoplanets is one of NASA's most exciting endeavors! With advanced telescopes and detection methods, we're discovering new worlds beyond our solar system. Here's what the latest research has uncovered:`
    }
    
    if (lowerQuery.includes('space') || lowerQuery.includes('astronomy')) {
      return `Space exploration continues to push the boundaries of human knowledge! From deep space observations to planetary missions, NASA is at the forefront of discovery. Here are some of the most recent and exciting developments:`
    }
    
    // Default response
    return `That's a great question about space and astronomy! NASA's ongoing missions and research are constantly expanding our understanding of the universe. Here are some recent articles and discoveries that might help answer your question:`
  }
}

export const nasaService = new NASAService()

