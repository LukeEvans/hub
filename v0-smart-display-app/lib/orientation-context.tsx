"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useSWRConfig } from 'swr'

type Orientation = 'landscape' | 'portrait'

interface OrientationContextType {
  orientation: Orientation
  softwareRotation: boolean
  setOrientation: (orientation: Orientation) => Promise<void>
  setSoftwareRotation: (enabled: boolean) => Promise<void>
}

const OrientationContext = createContext<OrientationContextType | undefined>(undefined)

export function OrientationProvider({ children }: { children: React.ReactNode }) {
  const [orientation, setInternalOrientation] = useState<Orientation>('landscape')
  const [softwareRotation, setInternalSoftwareRotation] = useState<boolean>(false)
  const { mutate } = useSWRConfig()

  useEffect(() => {
    // Initial fetch of orientation
    fetch('/api/system/config')
      .then(res => res.json())
      .then(data => {
        if (data.orientation) {
          setInternalOrientation(data.orientation)
        }
        if (data.softwareRotation !== undefined) {
          setInternalSoftwareRotation(data.softwareRotation)
        }
      })
      .catch(err => console.error('Failed to fetch orientation:', err))
  }, [])

  useEffect(() => {
    // Apply class to body
    if (typeof document !== 'undefined') {
      document.body.classList.remove('orientation-landscape', 'orientation-portrait', 'software-rotate-portrait')
      document.body.classList.add(`orientation-${orientation}`)
      if (softwareRotation && orientation === 'portrait') {
        document.body.classList.add('software-rotate-portrait')
      }
    }
  }, [orientation, softwareRotation])

  const setOrientation = async (newOrientation: Orientation) => {
    setInternalOrientation(newOrientation)
    try {
      // Update config
      const configResponse = await fetch('/api/system/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orientation: newOrientation }),
      })
      if (configResponse.ok) {
        mutate('/api/system/config')
      }

      // Trigger OS rotation
      await fetch('/api/system', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: `rotate_${newOrientation}` }),
      })
    } catch (err) {
      console.error('Error saving orientation:', err)
    }
  }

  const setSoftwareRotation = async (enabled: boolean) => {
    setInternalSoftwareRotation(enabled)
    try {
      const response = await fetch('/api/system/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ softwareRotation: enabled }),
      })
      if (response.ok) {
        mutate('/api/system/config')
      }
    } catch (err) {
      console.error('Error saving software rotation:', err)
    }
  }

  return (
    <OrientationContext.Provider value={{ orientation, softwareRotation, setOrientation, setSoftwareRotation }}>
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
