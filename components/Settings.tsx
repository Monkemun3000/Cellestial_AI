import { useState } from 'react'
import { 
  X, 
  Palette,
  Globe,
  Shield
} from 'lucide-react'
import { chatStorage } from '@/services/chatStorage'
import { ConfirmDialog } from './ConfirmDialog'
import { useTheme } from '@/contexts/ThemeContext'
import { getAllNASAImages } from '@/services/nasaImages'

interface SettingsProps {
  isOpen: boolean
  onClose: () => void
}

export function Settings({ isOpen, onClose }: SettingsProps) {
  const { backgroundImage, setBackgroundImage } = useTheme()
  const [clearConfirm, setClearConfirm] = useState(false)
  const [exportConfirm, setExportConfirm] = useState(false)
  const nasaImages = getAllNASAImages()

  const handleClearChatHistory = () => {
    chatStorage.clearAllChats()
    setClearConfirm(false)
    // Refresh the page to reset the chat state
    window.location.reload()
  }

  const handleExportData = () => {
    try {
      const chats = chatStorage.getChats()
      const exportData = {
        exportDate: new Date().toISOString(),
        version: '1.0.0',
        chats: chats,
        settings: {
          backgroundImage
        }
      }
      
      const dataStr = JSON.stringify(exportData, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `cellestial-ai-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      setExportConfirm(false)
    } catch (error) {
      console.error('Error exporting data:', error)
      alert('Failed to export data. Please try again.')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="rounded-2xl w-full max-w-md max-h-[80vh] overflow-y-auto bg-white/95 backdrop-blur-md border border-white/30 mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-bio-cell/10 dark:hover:bg-bio-cell/20 transition-colors"
          >
            <X className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        {/* Settings Content */}
        <div className="p-6 space-y-4">
          {/* Appearance */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <Palette className="h-5 w-5 mr-2 text-gray-600 dark:text-gray-300" />
              Appearance
            </h3>
            
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Background Image</label>
              <div className="grid grid-cols-2 gap-3">
                {nasaImages.map((image) => (
                  <button
                    key={image.id}
                    onClick={() => setBackgroundImage(image.id as any)}
                    className={`relative p-3 rounded-lg border-2 transition-all ${
                      backgroundImage === image.id
                        ? 'border-white bg-white/10'
                        : 'border-gray-300 dark:border-gray-600 hover:border-white/50'
                    }`}
                  >
                    <div 
                      className="w-full h-16 rounded bg-cover bg-center mb-2"
                      style={{ backgroundImage: `url(${image.url})` }}
                    />
                    <div className="text-left">
                      <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                        {image.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {image.year}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Privacy & Data */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <Shield className="h-5 w-5 mr-2 text-gray-600 dark:text-gray-300" />
              Privacy & Data
            </h3>
            
            <div className="space-y-3">
              <button 
                onClick={() => setClearConfirm(true)}
                className="w-full text-left p-3 rounded-lg hover:bg-bio-cell/10 dark:hover:bg-bio-cell/20 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Clear Chat History</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Remove all conversations</span>
                </div>
              </button>
              
              <button 
                onClick={() => setExportConfirm(true)}
                className="w-full text-left p-3 rounded-lg hover:bg-bio-cell/10 dark:hover:bg-bio-cell/20 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Export Data</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Download your data</span>
                </div>
              </button>
            </div>
          </div>

          {/* About */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <Globe className="h-5 w-5 mr-2 text-gray-600 dark:text-gray-300" />
              About Cellestial AI
            </h3>
            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">Version 1.0.0</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Powered by NASA Articles</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Cellestial AI v1.0.0</span>
            <span>Powered by NASA</span>
          </div>
        </div>

        {/* Clear All Chats Confirmation */}
        <ConfirmDialog
          isOpen={clearConfirm}
          onClose={() => setClearConfirm(false)}
          onConfirm={handleClearChatHistory}
          title="Clear All Chat History"
          message="Are you sure you want to delete all your chat history? This action cannot be undone and will remove all your conversations."
          confirmText="Clear All"
          cancelText="Cancel"
          type="danger"
        />

        {/* Export Data Confirmation */}
        <ConfirmDialog
          isOpen={exportConfirm}
          onClose={() => setExportConfirm(false)}
          onConfirm={handleExportData}
          title="Export Data"
          message="This will download a JSON file containing all your chat history and settings. The file will be saved to your default download location."
          confirmText="Export"
          cancelText="Cancel"
          type="info"
        />
      </div>
    </div>
  )
}
