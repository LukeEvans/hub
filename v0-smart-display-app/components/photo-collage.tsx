"use client"

import { useState, useEffect, useCallback, useRef } from "react"

interface PhotoSlotProps {
  photos: string[]
  index: number
  activePhotos: string[]
  onPhotoChange: (index: number, newPhoto: string) => void
}

function PhotoSlot({ photos, index, activePhotos, onPhotoChange }: PhotoSlotProps) {
  const [currentPhoto, setCurrentPhoto] = useState<string>("")
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [aspectRatio, setAspectRatio] = useState<string>("aspect-[3/4]")

  const getUniquePhoto = useCallback(() => {
    if (photos.length === 0) return ""
    
    // Filter out photos that are currently active in other slots
    const availablePhotos = photos.filter(p => !activePhotos.includes(p))
    
    // If we run out of unique photos (e.g. pool is smaller than grid), 
    // fall back to the full pool but try to avoid obvious adjacent duplicates
    const pool = availablePhotos.length > 0 ? availablePhotos : photos
    return pool[Math.floor(Math.random() * pool.length)]
  }, [photos, activePhotos])

  const changePhoto = useCallback(() => {
    setIsTransitioning(true)
    
    setTimeout(() => {
      const nextPhoto = getUniquePhoto()
      setCurrentPhoto(nextPhoto)
      onPhotoChange(index, nextPhoto)
      
      const ratios = ["aspect-[3/4]", "aspect-[2/3]", "aspect-[4/5]", "aspect-[3/5]"]
      setAspectRatio(ratios[Math.floor(Math.random() * ratios.length)])
      
      setIsTransitioning(false)
    }, 600)
  }, [index, getUniquePhoto, onPhotoChange])

  useEffect(() => {
    if (photos.length > 0 && !currentPhoto) {
      const initialPhoto = getUniquePhoto()
      setCurrentPhoto(initialPhoto)
      onPhotoChange(index, initialPhoto)
    }
  }, [photos, currentPhoto, getUniquePhoto, index, onPhotoChange])

  useEffect(() => {
    let interval: NodeJS.Timeout
    const initialDelay = index * 5000 // Increased stagger delay to 5s per slot
    
    const timer = setTimeout(() => {
      // Set the interval to 45-60 seconds for a more relaxed feel
      interval = setInterval(() => {
        changePhoto()
      }, 45000 + Math.random() * 15000)
    }, initialDelay)

    return () => {
      clearTimeout(timer)
      if (interval) clearInterval(interval)
    }
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
  const [activePhotos, setActivePhotos] = useState<string[]>([])
  const activePhotosRef = useRef<string[]>([])

  const handlePhotoChange = useCallback((index: number, newPhoto: string) => {
    const newActivePhotos = [...activePhotosRef.current]
    newActivePhotos[index] = newPhoto
    activePhotosRef.current = newActivePhotos
    setActivePhotos(newActivePhotos)
  }, [])

  if (!photos || photos.length === 0) return null

  return (
    <div className="fixed inset-0 bg-black p-4 overflow-hidden">
      <div className="flex h-full -mx-2">
        <div className="flex-1 flex flex-col justify-center">
          <PhotoSlot photos={photos} index={0} activePhotos={activePhotos} onPhotoChange={handlePhotoChange} />
          <PhotoSlot photos={photos} index={1} activePhotos={activePhotos} onPhotoChange={handlePhotoChange} />
        </div>
        
        <div className="flex-1 flex flex-col justify-center">
          <PhotoSlot photos={photos} index={2} activePhotos={activePhotos} onPhotoChange={handlePhotoChange} />
          <PhotoSlot photos={photos} index={3} activePhotos={activePhotos} onPhotoChange={handlePhotoChange} />
          <PhotoSlot photos={photos} index={6} activePhotos={activePhotos} onPhotoChange={handlePhotoChange} />
        </div>

        <div className="flex-1 flex flex-col justify-center">
          <PhotoSlot photos={photos} index={4} activePhotos={activePhotos} onPhotoChange={handlePhotoChange} />
          <PhotoSlot photos={photos} index={5} activePhotos={activePhotos} onPhotoChange={handlePhotoChange} />
        </div>
      </div>
    </div>
  )
}
