'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Bot, Globe, Menu, Settings, PanelLeft, MessageSquare, FileText, Search, Hash } from 'lucide-react'
import { ChatMessage } from '@/components/ChatMessage'
import { ArticleCard } from '@/components/ArticleCard'
import { Sidebar } from '@/components/Sidebar'
import { ThinkingAnimation } from '@/components/ThinkingAnimation'
import { Settings as SettingsComponent } from '@/components/Settings'
import { Documents } from '@/components/Documents'
import { Topics } from '@/components/Topics'
import { ArticleSummaryModal } from '@/components/ArticleSummaryModal'
import { nasaService } from '@/services/nasaService'
import { articleSummaryService } from '@/services/articleSummaryService'
import { chatStorage, type Chat, type Message } from '@/services/chatStorage'
import { useTheme } from '@/contexts/ThemeContext'

// Message interface is now imported from chatStorage

export default function Home() {
  const { backgroundImage } = useTheme()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: `msg_${Date.now()}_${Math.floor(Math.random() * 100)}`,
      content: "Hello! I'm Cellestial AI, your cosmic companion. I can help you explore the latest NASA articles and answer questions about space exploration, astronomy, and scientific discoveries. What would you like to know about the universe?",
      sender: 'bot',
      timestamp: new Date(),
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarHidden, setSidebarHidden] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [currentChatId, setCurrentChatId] = useState(`chat_${Date.now()}_${Math.floor(Math.random() * 1000)}`)
  const [sidebarRefreshTrigger, setSidebarRefreshTrigger] = useState(0)
  const [currentThinkingTime, setCurrentThinkingTime] = useState(0)
  const [activeTab, setActiveTab] = useState<'chat' | 'documents' | 'topics'>('chat')
  const [summaryModal, setSummaryModal] = useState<{ isOpen: boolean; title: string; url: string }>({
    isOpen: false,
    title: '',
    url: ''
  })
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const thinkingTimerRef = useRef<NodeJS.Timeout | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const startThinkingTimer = () => {
    setCurrentThinkingTime(0)
    thinkingTimerRef.current = setInterval(() => {
      setCurrentThinkingTime(prev => prev + 100) // Update every 100ms
    }, 100)
  }

  const stopThinkingTimer = () => {
    if (thinkingTimerRef.current) {
      clearInterval(thinkingTimerRef.current)
      thinkingTimerRef.current = null
    }
    setCurrentThinkingTime(0)
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (thinkingTimerRef.current) {
        clearInterval(thinkingTimerRef.current)
      }
    }
  }, [])

  // Initialize the first chat if it doesn't exist
  useEffect(() => {
    const existingChats = chatStorage.getChats()
    if (existingChats.length === 0) {
      // Save the initial welcome message as the first chat
      const initialChat: Chat = {
        id: currentChatId,
        title: 'Welcome to Cellestial AI',
        lastMessage: messages[0]?.content || '',
        messages: messages
      }
      chatStorage.saveChat(initialChat)
      setSidebarRefreshTrigger(prev => prev + 1)
    }
  }, [])

  // Initialize the real NASA service
  useEffect(() => {
    const initializeNasaService = async () => {
      try {
        await nasaService.initializeService()
        console.log('Real NASA service initialized successfully')
      } catch (error) {
        console.error('Failed to initialize real NASA service:', error)
      }
    }
    
    initializeNasaService()
  }, [])

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

        const userMessage: Message = {
          id: `msg_${Date.now()}_${Math.floor(Math.random() * 100)}`,
          content: inputValue,
          sender: 'user',
          timestamp: new Date(),
        }

    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInputValue('')
    setIsLoading(true)
    startThinkingTimer()
    
    // Keep focus on textarea after sending message
    setTimeout(() => {
      textareaRef.current?.focus()
    }, 0)

    // Save user message to storage
    chatStorage.addMessage(currentChatId, userMessage)
    
    // Trigger sidebar refresh to update chat title and last message
    setSidebarRefreshTrigger(prev => prev + 1)

    // Start timing the AI response
    const startTime = Date.now()

    try {
      
      // Build conversation history for context from the newMessages array (which includes the current user message)
      const conversationHistory = newMessages.map(msg => ({
        role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
        content: msg.content
      }))

      console.log('Conversation history being sent:', conversationHistory)

      // Get AI response with conversation context
      const response = await nasaService.getAIResponse(inputValue, conversationHistory)
      
      // Calculate thinking time
      const thinkingTime = Date.now() - startTime
      
          const botMessage: Message = {
            id: `msg_${Date.now()}_${Math.floor(Math.random() * 100)}`,
            content: response.content,
            sender: 'bot',
            timestamp: new Date(),
            articles: response.articles,
            thinkingTime: thinkingTime,
          }

      const finalMessages = [...newMessages, botMessage]
      setMessages(finalMessages)
      
      // Save bot message to storage
      chatStorage.addMessage(currentChatId, botMessage)
      
      // Trigger sidebar refresh to update last message
      setSidebarRefreshTrigger(prev => prev + 1)
      
      // Stop the thinking timer
      stopThinkingTimer()
      
      // Refocus textarea after AI response
      setTimeout(() => {
        textareaRef.current?.focus()
      }, 100)
    } catch (error) {
      console.error('Error getting AI response:', error)
      
      // Calculate thinking time even for errors
      const thinkingTime = Date.now() - startTime
      
          const errorMessage: Message = {
            id: `msg_${Date.now()}_${Math.floor(Math.random() * 100)}`,
            content: "I'm sorry, I encountered an error while processing your request. Please try again.",
            sender: 'bot',
            timestamp: new Date(),
            thinkingTime: thinkingTime,
          }
      
      const finalMessages = [...newMessages, errorMessage]
      setMessages(finalMessages)
      
      // Save error message to storage
      chatStorage.addMessage(currentChatId, errorMessage)
      
      // Trigger sidebar refresh to update last message
      setSidebarRefreshTrigger(prev => prev + 1)
      
      // Stop the thinking timer
      stopThinkingTimer()
      
      // Refocus textarea after error
      setTimeout(() => {
        textareaRef.current?.focus()
      }, 100)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
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

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value)
    
    // Auto-resize textarea
    const textarea = e.target
    textarea.style.height = 'auto'
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px'
  }

  const handleNewChat = () => {
    // Generate a unique chat ID using timestamp + random number
    const timestamp = Date.now()
    const randomSuffix = Math.floor(Math.random() * 1000)
    const newChatId = `chat_${timestamp}_${randomSuffix}`
    
    const welcomeMessage: Message = {
      id: `msg_${Date.now()}_${Math.floor(Math.random() * 100)}`,
      content: "Hello! I'm Cellestial AI, your cosmic companion. I can help you explore the latest NASA articles and answer questions about space exploration, astronomy, and scientific discoveries. What would you like to know about the universe?",
      sender: 'bot',
      timestamp: new Date(),
    }
    
    setMessages([welcomeMessage])
    setCurrentChatId(newChatId)
    setSidebarOpen(false)
    
        // Create new chat in storage
        const newChat: Chat = {
          id: newChatId,
          title: 'New Chat',
          lastMessage: welcomeMessage.content,
          messages: [welcomeMessage]
        }
    chatStorage.saveChat(newChat)
    
    // Trigger sidebar refresh
    setSidebarRefreshTrigger(prev => prev + 1)
  }

  const handleSelectChat = (chatId: string) => {
    setCurrentChatId(chatId)
    setSidebarOpen(false)
  }

  const handleLoadChat = (chat: Chat) => {
    setMessages(chat.messages)
    setCurrentChatId(chat.id)
    setSidebarOpen(false)
  }


  return (
    <div className="flex h-screen bg-transparent overflow-hidden chat-container">
          {/* Sidebar */}
          {!sidebarHidden && (
            <Sidebar
              isOpen={sidebarOpen}
              onToggle={() => setSidebarOpen(!sidebarOpen)}
              onNewChat={handleNewChat}
              onSelectChat={handleSelectChat}
              onLoadChat={handleLoadChat}
              currentChatId={currentChatId}
              refreshTrigger={sidebarRefreshTrigger}
              onHide={() => setSidebarHidden(true)}
            />
          )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-0 bg-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-black/5 lg:border-l lg:border-white/10 main-content-distinct h-screen overflow-hidden">
            {/* Header */}
            <header className="px-3 sm:px-6 py-3 sm:py-4 border-b border-white/30 backdrop-blur-md h-16 flex items-center">
              <div className="max-w-4xl mx-auto flex items-center justify-between w-full">
                <div className="flex items-center space-x-2 sm:space-x-4 flex-1 min-w-0">
                  <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="lg:hidden p-2 rounded-2xl hover:bg-bio-cell/10 dark:hover:bg-bio-cell/20 transition-colors flex-shrink-0"
                  >
                    <Menu className="h-5 w-5 text-white" />
                  </button>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/95 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg shadow-black/50 border-2 border-white flex-shrink-0">
                    <Bot className="h-6 w-6 sm:h-7 sm:w-7 text-black" />
                  </div>
                  <div className="space-y-0.5 sm:space-y-1 min-w-0 flex-1">
                    <h1 className="text-base sm:text-xl font-bold text-white truncate">
                      <span className="cellestial-cell-brand">Cell</span><span className="cellestial-ai-brand">estial AI</span>
                    </h1>
                  </div>
                </div>
                
                {/* Mode Switch */}
                <div className="hidden sm:flex items-center bg-white/10 backdrop-blur-md rounded-2xl p-1 mx-4 relative">
                  {/* Sliding Background */}
                  <div 
                    className={`absolute top-1 bottom-1 bg-white/30 rounded-xl shadow-lg shadow-white/20 border border-white/40 transition-all duration-300 ease-in-out ${
                      (activeTab as string) === 'chat' 
                        ? 'left-1 w-[calc(33.333%-0.125rem)]' 
                        : (activeTab as string) === 'documents'
                        ? 'left-[calc(33.333%+0.125rem)] w-[calc(33.333%-0.125rem)]'
                        : 'left-[calc(66.666%+0.125rem)] w-[calc(33.333%-0.125rem)]'
                    }`}
                  />
                  
                  <button
                    onClick={() => setActiveTab('chat')}
                    className={`relative flex items-center space-x-1.5 px-3 py-1.5 rounded-xl transition-colors duration-200 z-10 ${
                      (activeTab as string) === 'chat'
                        ? 'text-white'
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    <MessageSquare className="h-3 w-3" />
                    <span className="text-xs font-medium">Chat</span>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('documents')}
                    className={`relative flex items-center space-x-1.5 px-3 py-1.5 rounded-xl transition-colors duration-200 z-10 ${
                      (activeTab as string) === 'documents'
                        ? 'text-white'
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    <Search className="h-3 w-3" />
                    <span className="text-xs font-medium">Search</span>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('topics')}
                    className={`relative flex items-center space-x-1.5 px-3 py-1.5 rounded-xl transition-colors duration-200 z-10 ${
                      (activeTab as string) === 'topics'
                        ? 'text-white'
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    <Hash className="h-3 w-3" />
                    <span className="text-xs font-medium">Topics</span>
                  </button>
                </div>
                
                <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
                  <div className="hidden sm:flex items-center space-x-3 text-white">
                    <div className="w-4 h-4 bg-green-500 rounded-full online-dot shadow-lg shadow-green-500/70 border-2 border-green-400" style={{backgroundColor: '#10b981', opacity: 1}}></div>
                    <span className="text-sm font-semibold text-white">Online</span>
                  </div>
                  <button 
                    onClick={() => setSettingsOpen(true)}
                    className="p-2 rounded-2xl hover:bg-bio-cell/10 transition-colors"
                    title="Settings"
                  >
                    <Settings className="h-5 w-5 text-white" />
                  </button>
                </div>
              </div>
            </header>

            {/* Main Content Container */}
            <div className="flex-1 flex flex-col bg-transparent min-h-0">
              {(activeTab as string) === 'chat' ? (
                <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full bg-transparent min-h-0">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8 min-h-0 bg-transparent chat-messages-area">
                {messages.map((message) => (
                  <div key={message.id} className="animate-fade-in">
                    <ChatMessage message={message} />
                    {message.articles && message.articles.length > 0 && (
                      <div className="mt-8 space-y-5">
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center mb-4">
                          <Globe className="h-4 w-4 mr-3" />
                          Related NASA Articles
                        </h4>
                        <div className="grid gap-4">
                          {message.articles.map((article, index) => (
                            <ArticleCard key={index} article={article} onSummarize={handleSummarize} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                
                {isLoading && <ThinkingAnimation thinkingTime={currentThinkingTime} />}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="px-2 sm:px-6 py-3 sm:py-6 bg-transparent">
                <div className="relative max-w-4xl mx-auto">
                  {/* Mobile Mode Switch */}
                  <div className="flex sm:hidden items-center justify-center mb-3">
                    <div className="flex items-center bg-white/10 backdrop-blur-md rounded-2xl p-1 relative">
                      {/* Sliding Background */}
                      <div 
                        className={`absolute top-1 bottom-1 bg-white/30 rounded-xl shadow-lg shadow-white/20 border border-white/40 transition-all duration-300 ease-in-out ${
                          (activeTab as string) === 'chat' 
                            ? 'left-1 w-[calc(33.333%-0.125rem)]' 
                            : (activeTab as string) === 'documents'
                            ? 'left-[calc(33.333%+0.125rem)] w-[calc(33.333%-0.125rem)]'
                            : 'left-[calc(66.666%+0.125rem)] w-[calc(33.333%-0.125rem)]'
                        }`}
                      />
                      
                      <button
                        onClick={() => setActiveTab('chat')}
                        className={`relative flex items-center space-x-1.5 px-3 py-1.5 rounded-xl transition-colors duration-200 z-10 ${
                          (activeTab as string) === 'chat'
                            ? 'text-white'
                            : 'text-gray-300 hover:text-white'
                        }`}
                      >
                        <MessageSquare className="h-3 w-3" />
                        <span className="text-xs font-medium">Chat</span>
                      </button>
                      
                      <button
                        onClick={() => setActiveTab('documents')}
                        className={`relative flex items-center space-x-1.5 px-3 py-1.5 rounded-xl transition-colors duration-200 z-10 ${
                          (activeTab as string) === 'documents'
                            ? 'text-white'
                            : 'text-gray-300 hover:text-white'
                        }`}
                      >
                        <Search className="h-3 w-3" />
                        <span className="text-xs font-medium">Search</span>
                      </button>
                      
                      <button
                        onClick={() => setActiveTab('topics')}
                        className={`relative flex items-center space-x-1.5 px-3 py-1.5 rounded-xl transition-colors duration-200 z-10 ${
                          (activeTab as string) === 'topics'
                            ? 'text-white'
                            : 'text-gray-300 hover:text-white'
                        }`}
                      >
                        <Hash className="h-3 w-3" />
                        <span className="text-xs font-medium">Topics</span>
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1.5 sm:space-x-4">
                    <div className="flex-1 relative flex items-center">
                      <textarea
                        ref={textareaRef}
                        value={inputValue}
                        onChange={handleTextareaChange}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask me about space exploration, NASA missions, or astronomy..."
                        className="w-full px-2.5 sm:px-5 py-2.5 sm:py-4 pr-8 sm:pr-14 focus:ring-2 focus:ring-white focus:border-transparent resize-none text-white placeholder-gray-400 transition-all duration-200 text-sm bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl"
                        rows={1}
                        style={{ minHeight: '44px', maxHeight: '120px' }}
                        disabled={isLoading}
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim() || isLoading}
                        className="absolute right-2 sm:right-3 w-6 h-6 sm:w-9 sm:h-9 bg-white text-black rounded-2xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center shadow-lg shadow-black/50 border-2 border-white"
                      >
                        <Send className="h-3 w-3 sm:h-4 sm:w-4" />
                      </button>
                    </div>
                  </div>
                  <p className="hidden sm:block text-xs text-gray-600 dark:text-gray-300 mt-3 px-2 text-center">
                    Press Enter to send, Shift+Enter for new line
                  </p>
                </div>
              </div>
                </div>
              ) : (activeTab as string) === 'documents' ? (
                <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full bg-transparent min-h-0">
                  <Documents />
                </div>
              ) : (
                <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full bg-transparent min-h-0">
                  <Topics />
                </div>
              )}
            </div>
            
            {/* Footer */}
            <div className="absolute bottom-4 right-4 z-10">
              <p className="text-xs text-gray-400/70 bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10">
                Powered by NASA Articles
              </p>
            </div>
      </div>

      {/* Settings Modal */}
      <SettingsComponent
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />

      {/* Article Summary Modal */}
      <ArticleSummaryModal
        isOpen={summaryModal.isOpen}
        onClose={() => setSummaryModal({ isOpen: false, title: '', url: '' })}
        title={summaryModal.title}
        url={summaryModal.url}
        onGenerateSummary={handleGenerateSummary}
      />

      {/* Floating Show Sidebar Button */}
      {sidebarHidden && (
        <button
          onClick={() => setSidebarHidden(false)}
          className="fixed left-2 sm:left-4 top-2 sm:top-4 z-50 p-2 sm:p-3 bg-white/95 backdrop-blur-md rounded-2xl shadow-lg shadow-black/50 border-2 border-white hover:opacity-90 transition-all duration-200"
          title="Show sidebar"
        >
          <PanelLeft className="h-4 w-4 sm:h-5 sm:w-5 text-black" />
        </button>
      )}
    </div>
  )
}
