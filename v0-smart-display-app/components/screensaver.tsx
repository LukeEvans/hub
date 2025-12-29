"use client"

import { useState, useEffect, useCallback } from "react"

export function Screensaver() {
  const [isVisible, setIsVisible] = useState(false)
  const [photos, setPhotos] = useState<string[]>([])
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const idleTime = 300000 // 5 minutes

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
        setCurrentPhotoIndex(prev => (prev + 1) % photos.length)
      }, 7000)
      return () => clearInterval(interval)
    }
  }, [isVisible, photos.length])

  if (!isVisible || photos.length === 0) return null

  return (
    <div className="fixed inset-0 z-[100] bg-black">
      <img
        src={photos[currentPhotoIndex]}
        alt="Screensaver"
        className="w-full h-full object-contain transition-opacity duration-1000"
      />
    </div>
  )
}

