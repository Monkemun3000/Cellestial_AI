import { ExternalLink, Calendar, User, FileText } from 'lucide-react'

interface ArticleCardProps {
  article: {
    title: string
    description: string
    url: string
    date_published?: string
    author?: string
    image_url?: string
  }
  onSummarize?: (title: string, url: string) => void
}

export function ArticleCard({ article, onSummarize }: ArticleCardProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Date not available'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="bg-white/90 dark:bg-cosmic-stellar/90 border border-bio-algae/30 dark:border-bio-algae/50 rounded-xl p-5 hover:shadow-lg hover:border-bio-algae/60 dark:hover:border-bio-algae/70 transition-all duration-200 group backdrop-blur-sm">
      <div className="flex space-x-5">
        {/* Article Image */}
        {article.image_url && (
          <div className="flex-shrink-0">
            <img
              src={article.image_url}
              alt={article.title}
              className="w-20 h-20 object-cover rounded-lg"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
              }}
            />
          </div>
        )}
        
        {/* Article Content */}
        <div className="flex-1 min-w-0 space-y-3">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-bio-forest dark:group-hover:text-accent-glow transition-colors">
            {article.title}
          </h3>
          
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed">
            {article.description}
          </p>
          
          {/* Article Metadata */}
          <div className="flex items-center space-x-5 text-xs text-gray-500 dark:text-gray-400">
            {article.date_published && (
              <div className="flex items-center space-x-2">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(article.date_published)}</span>
              </div>
            )}
            {article.author && (
              <div className="flex items-center space-x-2">
                <User className="h-3 w-3" />
                <span className="truncate">{article.author}</span>
              </div>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center space-x-4">
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 text-bio-forest dark:text-accent-glow hover:text-bio-moss dark:hover:text-bio-algae text-sm font-semibold transition-colors duration-200"
            >
              <span>Read full article</span>
              <ExternalLink className="h-3 w-3" />
            </a>
            
            {onSummarize && (
              <button
                onClick={() => onSummarize(article.title, article.url)}
                className="inline-flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-semibold transition-colors duration-200"
              >
                <FileText className="h-3 w-3" />
                <span>AI Summary</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
