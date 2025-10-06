import { Bot } from 'lucide-react'

interface ThinkingAnimationProps {
  thinkingTime?: number // Time in milliseconds
}

export function ThinkingAnimation({ thinkingTime }: ThinkingAnimationProps) {
  return (
    <div className="flex items-center space-x-4 text-white py-4">
      <div className="relative">
        {/* Planet Animation */}
        <div className="w-10 h-10 relative">
          {/* Planet */}
          <div className="absolute inset-0 rounded-full bg-white animate-spin border-2 border-white" 
               style={{ animationDuration: '3s' }}>
            <div className="absolute inset-1 rounded-full bg-gray-200"></div>
            <div className="absolute top-1 left-2 w-1 h-1 bg-black rounded-full animate-pulse"></div>
            <div className="absolute bottom-2 right-1 w-0.5 h-0.5 bg-black rounded-full animate-pulse" 
                 style={{ animationDelay: '0.5s' }}></div>
          </div>
          
          {/* Orbiting Rocket */}
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: '2s' }}>
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1">
              <div className="w-3 h-3 bg-white rounded-sm rotate-45 flex items-center justify-center border border-black">
                <Bot className="h-1.5 w-1.5 text-black" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Glow Effect */}
        <div className="absolute inset-0 rounded-full bg-white/20 animate-pulse" 
             style={{ animationDuration: '1.5s' }}></div>
      </div>
      
      <div className="flex items-center space-x-2">
        <span className="text-sm font-semibold text-white">Cellestial AI is thinking</span>
        {thinkingTime !== undefined && (
          <span className="text-xs text-gray-300 bg-white/10 px-2 py-1 rounded-full">
            {thinkingTime < 1000 
              ? `${thinkingTime}ms` 
              : `${(thinkingTime / 1000).toFixed(1)}s`
            }
          </span>
        )}
        <div className="flex space-x-1">
          <div className="w-1 h-1 bg-white rounded-full animate-bounce" 
               style={{ animationDelay: '0s' }}></div>
          <div className="w-1 h-1 bg-white rounded-full animate-bounce" 
               style={{ animationDelay: '0.1s' }}></div>
          <div className="w-1 h-1 bg-white rounded-full animate-bounce" 
               style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  )
}
