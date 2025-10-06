import { useState, useEffect } from 'react'
import { Hash, ExternalLink, Clock, TrendingUp } from 'lucide-react'
import { searchRealNasaPublications, isRealNasaServiceInitialized } from '@/services/realNasaService'

interface TopicCategory {
  name: string
  description: string
  icon: string
  keywords: string[]
  color: string
}

interface DocumentResult {
  title: string
  link: string
  similarity_score?: number
  content_preview?: string
  has_content?: boolean
}

export function Topics() {
  const [topics, setTopics] = useState<TopicCategory[]>([])
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const [topicDocuments, setTopicDocuments] = useState<DocumentResult[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Define topic categories based on NASA space biology research
  const topicCategories: TopicCategory[] = [
    {
      name: "Microgravity Effects",
      description: "Research on how zero gravity affects biological systems",
      icon: "🌌",
      keywords: ["microgravity", "zero gravity", "space environment", "biological effects", "cellular changes"],
      color: "from-purple-500 to-indigo-600"
    },
    {
      name: "Muscle & Bone Loss",
      description: "Studies on muscle atrophy and bone density in space",
      icon: "💪",
      keywords: ["muscle atrophy", "bone loss", "osteoporosis", "muscle degeneration", "skeletal system"],
      color: "from-blue-500 to-cyan-600"
    },
    {
      name: "Cardiovascular Health",
      description: "Heart and circulatory system changes in space",
      icon: "❤️",
      keywords: ["cardiovascular", "heart function", "blood pressure", "circulation", "cardiac"],
      color: "from-red-500 to-pink-600"
    },
    {
      name: "Immune System",
      description: "How space affects immune function and disease resistance",
      icon: "🛡️",
      keywords: ["immune system", "immunity", "disease resistance", "white blood cells", "inflammation"],
      color: "from-green-500 to-emerald-600"
    },
    {
      name: "Radiation Effects",
      description: "Impact of cosmic radiation on biological systems",
      icon: "☢️",
      keywords: ["radiation", "cosmic rays", "DNA damage", "cellular radiation", "space radiation"],
      color: "from-yellow-500 to-orange-600"
    },
    {
      name: "Sleep & Circadian",
      description: "Sleep patterns and biological rhythms in space",
      icon: "😴",
      keywords: ["sleep", "circadian rhythm", "biological clock", "melatonin", "sleep disorders"],
      color: "from-indigo-500 to-purple-600"
    },
    {
      name: "Nutrition & Metabolism",
      description: "Food, nutrition, and metabolic changes in space",
      icon: "🍎",
      keywords: ["nutrition", "metabolism", "food", "vitamins", "diet", "metabolic changes"],
      color: "from-orange-500 to-red-600"
    },
    {
      name: "Vision & Eye Health",
      description: "Visual changes and eye health in space",
      icon: "👁️",
      keywords: ["vision", "eye health", "visual changes", "intracranial pressure", "optic nerve"],
      color: "from-teal-500 to-blue-600"
    }
  ]

  useEffect(() => {
    setTopics(topicCategories)
  }, [])

  const handleTopicClick = async (topic: TopicCategory) => {
    if (!isRealNasaServiceInitialized()) {
      setTopicDocuments([])
      return
    }

    setIsLoading(true)
    setSelectedTopic(topic.name)

    try {
      // Search for documents using the topic's keywords
      const allResults: DocumentResult[] = []
      
      for (const keyword of topic.keywords) {
        const results = searchRealNasaPublications(keyword, 3)
        allResults.push(...results)
      }

      // Remove duplicates and sort by relevance
      const uniqueResults = allResults.filter((result, index, self) => 
        index === self.findIndex(r => r.link === result.link)
      )

      // Sort by similarity score if available
      uniqueResults.sort((a, b) => (b.similarity_score || 0) - (a.similarity_score || 0))

      setTopicDocuments(uniqueResults.slice(0, 10)) // Top 10 results
    } catch (error) {
      console.error('Error searching topic documents:', error)
      setTopicDocuments([])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-transparent">
      {/* Header */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-white/30 backdrop-blur-md">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/95 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg shadow-black/50 border-2 border-white flex-shrink-0">
            <Hash className="h-6 w-6 sm:h-7 sm:w-7 text-black" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white">
              <span className="space-blue">NASA</span> Research Topics
            </h2>
            <p className="text-xs sm:text-sm text-gray-300">
              Explore categorized space biology research
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="max-w-6xl mx-auto">
          {!selectedTopic ? (
            // Topics Grid
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {topics.map((topic, index) => (
                <button
                  key={index}
                  onClick={() => handleTopicClick(topic)}
                  className="group relative p-4 sm:p-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl hover:bg-white/20 hover:border-white/30 transition-all duration-200 text-left"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${topic.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-200`} />
                  
                  <div className="relative">
                    <div className="text-2xl sm:text-3xl mb-3">{topic.icon}</div>
                    <h3 className="text-sm sm:text-base font-semibold text-white mb-2 group-hover:text-white transition-colors">
                      {topic.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-300 group-hover:text-gray-200 transition-colors">
                      {topic.description}
                    </p>
                    <div className="mt-3 flex items-center text-xs text-gray-400 group-hover:text-gray-300 transition-colors">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {topic.keywords.length} research areas
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            // Selected Topic Results
            <div>
              {/* Back Button */}
              <button
                onClick={() => setSelectedTopic(null)}
                className="mb-6 flex items-center text-gray-300 hover:text-white transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Topics
              </button>

              {/* Topic Header */}
              <div className="mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
                  {selectedTopic}
                </h2>
                <p className="text-gray-300">
                  Research papers and studies related to {selectedTopic.toLowerCase()}
                </p>
              </div>

              {/* Documents */}
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  <span className="ml-3 text-gray-300">Loading documents...</span>
                </div>
              ) : topicDocuments.length > 0 ? (
                <div className="space-y-4">
                  {topicDocuments.map((doc, index) => (
                    <div
                      key={index}
                      className="p-4 sm:p-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl hover:bg-white/15 hover:border-white/30 transition-all duration-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm sm:text-base font-semibold text-white mb-2 line-clamp-2">
                            {doc.title}
                          </h3>
                          {doc.content_preview && (
                            <p className="text-xs sm:text-sm text-gray-300 mb-3 line-clamp-3">
                              {doc.content_preview}
                            </p>
                          )}
                          <div className="flex items-center text-xs text-gray-400">
                            <Clock className="h-3 w-3 mr-1" />
                            NASA Research Paper
                          </div>
                        </div>
                        <a
                          href={doc.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-4 p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors flex-shrink-0"
                        >
                          <ExternalLink className="h-4 w-4 text-white" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-2">No documents found</div>
                  <p className="text-sm text-gray-500">
                    Try selecting a different topic or check back later
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
