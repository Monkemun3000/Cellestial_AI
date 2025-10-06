import { Bot, User, Copy, Check } from 'lucide-react'
import { useState } from 'react'

interface ChatMessageProps {
  message: {
    id: string
    content: string
    sender: 'user' | 'bot'
    timestamp: Date
    thinkingTime?: number
  }
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.sender === 'user'
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000) // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} group max-w-4xl mx-auto`}>
      <div className={`flex ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start ${isUser ? 'space-x-reverse space-x-2' : 'space-x-2'} w-full`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
          isUser 
            ? 'bg-white/20 dark:bg-white/30 border-2 border-white/50' 
            : 'bg-white shadow-lg shadow-black/50 border-2 border-white'
        }`}>
          {isUser ? (
            <User className="h-5 w-5 text-white" />
          ) : (
            <Bot className="h-5 w-5 text-black" />
          )}
        </div>
        
        {/* Message Content */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} flex-1 space-y-2`}>
          <div className="relative px-5 py-4 text-white bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl max-w-full group/message">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {message.content}
            </p>
            
            {/* Copy Button */}
            <button
              onClick={handleCopy}
              className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-200 opacity-0 group-hover/message:opacity-100 backdrop-blur-sm border border-white/20"
              title={copied ? "Copied!" : "Copy message"}
            >
              {copied ? (
                <Check className="h-3 w-3 text-green-400" />
              ) : (
                <Copy className="h-3 w-3 text-white" />
              )}
            </button>
          </div>
          
          {/* Timestamp */}
          <span className="text-xs text-gray-500 dark:text-gray-400 px-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {message.timestamp.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
            {!isUser && message.thinkingTime && (
              <span className="ml-2 text-gray-400">
                • {message.thinkingTime < 1000 
                  ? `${message.thinkingTime}ms` 
                  : `${(message.thinkingTime / 1000).toFixed(1)}s`
                } thinking
              </span>
            )}
          </span>
        </div>
      </div>
    </div>
  )
}
