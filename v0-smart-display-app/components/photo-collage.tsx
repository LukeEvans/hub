"use client"

import { useState, useEffect, useCallback } from "react"

interface PhotoSlotProps {
  photos: string[]
  index: number
  totalSlots: number
}

function PhotoSlot({ photos, index, totalSlots }: PhotoSlotProps) {
  const [currentPhoto, setCurrentPhoto] = useState<string>("")
  const [prevPhoto, setPrevPhoto] = useState<string>("")
  const [style, setStyle] = useState<any>({})
  const [isTransitioning, setIsTransitioning] = useState(false)

  const getRandomStyle = useCallback(() => {
    const width = 35 + Math.random() * 20 // 35-55%
    const height = 35 + Math.random() * 20 // 35-55%
    const x = -10 + Math.random() * 80 // -10 to 70%
    const y = -10 + Math.random() * 80 // -10 to 70%
    const rotation = -5 + Math.random() * 10 // -5 to 5deg
    
    return {
      width: `${width}%`,
      height: `${height}%`,
      left: `${x}%`,
      top: `${y}%`,
      "--rotation": `${rotation}deg`,
      zIndex: Math.floor(Math.random() * 10),
    }
  }, [])

  const changePhoto = useCallback(() => {
    if (photos.length === 0) return

    setIsTransitioning(true)
    
    // Wait for exit animation
    setTimeout(() => {
      setPrevPhoto(currentPhoto)
      const nextPhoto = photos[Math.floor(Math.random() * photos.length)]
      setCurrentPhoto(nextPhoto)
      setStyle(getRandomStyle())
      setIsTransitioning(false)
    }, 600) // Match collage-exit duration
  }, [photos, currentPhoto, getRandomStyle])

  useEffect(() => {
    if (photos.length > 0 && !currentPhoto) {
      const initialPhoto = photos[Math.floor(Math.random() * photos.length)]
      setCurrentPhoto(initialPhoto)
      setStyle(getRandomStyle())
    }
  }, [photos, currentPhoto, getRandomStyle])

  useEffect(() => {
    // Initial staggered delay
    const initialDelay = index * 3000
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        changePhoto()
      }, 15000 + Math.random() * 5000) // 15-20s refresh
      
      return () => clearInterval(interval)
    }, initialDelay)

    return () => clearTimeout(timer)
  }, [index, changePhoto])

  if (!currentPhoto) return null

  return (
    <div
      className={`absolute transition-all duration-1000 ease-in-out ${
        isTransitioning ? "animate-collage-exit" : "animate-collage-enter"
      }`}
      style={style}
    >
      <div className="w-full h-full p-2">
        <div className="w-full h-full rounded-lg overflow-hidden shadow-2xl bg-black border-4 border-white/10 backdrop-blur-sm">
          <img
            src={currentPhoto}
            alt="Collage piece"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  )
}

export function PhotoCollage({ photos }: { photos: string[] }) {
  const [slots] = useState([0, 1, 2, 3, 4, 5]) // 6 slots

  if (!photos || photos.length === 0) return null

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      {slots.map((slotIndex) => (
        <PhotoSlot
          key={slotIndex}
          index={slotIndex}
          totalSlots={slots.length}
          photos={photos}
        />
      ))}
    </div>
  )
}

