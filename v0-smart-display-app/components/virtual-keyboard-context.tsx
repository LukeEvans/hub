"use client"

import React, { createContext, useContext, useState, useCallback, useRef } from "react"

interface VirtualKeyboardContextType {
  registerInput: (id: string, ref: HTMLInputElement | null) => void
  onFocus: (id: string) => void
  onBlur: (id: string) => void
  isVisible: boolean
  hideKeyboard: () => void
  activeInputId: string | null
  currentValue: string
  handleKeyPress: (key: string) => void
}

const VirtualKeyboardContext = createContext<VirtualKeyboardContextType | undefined>(undefined)

export function VirtualKeyboardProvider({ children }: { children: React.ReactNode }) {
  const [isVisible, setIsVisible] = useState(false)
  const [activeInputId, setActiveInputId] = useState<string | null>(null)
  const [currentValue, setCurrentValue] = useState("")
  const inputRefs = useRef<Record<string, HTMLInputElement>>({})

  const registerInput = useCallback((id: string, ref: HTMLInputElement | null) => {
    if (ref) {
      inputRefs.current[id] = ref
    } else {
      delete inputRefs.current[id]
    }
  }, [])

  const onFocus = useCallback((id: string) => {
    setActiveInputId(id)
    setCurrentValue(inputRefs.current[id]?.value || "")
    setIsVisible(true)
  }, [])

  const onBlur = useCallback((id: string) => {
    // We don't hide immediately on blur because the user might be clicking the keyboard
    // Instead, we let the keyboard handle its own visibility or use a timeout
  }, [])

  const hideKeyboard = useCallback(() => {
    setIsVisible(false)
    setActiveInputId(null)
  }, [])

  const handleKeyPress = useCallback((key: string) => {
    if (!activeInputId || !inputRefs.current[activeInputId]) return

    const input = inputRefs.current[activeInputId]
    const start = input.selectionStart || 0
    const end = input.selectionEnd || 0
    const value = input.value

    let newValue = value

    if (key === "backspace") {
      if (start === end && start > 0) {
        newValue = value.substring(0, start - 1) + value.substring(end)
      } else if (start !== end) {
        newValue = value.substring(0, start) + value.substring(end)
      }
    } else if (key === "enter") {
      hideKeyboard()
      input.dispatchEvent(new Event("change", { bubbles: true }))
      return
    } else if (key === "space") {
      newValue = value.substring(0, start) + " " + value.substring(end)
    } else {
      newValue = value.substring(0, start) + key + value.substring(end)
    }

    // Use React's internal value setter to ensure onChange is triggered for controlled components
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      input instanceof HTMLTextAreaElement 
        ? window.HTMLTextAreaElement.prototype 
        : window.HTMLInputElement.prototype,
      "value"
    )?.set
    
    if (nativeInputValueSetter) {
      nativeInputValueSetter.call(input, newValue)
    } else {
      input.value = newValue
    }

    // Update selection range
    const newCursorPos = key === "backspace" 
      ? (start === end ? Math.max(0, start - 1) : start)
      : start + (key === "space" ? 1 : key.length)
    
    input.setSelectionRange(newCursorPos, newCursorPos)

    setCurrentValue(newValue)
    
    // Trigger input event so React state updates
    const event = new Event("input", { bubbles: true })
    input.dispatchEvent(event)
    
    // Also trigger change event for good measure
    const changeEvent = new Event("change", { bubbles: true })
    input.dispatchEvent(changeEvent)

    // Keep focus on the input
    input.focus()
  }, [activeInputId, hideKeyboard])

  return (
    <VirtualKeyboardContext.Provider
      value={{
        registerInput,
        onFocus,
        onBlur,
        isVisible,
        hideKeyboard,
        activeInputId,
        currentValue,
        handleKeyPress,
      }}
    >
      {children}
    </VirtualKeyboardContext.Provider>
  )
}

export function useVirtualKeyboard() {
  const context = useContext(VirtualKeyboardContext)
  if (context === undefined) {
    throw new Error("useVirtualKeyboard must be used within a VirtualKeyboardProvider")
  }
  return context
}

