"use client"

import { useState, useEffect } from "react"

import { useApi } from "@/lib/use-api"

export function PhotoWidget() {
  const { data } = useApi<any>('/api/photos')
  const photos = data?.images || []
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)

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
        draggable={false}
      />
    </div>
  )
}

