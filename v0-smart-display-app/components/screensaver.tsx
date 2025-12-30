"use client"

import { useState, useEffect, useCallback } from "react"

export function Screensaver() {
  const [isVisible, setIsVisible] = useState(false)
  const [photos, setPhotos] = useState<string[]>([])
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [prevPhotoIndex, setPrevPhotoIndex] = useState<number | null>(null)
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

  useEffect(() => {
    if (isVisible && photos.length > 0) {
      const interval = setInterval(() => {
        setPrevPhotoIndex(currentPhotoIndex)
        setCurrentPhotoIndex(prev => (prev + 1) % photos.length)
      }, 10000)
      return () => clearInterval(interval)
    }
  }, [isVisible, photos.length, currentPhotoIndex])

  if (!isVisible || photos.length === 0) return null

  return (
    <div className="fixed inset-0 z-[100] bg-black overflow-hidden">
      {photos.map((photo, index) => {
        const isCurrent = index === currentPhotoIndex
        const isPrev = index === prevPhotoIndex
        if (!isCurrent && !isPrev) return null

        const animationClass = index % 2 === 0 ? "animate-ken-burns-left" : "animate-ken-burns-right"

        return (
          <img
            key={photo}
            src={photo}
            alt="Screensaver"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-2000 ${
              isCurrent ? `opacity-100 ${animationClass}` : "opacity-0"
            }`}
          />
        )
      })}
    </div>
  )
}
