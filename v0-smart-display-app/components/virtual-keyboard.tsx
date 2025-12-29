"use client"

import React, { useState } from "react"
import { useVirtualKeyboard } from "./virtual-keyboard-context"
import { Button } from "@/components/ui/button"
import { X, Delete, ArrowUp, Space, CornerDownLeft } from "lucide-react"
import { cn } from "@/lib/utils"

const LAYOUT = {
  default: [
    ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
    ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
    ["shift", "z", "x", "c", "v", "b", "n", "m", "backspace"],
    ["?123", "space", "enter"],
  ],
  shift: [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["shift", "Z", "X", "C", "V", "B", "N", "M", "backspace"],
    ["?123", "space", "enter"],
  ],
  numbers: [
    ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
    ["-", "/", ":", ";", "(", ")", "$", "&", "@", "\""],
    ["#+=", ".", ",", "?", "!", "'", "backspace"],
    ["ABC", "space", "enter"],
  ],
}

export function VirtualKeyboard() {
  const { isVisible, hideKeyboard, handleKeyPress } = useVirtualKeyboard()
  const [layout, setLayout] = useState<keyof typeof LAYOUT>("default")

  if (!isVisible) return null

  const renderKey = (key: string) => {
    let content: React.ReactNode = key
    let className = "h-12 flex-1 min-w-[2.5rem] p-0 text-lg font-medium"
    let onClick = () => handleKeyPress(key)

    if (key === "shift") {
      content = <ArrowUp className="w-5 h-5" />
      className = cn(className, "bg-muted text-muted-foreground")
      onClick = () => setLayout(layout === "shift" ? "default" : "shift")
    } else if (key === "backspace") {
      content = <Delete className="w-5 h-5" />
      className = cn(className, "bg-muted text-muted-foreground flex-[1.5]")
      onClick = () => handleKeyPress("backspace")
    } else if (key === "?123") {
      content = "?123"
      className = cn(className, "bg-muted text-muted-foreground flex-[1.5]")
      onClick = () => setLayout("numbers")
    } else if (key === "ABC") {
      content = "ABC"
      className = cn(className, "bg-muted text-muted-foreground flex-[1.5]")
      onClick = () => setLayout("default")
    } else if (key === "space") {
      content = <Space className="w-5 h-5" />
      className = cn(className, "flex-[5]")
      onClick = () => handleKeyPress("space")
    } else if (key === "enter") {
      content = <CornerDownLeft className="w-5 h-5" />
      className = cn(className, "bg-primary text-primary-foreground flex-[1.5]")
      onClick = () => handleKeyPress("enter")
    } else if (key === "#+=") {
      content = "#+="
      className = cn(className, "bg-muted text-muted-foreground flex-[1.5]")
      // For simplicity, just keep numbers for now
      onClick = () => {}
    }

    return (
      <Button
        key={key}
        variant="outline"
        className={className}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          onClick()
        }}
        onPointerDown={(e) => e.preventDefault()} // Prevent focus stealing
      >
        {content}
      </Button>
    )
  }

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-[100] bg-background/95 backdrop-blur-sm border-t p-4 shadow-2xl transition-transform duration-300 ease-in-out"
      onPointerDown={(e) => e.preventDefault()} // Prevent focus stealing from input
    >
      <div className="max-w-3xl mx-auto space-y-2">
        <div className="flex justify-end mb-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={hideKeyboard}
            className="h-8 w-8 rounded-full"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        {LAYOUT[layout === "#+=" ? "numbers" : layout].map((row, i) => (
          <div key={i} className="flex gap-1.5 justify-center">
            {row.map((key) => renderKey(key))}
          </div>
        ))}
      </div>
    </div>
  )
}

