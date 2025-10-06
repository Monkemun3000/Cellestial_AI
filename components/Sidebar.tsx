import { useState, useEffect } from 'react'
import { 
  MessageSquare, 
  Plus, 
  History, 
  Rocket, 
  ChevronLeft,
  Trash2,
  Edit2,
  Check,
  X,
  RefreshCw,
  PanelLeftClose
} from 'lucide-react'
import { chatStorage, type Chat } from '@/services/chatStorage'
import { ConfirmDialog } from './ConfirmDialog'

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
  onNewChat: () => void
  onSelectChat: (chatId: string) => void
  onLoadChat: (chat: Chat) => void
  currentChatId: string
  refreshTrigger?: number // Add this to trigger sidebar refresh
  onHide: () => void // Add this to hide the sidebar
}

export function Sidebar({ isOpen, onToggle, onNewChat, onSelectChat, onLoadChat, currentChatId, refreshTrigger, onHide }: SidebarProps) {
  const [chats, setChats] = useState<Chat[]>([])
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; chatId: string; chatTitle: string }>({
    isOpen: false,
    chatId: '',
    chatTitle: ''
  })
  const [editingChat, setEditingChat] = useState<{ chatId: string; newTitle: string } | null>(null)

  // Load chats from storage
  useEffect(() => {
    const loadChats = () => {
      // Validate chat data integrity first
      chatStorage.validateChats()
      const storedChats = chatStorage.getChats()
      setChats(storedChats)
    }
    
    loadChats()
    
    // Listen for storage changes (when chats are updated from other tabs)
    const handleStorageChange = () => {
      loadChats()
    }
    
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // Refresh chats when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger) {
      const storedChats = chatStorage.getChats()
      setChats(storedChats)
    }
  }, [refreshTrigger])

  const handleDeleteChat = (chatId: string, chatTitle: string) => {
    setDeleteConfirm({
      isOpen: true,
      chatId,
      chatTitle
    })
  }

  const confirmDelete = () => {
    console.log('Confirming deletion of chat:', deleteConfirm.chatId)
    
    // Delete the chat
    chatStorage.deleteChat(deleteConfirm.chatId)
    
    // Force refresh the chats list
    const updatedChats = chatStorage.getChats()
    console.log('Updated chats after deletion:', updatedChats.length)
    setChats(updatedChats)
    
    // If we're deleting the current chat, create a new one
    if (deleteConfirm.chatId === currentChatId) {
      console.log('Deleted current chat, creating new one')
      onNewChat()
    }
    
    setDeleteConfirm({ isOpen: false, chatId: '', chatTitle: '' })
  }

  const handleChatClick = (chat: Chat) => {
    onSelectChat(chat.id)
    onLoadChat(chat)
  }

  const handleStartEdit = (chat: Chat) => {
    setEditingChat({ chatId: chat.id, newTitle: chat.title })
  }

  const handleSaveEdit = () => {
    if (editingChat && editingChat.newTitle.trim()) {
      chatStorage.updateChatTitle(editingChat.chatId, editingChat.newTitle.trim())
      setChats(chatStorage.getChats())
    }
    setEditingChat(null)
  }

  const handleCancelEdit = () => {
    setEditingChat(null)
  }

  const handleRegenerateTitle = (chat: Chat) => {
    chatStorage.regenerateChatTitle(chat.id)
    setChats(chatStorage.getChats())
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50
              w-80 sm:w-80 md:w-80 lg:w-80
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col
        bg-black/20 backdrop-blur-xl border-r border-white/20
        lg:shadow-2xl lg:shadow-black/20 sidebar-distinct
      `}>
        {/* Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-white/30 backdrop-blur-md h-16 flex items-center">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/95 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg shadow-black/50 border-2 border-white flex-shrink-0">
                <Rocket className="h-6 w-6 sm:h-7 sm:w-7 text-black" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white truncate">
                <span className="cellestial-cell-brand">Space</span>-inator
              </h2>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
              <button
                onClick={onHide}
                className="p-2 sm:p-3 rounded-lg hover:bg-bio-cell/10 dark:hover:bg-bio-cell/20 transition-colors"
                title="Hide sidebar"
              >
                <PanelLeftClose className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </button>
              <button
                onClick={onToggle}
                className="lg:hidden p-2 rounded-lg hover:bg-bio-cell/10 dark:hover:bg-bio-cell/20 transition-colors"
              >
                <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* New Chat Button */}
        <div className="p-4">
              <button
                onClick={onNewChat}
                className="w-full flex items-center space-x-3 px-4 py-3 bg-white/90 backdrop-blur-md text-black rounded-2xl hover:opacity-90 transition-all duration-200 shadow-lg shadow-black/50 border-2 border-white"
              >
            <Plus className="h-5 w-5" />
            <span className="font-semibold">New Chat</span>
          </button>
        </div>

            {/* Chat History */}
            <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-4 bg-transparent">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-300 px-2 mb-3 flex items-center sticky top-0 z-10">
              <History className="h-4 w-4 mr-2" />
              Recent Chats
            </h3>
            
            {chats.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-500 dark:text-gray-400">No chat history yet</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Start a new conversation to see it here</p>
              </div>
            ) : (
              <div className="space-y-2">
                {chats.map((chat) => (
                  <div
                    key={chat.id}
                    className={`
                      w-full p-3 transition-all duration-200 group border border-white/30 rounded-2xl backdrop-blur-md
                      ${currentChatId === chat.id 
                        ? 'bg-white/25' 
                        : 'bg-white/20 hover:bg-white/25'
                      }
                    `}
                  >
                    {editingChat?.chatId === chat.id ? (
                      // Edit mode
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={editingChat.newTitle}
                          onChange={(e) => setEditingChat({ ...editingChat, newTitle: e.target.value })}
                          className="w-full px-2 py-1 text-sm font-semibold bg-white/20 border border-white/30 rounded text-white placeholder-gray-400"
                          placeholder="Chat name"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit()
                            if (e.key === 'Escape') handleCancelEdit()
                          }}
                        />
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={handleSaveEdit}
                            className="p-1 rounded hover:bg-green-100 dark:hover:bg-green-900/20 transition-colors"
                            title="Save"
                          >
                            <Check className="h-3 w-3 text-green-500" />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-900/20 transition-colors"
                            title="Cancel"
                          >
                            <X className="h-3 w-3 text-gray-500" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Display mode
                      <div 
                        onClick={() => handleChatClick(chat)}
                        className="cursor-pointer"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate mb-1">
                              {chat.title}
                            </h4>
                            <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">
                              {chat.lastMessage}
                            </p>
                          </div>
                          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation()
                                handleRegenerateTitle(chat)
                              }}
                              className="p-1 rounded hover:bg-green-100 dark:hover:bg-green-900/20 transition-colors"
                              title="Regenerate title from content"
                            >
                              <RefreshCw className="h-3 w-3 text-green-500" />
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation()
                                handleStartEdit(chat)
                              }}
                              className="p-1 rounded hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors"
                              title="Rename chat"
                            >
                              <Edit2 className="h-3 w-3 text-blue-500" />
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteChat(chat.id, chat.title)
                              }}
                              className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                              title="Delete chat"
                            >
                              <Trash2 className="h-3 w-3 text-red-500" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, chatId: '', chatTitle: '' })}
        onConfirm={confirmDelete}
        title="Delete Chat"
        message={`Are you sure you want to delete "${deleteConfirm.chatTitle}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </>
  )
}
