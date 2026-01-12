"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useSWRConfig } from 'swr'

type Orientation = 'landscape' | 'portrait'

interface OrientationContextType {
  orientation: Orientation
  setOrientation: (orientation: Orientation) => Promise<void>
}

const OrientationContext = createContext<OrientationContextType | undefined>(undefined)

export function OrientationProvider({ children }: { children: React.ReactNode }) {
  const [orientation, setInternalOrientation] = useState<Orientation>('landscape')
  const { mutate } = useSWRConfig()

  useEffect(() => {
    // Initial fetch of orientation
    fetch('/api/system/config')
      .then(res => res.json())
      .then(data => {
        if (data.orientation) {
          setInternalOrientation(data.orientation)
        }
      })
      .catch(err => console.error('Failed to fetch orientation:', err))
  }, [])

  useEffect(() => {
    // Apply class to body
    if (typeof document !== 'undefined') {
      document.body.classList.remove('orientation-landscape', 'orientation-portrait')
      document.body.classList.add(`orientation-${orientation}`)
    }
  }, [orientation])

  const setOrientation = async (newOrientation: Orientation) => {
    setInternalOrientation(newOrientation)
    try {
      const response = await fetch('/api/system/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orientation: newOrientation }),
      })
      if (response.ok) {
        mutate('/api/system/config')
      } else {
        console.error('Failed to save orientation to server')
      }
    } catch (err) {
      console.error('Error saving orientation:', err)
    }
  }

  return (
    <OrientationContext.Provider value={{ orientation, setOrientation }}>
      {children}
    </OrientationContext.Provider>
  )
}

export function useOrientation() {
  const context = useContext(OrientationContext)
  if (context === undefined) {
    throw new Error('useOrientation must be used within an OrientationProvider')
  }
  return context
}
