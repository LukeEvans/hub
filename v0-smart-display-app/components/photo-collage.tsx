"use client"

import { useState, useEffect, useCallback } from "react"

interface PhotoSlotProps {
  photos: string[]
  index: number
}

function PhotoSlot({ photos, index }: PhotoSlotProps) {
  const [currentPhoto, setCurrentPhoto] = useState<string>("")
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [aspectRatio, setAspectRatio] = useState<string>("aspect-[3/4]") // Default to portrait-ish

  const changePhoto = useCallback(() => {
    if (photos.length === 0) return

    setIsTransitioning(true)
    
    setTimeout(() => {
      const nextPhoto = photos[Math.floor(Math.random() * photos.length)]
      setCurrentPhoto(nextPhoto)
      
      // Randomly vary the aspect ratio slightly for masonry effect
      const ratios = ["aspect-[3/4]", "aspect-[2/3]", "aspect-[4/5]", "aspect-[3/5]"]
      setAspectRatio(ratios[Math.floor(Math.random() * ratios.length)])
      
      setIsTransitioning(false)
    }, 600)
  }, [photos])

  useEffect(() => {
    if (photos.length > 0 && !currentPhoto) {
      const initialPhoto = photos[Math.floor(Math.random() * photos.length)]
      setCurrentPhoto(initialPhoto)
    }
  }, [photos, currentPhoto])

  useEffect(() => {
    const initialDelay = index * 2500
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        changePhoto()
      }, 15000 + Math.random() * 5000)
      
      return () => clearInterval(interval)
    }, initialDelay)

    return () => clearTimeout(timer)
  }, [index, changePhoto])

  if (!currentPhoto) return null

  return (
    <div className="w-full mb-4 px-2">
      <div
        className={`w-full h-full rounded-2xl overflow-hidden shadow-xl bg-muted transition-all duration-1000 ${
          isTransitioning ? "animate-collage-exit" : "animate-collage-enter"
        } ${aspectRatio}`}
        style={{ "--rotation": "0deg" } as any}
      >
        <img
          src={currentPhoto}
          alt="Masonry piece"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  )
}

export function PhotoCollage({ photos }: { photos: string[] }) {
  if (!photos || photos.length === 0) return null

  // We'll use 3 columns for a clean landscape-to-portrait masonry fit
  return (
    <div className="fixed inset-0 bg-black p-4 overflow-hidden">
      <div className="flex h-full -mx-2">
        {/* Column 1 */}
        <div className="flex-1 flex flex-col justify-center">
          <PhotoSlot photos={photos} index={0} />
          <PhotoSlot photos={photos} index={1} />
        </div>
        
        {/* Column 2 */}
        <div className="flex-1 flex flex-col justify-center">
          <PhotoSlot photos={photos} index={2} />
          <PhotoSlot photos={photos} index={3} />
          <PhotoSlot photos={photos} index={6} />
        </div>

        {/* Column 3 */}
        <div className="flex-1 flex flex-col justify-center">
          <PhotoSlot photos={photos} index={4} />
          <PhotoSlot photos={photos} index={5} />
        </div>
      </div>
    </div>
  )
}
