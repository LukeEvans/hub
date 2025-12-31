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

  // Use refs to keep the latest values available to the timer without restarting it
  const photosRef = useRef(photos)
  const activePhotosRef = useRef(activePhotos)
  const onPhotoChangeRef = useRef(onPhotoChange)

  // Keep refs up to date
  useEffect(() => {
    photosRef.current = photos
    activePhotosRef.current = activePhotos
    onPhotoChangeRef.current = onPhotoChange
  }, [photos, activePhotos, onPhotoChange])

  const performChange = useCallback(() => {
    const currentPhotos = photosRef.current
    const currentActive = activePhotosRef.current
    
    if (currentPhotos.length === 0) return

    setIsTransitioning(true)
    
    // 600ms exit animation
    setTimeout(() => {
      // Find a photo not currently in use
      const available = currentPhotos.filter(p => !currentActive.includes(p))
      const pool = available.length > 0 ? available : currentPhotos
      const nextPhoto = pool[Math.floor(Math.random() * pool.length)]
      
      setCurrentPhoto(nextPhoto)
      onPhotoChangeRef.current(index, nextPhoto)
      
      // Randomly vary the aspect ratio slightly for masonry effect
      const ratios = ["aspect-[3/4]", "aspect-[2/3]", "aspect-[4/5]", "aspect-[3/5]"]
      setAspectRatio(ratios[Math.floor(Math.random() * ratios.length)])
      
      setIsTransitioning(false)
    }, 600)
  }, [index])

  // Initial photo setup - run only once
  useEffect(() => {
    if (photos.length > 0 && !currentPhoto) {
      const available = photos.filter(p => !activePhotos.includes(p))
      const pool = available.length > 0 ? available : photos
      const initialPhoto = pool[Math.floor(Math.random() * pool.length)]
      setCurrentPhoto(initialPhoto)
      onPhotoChange(index, initialPhoto)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index])

  // Stable recursive timer logic
  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    const scheduleNext = (delay: number) => {
      timeoutId = setTimeout(() => {
        performChange()
        // Schedule next change after 45-60s
        scheduleNext(45000 + Math.random() * 15000)
      }, delay)
    }

    // Initial stagger delay (5s per index)
    scheduleNext(index * 5000 + 5000)

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [index, performChange])

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
        {/* Column 1 */}
        <div className="flex-1 flex flex-col justify-center">
          <PhotoSlot photos={photos} index={0} activePhotos={activePhotos} onPhotoChange={handlePhotoChange} />
          <PhotoSlot photos={photos} index={1} activePhotos={activePhotos} onPhotoChange={handlePhotoChange} />
        </div>
        
        {/* Column 2 */}
        <div className="flex-1 flex flex-col justify-center">
          <PhotoSlot photos={photos} index={2} activePhotos={activePhotos} onPhotoChange={handlePhotoChange} />
          <PhotoSlot photos={photos} index={3} activePhotos={activePhotos} onPhotoChange={handlePhotoChange} />
          <PhotoSlot photos={photos} index={6} activePhotos={activePhotos} onPhotoChange={handlePhotoChange} />
        </div>

        {/* Column 3 */}
        <div className="flex-1 flex flex-col justify-center">
          <PhotoSlot photos={photos} index={4} activePhotos={activePhotos} onPhotoChange={handlePhotoChange} />
          <PhotoSlot photos={photos} index={5} activePhotos={activePhotos} onPhotoChange={handlePhotoChange} />
        </div>
      </div>
    </div>
  )
}
