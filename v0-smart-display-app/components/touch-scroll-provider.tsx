"use client"

import { useEffect } from "react"

export function TouchScrollProvider() {
  useEffect(() => {
    let isScrolling = false
    let startY = 0
    let scrollStartTop = 0
    let activeScrollElement: HTMLElement | null = null

    const getScrollableParent = (element: HTMLElement | null): HTMLElement | null => {
      if (!element) return null
      
      const style = window.getComputedStyle(element)
      const overflowY = style.getPropertyValue("overflow-y")
      const isScrollable = overflowY === "auto" || overflowY === "scroll" || element.tagName === "MAIN"
      
      if (isScrollable && element.scrollHeight > element.clientHeight) {
        return element
      }
      
      return getScrollableParent(element.parentElement)
    }

    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement
      if (target.closest('button, a, input, [role="button"], [role="link"]')) {
        return
      }

      const scrollable = getScrollableParent(target)
      if (!scrollable) return

      activeScrollElement = scrollable
      startY = e.clientY
      scrollStartTop = scrollable.scrollTop
      isScrolling = false
    }

    const handlePointerMove = (e: PointerEvent) => {
      if (!activeScrollElement) return
      
      const deltaY = startY - e.clientY
      
      // If we haven't started scrolling yet, check if we've moved enough to start
      if (!isScrolling && Math.abs(deltaY) > 10) {
        isScrolling = true
        activeScrollElement.setPointerCapture(e.pointerId)
      }

      if (isScrolling) {
        activeScrollElement.scrollTop = scrollStartTop + deltaY
      }
    }

    const handlePointerUp = (e: PointerEvent) => {
      if (isScrolling && activeScrollElement) {
        activeScrollElement.releasePointerCapture(e.pointerId)
      }
      isScrolling = false
      activeScrollElement = null
    }

    document.addEventListener("pointerdown", handlePointerDown, { capture: true })
    document.addEventListener("pointermove", handlePointerMove, { capture: true })
    document.addEventListener("pointerup", handlePointerUp, { capture: true })
    document.addEventListener("pointercancel", handlePointerUp, { capture: true })

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, { capture: true })
      document.removeEventListener("pointermove", handlePointerMove, { capture: true })
      document.removeEventListener("pointerup", handlePointerUp, { capture: true })
      document.removeEventListener("pointercancel", handlePointerUp, { capture: true })
    }
  }, [])

  return null
}


