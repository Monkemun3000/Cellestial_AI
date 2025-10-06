import { useState, useRef, useEffect } from 'react'
import { Search, FileText, ExternalLink, Clock } from 'lucide-react'
import { searchRealNasaPublications, isRealNasaServiceInitialized } from '@/services/realNasaService'
import { articleSummaryService } from '@/services/articleSummaryService'
import { ArticleSummaryModal } from './ArticleSummaryModal'

interface DocumentResult {
  title: string
  link: string
  similarity_score?: number
  content_preview?: string
  has_content?: boolean
}

export function Documents() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<DocumentResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTime, setSearchTime] = useState(0)
  const [hasSearched, setHasSearched] = useState(false)
  const [summaryModal, setSummaryModal] = useState<{ isOpen: boolean; title: string; url: string }>({
    isOpen: false,
    title: '',
    url: ''
  })
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSearch = async () => {
    if (!query.trim() || isLoading) return

    setIsLoading(true)
    setHasSearched(true)
    const startTime = Date.now()

    try {
      // Check if the service is initialized
      if (!isRealNasaServiceInitialized()) {
        setResults([])
        return
      }

      // Search for documents
      const searchResults = searchRealNasaPublications(query.trim(), 5)
      setResults(searchResults)
      
      // Calculate search time
      const endTime = Date.now()
      setSearchTime(endTime - startTime)
    } catch (error) {
      console.error('Error searching documents:', error)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSearch()
    }
  }

  const handleSummarize = (title: string, url: string) => {
    setSummaryModal({
      isOpen: true,
      title,
      url
    })
  }

  const handleGenerateSummary = async (title: string, url: string) => {
    return await articleSummaryService.generateSummary({ title, url })
  }

  const handleClear = () => {
    setQuery('')
    setResults([])
    setHasSearched(false)
    setSearchTime(0)
    inputRef.current?.focus()
  }

  return (
    <div className="flex flex-col h-full bg-transparent">

      {/* Search Area */}
      <div className="p-4 sm:p-6 bg-transparent">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Search NASA documents (e.g., 'microgravity effects on bones', 'space radiation')"
              className="w-full px-3 sm:px-4 py-2 sm:py-3 pr-10 sm:pr-12 text-white bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent text-sm sm:text-base"
            />
            <button
              onClick={handleSearch}
              disabled={isLoading || !query.trim()}
              className="absolute right-1 sm:right-2 top-1/2 transform -translate-y-1/2 p-1.5 sm:p-2 rounded-xl bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Search className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              )}
            </button>
          </div>
          
          {hasSearched && (
            <div className="mt-4 flex items-center justify-between">
              <button
                onClick={handleClear}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Clear search
              </button>
              {searchTime > 0 && (
                <div className="flex items-center space-x-1 text-xs text-gray-400">
                  <Clock className="h-3 w-3" />
                  <span>{searchTime}ms</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-4 sm:pb-6">
        <div className="max-w-4xl mx-auto">
          {!hasSearched ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-white/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Search NASA Documents</h3>
              <p className="text-gray-400 max-w-md mx-auto">
                Enter a search query to find relevant NASA space biology research papers from our database of 600+ publications.
              </p>
            </div>
          ) : isLoading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
              <p className="text-white">Searching documents...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-12">
              <Search className="h-16 w-16 text-white/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No documents found</h3>
              <p className="text-gray-400 max-w-md mx-auto">
                Try different keywords or check your spelling. Our database contains research on microgravity, space radiation, bone loss, muscle atrophy, and more.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">
                  Found {results.length} document{results.length !== 1 ? 's' : ''}
                </h3>
                {searchTime > 0 && (
                  <div className="flex items-center space-x-1 text-sm text-gray-400">
                    <Clock className="h-4 w-4" />
                    <span>Searched in {searchTime}ms</span>
                  </div>
                )}
              </div>
              
              {results.map((result, index) => (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-colors"
                >
                  <div className="mb-3">
                    <h4 className="text-lg font-semibold text-white leading-tight">
                      {result.title}
                    </h4>
                  </div>
                  
                  {result.content_preview && (
                    <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                      {result.content_preview}
                    </p>
                  )}
                  
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                      <a
                        href={result.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span className="text-sm font-medium">View Document</span>
                      </a>
                      
                      <button
                        onClick={() => handleSummarize(result.title, result.link)}
                        className="inline-flex items-center space-x-2 text-green-400 hover:text-green-300 transition-colors"
                      >
                        <FileText className="h-4 w-4" />
                        <span className="text-sm font-medium">AI Summary</span>
                      </button>
                    </div>
                    
                    <div className="text-xs text-gray-400">
                      Source: NASA Research Database
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        </div>
        
        {/* Article Summary Modal */}
        <ArticleSummaryModal
          isOpen={summaryModal.isOpen}
          onClose={() => setSummaryModal({ isOpen: false, title: '', url: '' })}
          title={summaryModal.title}
          url={summaryModal.url}
          onGenerateSummary={handleGenerateSummary}
        />
      </div>
    )
  }
