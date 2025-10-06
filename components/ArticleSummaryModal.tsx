'use client'

import { useState } from 'react'
import { X, FileText, Loader2, AlertCircle, AlertTriangle } from 'lucide-react'

interface ArticleSummaryModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  url: string
  onGenerateSummary: (title: string, url: string) => Promise<{ summary: string; success: boolean; error?: string }>
}

export function ArticleSummaryModal({ 
  isOpen, 
  onClose, 
  title, 
  url, 
  onGenerateSummary 
}: ArticleSummaryModalProps) {
  const [summary, setSummary] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [hasGenerated, setHasGenerated] = useState(false)

  const handleGenerateSummary = async () => {
    setIsLoading(true)
    setError('')
    setSummary('')
    
    try {
      const result = await onGenerateSummary(title, url)
      
      if (result.success) {
        setSummary(result.summary)
        setHasGenerated(true)
      } else {
        setError(result.error || 'Failed to generate summary')
      }
    } catch (err) {
      setError('An unexpected error occurred')
      console.error('Error generating summary:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setSummary('')
    setError('')
    setHasGenerated(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full mx-2 sm:mx-4 max-h-[90vh] sm:max-h-[80vh] flex flex-col opacity-100">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center flex-shrink-0">
              <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                Article Summary
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                {title}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-white dark:bg-gray-800">
          {!hasGenerated && !isLoading && !error && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Generate AI Summary
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                Click the button below to fetch the full article and generate an AI-powered summary using Mistral 7B.
              </p>
              
              {/* Warning Section */}
              <div className="mb-6 max-w-md mx-auto">
                <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-3 sm:p-4">
                  <div className="flex items-start space-x-2 sm:space-x-3">
                    <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 mt-0.5" style={{color: '#dc2626'}} />
                    <div>
                      <h4 className="text-xs sm:text-sm font-semibold text-red-600 dark:text-red-400 mb-1" style={{color: '#dc2626'}}>
                        Usage Warning
                      </h4>
                      <p className="text-xs leading-relaxed" style={{color: '#dc2626'}}>
                        AI summaries are generated using external services with usage limits. 
                        Excessive use may temporarily disable the AI summary feature. 
                        Please use responsibly.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleGenerateSummary}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
              >
                Generate Summary
              </button>
            </div>
          )}

          {isLoading && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Loader2 className="h-8 w-8 text-blue-600 dark:text-blue-400 animate-spin" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Generating Summary...
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Fetching article content and processing with AI. This may take a moment.
              </p>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Error Generating Summary
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {error}
              </p>
              <button
                onClick={handleGenerateSummary}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {summary && (
            <div>
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  AI-Generated Summary
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Generated by Mistral 7B AI model
                </p>
              </div>
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                  <p className="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                    {summary}
                  </p>
                </div>
              </div>
              <div className="mt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm sm:text-base"
                >
                  Read Full Article →
                </a>
                <button
                  onClick={handleGenerateSummary}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors text-sm sm:text-base w-full sm:w-auto"
                >
                  Regenerate
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
