"use client"

import { useEffect } from "react"

export function TouchScrollProvider() {
  useEffect(() => {
    let startY = 0
    let scrollStartTop = 0
    let mainElement: HTMLElement | null = null

    const handleTouchStart = (e: TouchEvent) => {
      mainElement = document.querySelector("main")
      if (!mainElement) return
      
      startY = e.touches[0].clientY
      scrollStartTop = mainElement.scrollTop
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!mainElement) return
      
      const currentY = e.touches[0].clientY
      const deltaY = startY - currentY
      
      mainElement.scrollTop = scrollStartTop + deltaY
    }

    document.addEventListener("touchstart", handleTouchStart, { passive: true })
    document.addEventListener("touchmove", handleTouchMove, { passive: true })

    return () => {
      document.removeEventListener("touchstart", handleTouchStart)
      document.removeEventListener("touchmove", handleTouchMove)
    }
  }, [])

  return null
}

