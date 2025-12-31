"use client"

import { useState, useEffect, useCallback } from "react"
import { PhotoCollage } from "./photo-collage"

export function Screensaver() {
  const [isVisible, setIsVisible] = useState(false)
  const [photos, setPhotos] = useState<string[]>([])
  const idleTime = 300000 // 5 minutes

  useEffect(() => {
    const handleLaunchScreensaver = () => {
      setIsVisible(true)
    }
    window.addEventListener('launch-screensaver', handleLaunchScreensaver)
    return () => window.removeEventListener('launch-screensaver', handleLaunchScreensaver)
  }, [])

  useEffect(() => {
    async function fetchPhotos() {
      try {
        const res = await fetch('/api/photos')
        if (res.ok) {
          const data = await res.json()
          setPhotos(data.images || [])
        }
      } catch (err) {
        console.error('Failed to fetch photos for screensaver', err)
      }
    }
    fetchPhotos()
  }, [])

  const resetTimer = useCallback(() => {
    setIsVisible(false)
  }, [])

  useEffect(() => {
    let timer: NodeJS.Timeout

    const handleActivity = () => {
      resetTimer()
      clearTimeout(timer)
      timer = setTimeout(() => setIsVisible(true), idleTime)
    }

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
    events.forEach(event => document.addEventListener(event, handleActivity))

    timer = setTimeout(() => setIsVisible(true), idleTime)

    return () => {
      events.forEach(event => document.removeEventListener(event, handleActivity))
      clearTimeout(timer)
    }
  }, [resetTimer])

  if (!isVisible || photos.length === 0) return null

  return (
    <div className="fixed inset-0 z-[100] bg-black overflow-hidden">
      <PhotoCollage photos={photos} />
    </div>
  )
}
