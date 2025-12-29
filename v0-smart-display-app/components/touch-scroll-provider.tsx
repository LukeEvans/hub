"use client"

import { useEffect } from "react"

export function TouchScrollProvider() {
  useEffect(() => {
    const mainElement = document.querySelector("main")
    if (!mainElement) return

    let isScrolling = false
    let startY = 0
    let scrollStartTop = 0

    const handlePointerDown = (e: PointerEvent) => {
      isScrolling = true
      startY = e.clientY
      scrollStartTop = mainElement.scrollTop
      mainElement.setPointerCapture(e.pointerId)
    }

    const handlePointerMove = (e: PointerEvent) => {
      if (!isScrolling) return
      
      const deltaY = startY - e.clientY
      mainElement.scrollTop = scrollStartTop + deltaY
    }

    const handlePointerUp = (e: PointerEvent) => {
      isScrolling = false
      mainElement.releasePointerCapture(e.pointerId)
    }

    mainElement.addEventListener("pointerdown", handlePointerDown)
    mainElement.addEventListener("pointermove", handlePointerMove)
    mainElement.addEventListener("pointerup", handlePointerUp)
    mainElement.addEventListener("pointercancel", handlePointerUp)

    return () => {
      mainElement.removeEventListener("pointerdown", handlePointerDown)
      mainElement.removeEventListener("pointermove", handlePointerMove)
      mainElement.removeEventListener("pointerup", handlePointerUp)
      mainElement.removeEventListener("pointercancel", handlePointerUp)
    }
  }, [])

  return null
}


