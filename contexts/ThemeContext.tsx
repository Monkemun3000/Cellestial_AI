'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'
type BackgroundImage = 'hubble-deep-field' | 'pillars-creation' | 'earth-rise' | 'galaxy-whirlpool'

interface ThemeContextType {
  theme: Theme
  backgroundImage: BackgroundImage
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
  setBackgroundImage: (image: BackgroundImage) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark') // Always dark theme
  const [backgroundImage, setBackgroundImageState] = useState<BackgroundImage>('hubble-deep-field')
  const [mounted, setMounted] = useState(false)

  // Load background from localStorage on mount
  useEffect(() => {
    const savedBackground = localStorage.getItem('cellestial-background') as BackgroundImage
    
    if (savedBackground) {
      setBackgroundImageState(savedBackground)
    }
    
    setMounted(true)
  }, [])

  // Apply theme and background to document
  useEffect(() => {
    if (!mounted) return

    const root = document.documentElement
    
    // Force dark theme - completely override system settings
    root.classList.add('dark')
    root.classList.remove('light')
    root.setAttribute('data-theme', 'dark')
    root.setAttribute('data-color-scheme', 'dark')
    
    // Force dark theme colors regardless of system preference
    root.style.setProperty('--dark-gray', '#1a1a1a')
    root.style.setProperty('--darker-gray', '#0f0f0f')
    root.style.setProperty('--light-gray', '#2a2a2a')
    root.style.setProperty('--white', '#ffffff')
    root.style.setProperty('--white-outline', '#ffffff')
    root.style.setProperty('--white-text', '#ffffff')
    root.style.setProperty('--gray-text', '#cccccc')
    root.style.setProperty('--accent-white', '#ffffff')
    root.style.setProperty('--accent-gray', '#666666')
    
        // Force color scheme to dark
        root.style.setProperty('color-scheme', 'dark')
        
        // Override any system color scheme preferences
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
          // Force dark theme even if system prefers light
          root.style.setProperty('color-scheme', 'dark')
        }

    // Apply background image using CSS custom property with light overlay
    const nasaImages = {
      'hubble-deep-field': 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      'pillars-creation': 'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      'earth-rise': 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      'galaxy-whirlpool': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
    }
    
        const backgroundUrl = nasaImages[backgroundImage] || nasaImages['hubble-deep-field']
        // No overlay - show background image directly
        root.style.setProperty('--nasa-background', `url(${backgroundUrl})`)
        
        // Also apply directly to body and html for immediate effect
        const body = document.body
        const html = document.documentElement
        if (body) {
          body.style.backgroundImage = `url(${backgroundUrl})`
        }
        if (html) {
          html.style.backgroundImage = `url(${backgroundUrl})`
        }

        // Save to localStorage
        localStorage.setItem('cellestial-background', backgroundImage)
  }, [backgroundImage, mounted])

  const toggleTheme = () => {
    // No-op since we're always in light mode
  }

  const setTheme = (newTheme: Theme) => {
    // No-op since we're always in light mode
  }

  const setBackgroundImage = (newImage: BackgroundImage) => {
    setBackgroundImageState(newImage)
  }

  return (
    <ThemeContext.Provider value={{ theme, backgroundImage, toggleTheme, setTheme, setBackgroundImage }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
        // Return default values during SSR or when context is not available
        return {
          theme: 'dark' as Theme,
          backgroundImage: 'hubble-deep-field' as BackgroundImage,
          toggleTheme: () => {},
          setTheme: () => {},
          setBackgroundImage: () => {}
        }
  }
  return context
}
