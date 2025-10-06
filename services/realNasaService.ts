// NASA publication data structure
interface NasaPublication {
  title: string
  link: string
  similarity_score?: number
  content_preview?: string
  has_content?: boolean
}

// Scraped article data structure
interface ScrapedArticle {
  title: string
  url: string
  pmc_id: string
  content: string
  content_length: number
  scraped_date: string
}

// Cache for scraped content
const articleCache = new Map<string, string>()

// Load NASA publications data
let nasaPublications: Array<{Title: string, Link: string}> = []
let scrapedArticles: Map<string, ScrapedArticle> = new Map()

// Initialize the service
export async function initializeRealNasaService() {
  try {
    // Load the CSV data
    const response = await fetch('/SB_publication_PMC.csv')
    const csvText = await response.text()
    
    // Parse CSV
    const lines = csvText.split('\n')
    
    nasaPublications = []
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (line) {
        // Simple CSV parsing - find the last comma to separate title and link
        const lastCommaIndex = line.lastIndexOf(',')
        if (lastCommaIndex > 0) {
          const title = line.substring(0, lastCommaIndex).replace(/"/g, '').trim()
          const link = line.substring(lastCommaIndex + 1).replace(/"/g, '').trim()
          
          if (title && link) {
            nasaPublications.push({
              Title: title,
              Link: link
            })
          }
        }
      }
    }
    
    console.log(`Loaded ${nasaPublications.length} NASA publications`)
    
    // Load scraped articles
    try {
      const scrapedFiles = [
        'PMC10020673.json', 'PMC10025027.json', 'PMC10027818.json', 
        'PMC10030976.json', 'PMC10058394.json'
      ] // Start with a few files for testing
      
      for (const filename of scrapedFiles) {
        try {
          const response = await fetch(`/scraped_articles/${filename}`)
          if (response.ok) {
            const article: ScrapedArticle = await response.json()
            scrapedArticles.set(article.url, article)
          }
        } catch (error) {
          console.warn(`Failed to load scraped article ${filename}:`, error)
        }
      }
      
      console.log(`Loaded ${scrapedArticles.size} scraped articles`)
    } catch (error) {
      console.warn('Failed to load scraped articles:', error)
    }
    
    return true
  } catch (error) {
    console.error('Error initializing real NASA service:', error)
    return false
  }
}

// Search for relevant NASA publications using keyword matching
export function searchRealNasaPublications(query: string, topK: number = 5): NasaPublication[] {
  if (!nasaPublications.length) {
    console.warn('Real NASA service not initialized')
    return []
  }
  
  try {
    const queryLower = query.toLowerCase()
    const queryWords = queryLower.split(/\s+/).filter(word => word.length > 2)
    
    const results: NasaPublication[] = []
    
    for (const publication of nasaPublications) {
      const titleLower = publication.Title.toLowerCase()
      let score = 0
      let exactMatches = 0
      
      // Get scraped content if available
      const scrapedArticle = scrapedArticles.get(publication.Link)
      let searchContent = titleLower
      
      if (scrapedArticle && scrapedArticle.content) {
        // Use title + first 3000 characters of content (similar to NASA hackathon)
        const contentPreview = scrapedArticle.content.substring(0, 3000).toLowerCase()
        searchContent = titleLower + " " + contentPreview
      }
      
      // Calculate relevance score on combined content
      for (const word of queryWords) {
        if (searchContent.includes(word)) {
          score += 1
          // Bonus for exact word matches
          const wordRegex = new RegExp(`\\b${word}\\b`, 'i')
          if (wordRegex.test(searchContent)) {
            exactMatches += 1
            score += 0.5 // Bonus for exact matches
          }
        }
      }
      
      // Calculate final similarity score (normalize to 0-1 range, but make it more meaningful)
      // Use a combination of match ratio and absolute score to get better percentages
      const matchRatio = score / Math.max(queryWords.length, 1)
      const absoluteScore = Math.min(score / 3, 1) // Cap at 3 matches for 100%
      const similarityScore = Math.max(matchRatio, absoluteScore)
      
      if (similarityScore > 0) {
        results.push({
          title: publication.Title,
          link: publication.Link,
          similarity_score: similarityScore,
          content_preview: getContentPreview(publication.Title, scrapedArticle),
          has_content: true
        })
      }
    }
    
    // Sort by similarity score and return top k
    results.sort((a, b) => (b.similarity_score || 0) - (a.similarity_score || 0))
    return results.slice(0, topK)
  } catch (error) {
    console.error('Error searching NASA publications:', error)
    return []
  }
}

// Fallback keyword search (simpler version)
export function keywordSearchNasaPublications(query: string, topK: number = 5): NasaPublication[] {
  return searchRealNasaPublications(query, topK)
}

// Helper function to get content preview
function getContentPreview(title: string, scrapedArticle?: ScrapedArticle): string {
  if (scrapedArticle && scrapedArticle.content) {
    // Use first 500 characters of scraped content for preview
    const contentPreview = scrapedArticle.content.substring(0, 500)
    return contentPreview.length > 500 ? contentPreview + '...' : contentPreview
  }
  // Fallback to title
  return title.length > 200 ? title.substring(0, 200) + '...' : title
}

// Get cached article content
export function getCachedArticleContent(url: string): string {
  return articleCache.get(url) || ''
}

// Cache article content
export function cacheArticleContent(url: string, content: string): void {
  articleCache.set(url, content)
}

// Get all NASA publications
export function getAllNasaPublications(): Array<{Title: string, Link: string}> {
  return nasaPublications
}

// Check if service is initialized
export function isRealNasaServiceInitialized(): boolean {
  return nasaPublications.length > 0
}
