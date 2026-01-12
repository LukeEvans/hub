"use client"

import { useState, useEffect, useCallback } from "react"
import { PhotoCollage } from "./photo-collage"

export function Screensaver() {
  const [isVisible, setIsVisible] = useState(false)
  const [photos, setPhotos] = useState<string[]>([])
  const [currentTime, setCurrentTime] = useState(new Date())
  const idleTime = 3600000 // 1 hour

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

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

  const timeString = currentTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })
  const dateString = currentTime.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })

  if (!isVisible || photos.length === 0) return null

  return (
    <div className="fixed inset-0 z-[100] bg-black overflow-hidden">
      <PhotoCollage photos={photos} />
      <div className="absolute top-10 left-10 z-[110] text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)] pointer-events-none">
        <h1 className="text-7xl font-black tracking-tighter">{timeString}</h1>
        <p className="text-2xl font-medium opacity-90">{dateString}</p>
      </div>
    </div>
  )
}
