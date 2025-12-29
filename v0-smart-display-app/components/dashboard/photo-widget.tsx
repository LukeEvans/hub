"use client"

import { useState, useEffect } from "react"

export function PhotoWidget() {
  const [photos, setPhotos] = useState<string[]>([])
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)

  useEffect(() => {
    async function fetchPhotos() {
      try {
        const res = await fetch('/api/photos')
        if (res.ok) {
          const data = await res.json()
          setPhotos(data.images || [])
        }
      } catch (err) {
        console.error('Failed to fetch photos for widget', err)
      }
    }
    fetchPhotos()
  }, [])

  useEffect(() => {
    if (photos.length > 1) {
      const interval = setInterval(() => {
        setCurrentPhotoIndex(prev => (prev + 1) % photos.length)
      }, 120000) // 120 seconds as per plan
      return () => clearInterval(interval)
    }
  }, [photos.length])

  if (photos.length === 0) {
    return (
      <div className="w-full h-full bg-muted flex items-center justify-center rounded-2xl overflow-hidden">
        <span className="text-muted-foreground">No photos found</span>
      </div>
    )
  }

  return (
    <div className="w-full h-full relative rounded-2xl overflow-hidden bg-black flex items-center justify-center">
      <img
        src={photos[currentPhotoIndex]}
        alt="Rotating Photo"
        className="max-w-full max-h-full object-contain transition-opacity duration-1000"
      />
    </div>
  )
}

