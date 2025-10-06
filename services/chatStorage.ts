interface Message {
  id: string
  content: string
  sender: 'user' | 'bot'
  timestamp: Date
  articles?: any[]
  thinkingTime?: number // Time in milliseconds that AI took to respond
}

interface Chat {
  id: string
  title: string
  lastMessage: string
  messages: Message[]
}

class ChatStorage {
  private storageKey = 'cellestial-ai-chats'

  // Get all chats from localStorage
  getChats(): Chat[] {
    if (typeof window === 'undefined') return []
    
    try {
      const stored = localStorage.getItem(this.storageKey)
      if (!stored) return []
      
      const chats = JSON.parse(stored)
      // Convert message timestamp strings back to Date objects
      return chats.map((chat: any) => ({
        ...chat,
        messages: chat.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      }))
    } catch (error) {
      console.error('Error loading chats:', error)
      return []
    }
  }

  // Save all chats to localStorage
  saveChats(chats: Chat[]): void {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(chats))
    } catch (error) {
      console.error('Error saving chats:', error)
    }
  }

  // Get a specific chat by ID
  getChat(chatId: string): Chat | null {
    const chats = this.getChats()
    return chats.find(chat => chat.id === chatId) || null
  }

  // Save or update a chat
  saveChat(chat: Chat): void {
    const chats = this.getChats()
    const existingIndex = chats.findIndex(c => c.id === chat.id)
    
    if (existingIndex >= 0) {
      chats[existingIndex] = chat
    } else {
      chats.unshift(chat) // Add new chat to the beginning
    }
    
    this.saveChats(chats)
  }

  // Delete a chat
  deleteChat(chatId: string): void {
    const chats = this.getChats()
    console.log('Before deletion - Total chats:', chats.length)
    console.log('Deleting chat ID:', chatId)
    console.log('Chat IDs before deletion:', chats.map(c => c.id))
    
    const filteredChats = chats.filter(chat => chat.id !== chatId)
    console.log('After deletion - Total chats:', filteredChats.length)
    console.log('Chat IDs after deletion:', filteredChats.map(c => c.id))
    
    this.saveChats(filteredChats)
    
    // Verify deletion
    const remainingChats = this.getChats()
    const deletedChat = remainingChats.find(chat => chat.id === chatId)
    if (deletedChat) {
      console.error('Chat deletion failed - chat still exists:', chatId)
    } else {
      console.log('Chat successfully deleted:', chatId)
    }
  }

  // Generate a default chat title from the first user message
  generateChatTitle(firstMessage: string): string {
    const words = firstMessage.split(' ').slice(0, 6)
    return words.join(' ') + (firstMessage.split(' ').length > 6 ? '...' : '')
  }

  // Generate intelligent chat title based on conversation content
  generateIntelligentTitle(messages: Message[]): string {
    // Get all user messages
    const userMessages = messages.filter(msg => msg.sender === 'user')
    
    if (userMessages.length === 0) {
      return 'New Chat'
    }

    // Combine all user messages
    const allUserContent = userMessages.map(msg => msg.content).join(' ').toLowerCase()
    
    // Define topic keywords and their corresponding titles
    const topicKeywords = {
      'mars': 'Mars Exploration',
      'moon': 'Lunar Missions',
      'jupiter': 'Jupiter Research',
      'saturn': 'Saturn Studies',
      'venus': 'Venus Exploration',
      'mercury': 'Mercury Research',
      'neptune': 'Neptune Studies',
      'uranus': 'Uranus Research',
      'pluto': 'Pluto Research',
      'asteroid': 'Asteroid Research',
      'comet': 'Comet Studies',
      'meteor': 'Meteor Research',
      'galaxy': 'Galaxy Studies',
      'nebula': 'Nebula Research',
      'black hole': 'Black Hole Research',
      'supernova': 'Supernova Studies',
      'hubble': 'Hubble Telescope',
      'james webb': 'James Webb Telescope',
      'iss': 'International Space Station',
      'space station': 'Space Station',
      'apollo': 'Apollo Missions',
      'spacex': 'SpaceX Missions',
      'nasa': 'NASA Missions',
      'spacecraft': 'Spacecraft Research',
      'satellite': 'Satellite Research',
      'telescope': 'Telescope Research',
      'astronaut': 'Astronaut Research',
      'space suit': 'Space Suit Research',
      'rocket': 'Rocket Technology',
      'launch': 'Space Launch',
      'orbit': 'Orbital Mechanics',
      'gravity': 'Gravity Research',
      'solar system': 'Solar System',
      'earth': 'Earth Science',
      'atmosphere': 'Atmospheric Research',
      'climate': 'Climate Research',
      'weather': 'Weather Research',
      'ocean': 'Ocean Research',
      'life': 'Life in Space',
      'alien': 'Extraterrestrial Life',
      'exoplanet': 'Exoplanet Research',
      'habitable': 'Habitable Planets',
      'colonization': 'Space Colonization',
      'terraforming': 'Terraforming',
      'space travel': 'Space Travel',
      'time travel': 'Time Travel',
      'wormhole': 'Wormhole Research',
      'dimension': 'Dimensional Research',
      'quantum': 'Quantum Physics',
      'relativity': 'Relativity Theory',
      'einstein': 'Einstein Research',
      'hawking': 'Hawking Research',
      'big bang': 'Big Bang Theory',
      'universe': 'Universe Research',
      'cosmos': 'Cosmos Studies',
      'dark matter': 'Dark Matter',
      'dark energy': 'Dark Energy',
      'radiation': 'Radiation Research',
      'magnetic field': 'Magnetic Fields',
      'solar wind': 'Solar Wind',
      'aurora': 'Aurora Research',
      'eclipse': 'Eclipse Research',
      'constellation': 'Constellation Studies',
      'star': 'Star Research',
      'planet': 'Planetary Research',
      'moon phase': 'Moon Phases',
      'tide': 'Tidal Research',
      'season': 'Seasonal Research',
      'day night': 'Day/Night Cycle',
      'rotation': 'Planetary Rotation',
      'revolution': 'Planetary Revolution'
    }

    // Check for specific topics
    for (const [keyword, title] of Object.entries(topicKeywords)) {
      if (allUserContent.includes(keyword)) {
        return title
      }
    }

    // If no specific topic found, try to extract key concepts
    const words = allUserContent.split(/\s+/)
    const importantWords = words.filter(word => 
      word.length > 3 && 
      !['what', 'how', 'why', 'when', 'where', 'tell', 'about', 'explain', 'describe', 'can', 'you', 'help', 'me', 'with', 'the', 'and', 'for', 'are', 'is', 'was', 'were', 'have', 'has', 'had', 'will', 'would', 'could', 'should', 'this', 'that', 'these', 'those'].includes(word)
    )

    if (importantWords.length > 0) {
      // Take the first 2-3 important words and capitalize them
      const keyWords = importantWords.slice(0, 3).map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      )
      return keyWords.join(' ') + ' Discussion'
    }

    // Fallback to first message title
    return this.generateChatTitle(userMessages[0].content)
  }

  // Update chat title and last message
  updateChatInfo(chatId: string, title?: string, lastMessage?: string): void {
    const chat = this.getChat(chatId)
    if (!chat) return

    if (title) chat.title = title
    if (lastMessage) chat.lastMessage = lastMessage

    this.saveChat(chat)
  }

  // Update chat title (for renaming)
  updateChatTitle(chatId: string, newTitle: string): void {
    const chat = this.getChat(chatId)
    if (!chat) return

    chat.title = newTitle
    this.saveChat(chat)
  }

  // Regenerate chat title based on current conversation content
  regenerateChatTitle(chatId: string): void {
    const chat = this.getChat(chatId)
    if (!chat) return

    chat.title = this.generateIntelligentTitle(chat.messages)
    this.saveChat(chat)
  }

  // Add a message to a chat
  addMessage(chatId: string, message: Message): void {
    const chat = this.getChat(chatId)
    if (!chat) return

    chat.messages.push(message)
    chat.lastMessage = message.content

    // Update title intelligently based on conversation content
    if (message.sender === 'user') {
      const userMessageCount = chat.messages.filter(m => m.sender === 'user').length
      
      // Generate intelligent title after first user message or when we have enough context
      if (userMessageCount === 1 || (userMessageCount >= 2 && chat.title === 'New Chat')) {
        chat.title = this.generateIntelligentTitle(chat.messages)
      }
    }

    this.saveChat(chat)
  }

  // Clear all chats
  clearAllChats(): void {
    this.saveChats([])
  }

  // Validate and fix chat data integrity
  validateChats(): void {
    const chats = this.getChats()
    const uniqueIds = new Set<string>()
    const validChats: Chat[] = []

    chats.forEach(chat => {
      // Check for duplicate IDs
      if (uniqueIds.has(chat.id)) {
        console.warn('Duplicate chat ID found, generating new one:', chat.id)
        chat.id = `chat_${Date.now()}_${Math.floor(Math.random() * 1000)}`
      }
      
      // Ensure chat has required properties
      if (chat.id && chat.title && chat.messages) {
        uniqueIds.add(chat.id)
        validChats.push(chat)
      } else {
        console.warn('Invalid chat found, removing:', chat)
      }
    })

    if (validChats.length !== chats.length) {
      console.log(`Fixed ${chats.length - validChats.length} invalid chats`)
      this.saveChats(validChats)
    }
  }
}

export const chatStorage = new ChatStorage()
export type { Chat, Message }
