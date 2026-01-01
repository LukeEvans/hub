"use client"

import React, { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Plus, Minus } from "lucide-react"

interface CustomTimerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddTimer: (seconds: number, label?: string) => void
}

export function CustomTimerDialog({ open, onOpenChange, onAddTimer }: CustomTimerDialogProps) {
  const [minutes, setMinutes] = useState(5)
  const [seconds, setSeconds] = useState(0)
  const [label, setLabel] = useState("")

  const labelPresets = ["Pizza", "Laundry", "Oven", "Pasta", "Tea"]

  const handleStart = () => {
    const totalSeconds = minutes * 60 + seconds
    if (totalSeconds > 0) {
      onAddTimer(totalSeconds, label || undefined)
      // Reset fields
      setMinutes(5)
      setSeconds(0)
      setLabel("")
    }
  }

  const adjustValue = (type: "min" | "sec", amount: number) => {
    if (type === "min") {
      setMinutes((prev) => Math.max(0, Math.min(1440, prev + amount)))
    } else {
      setSeconds((prev) => {
        let next = prev + amount
        if (next >= 60) {
          setMinutes((m) => m + 1)
          return next - 60
        }
        if (next < 0) {
          if (minutes > 0) {
            setMinutes((m) => m - 1)
            return next + 60
          }
          return 0
        }
        return next
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">Set Custom Timer</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-8 py-8">
          {/* Time Picker */}
          <div className="flex items-center justify-center gap-8">
            {/* Minutes */}
            <div className="flex flex-col items-center gap-3">
              <Button 
                variant="outline" 
                size="icon" 
                className="h-16 w-16 rounded-2xl border-2"
                onClick={() => adjustValue("min", 1)}
              >
                <Plus className="h-8 w-8" />
              </Button>
              <div className="flex flex-col items-center">
                <span className="text-5xl font-mono font-bold">{minutes.toString().padStart(2, "0")}</span>
                <span className="text-xs font-semibold uppercase text-muted-foreground">Min</span>
              </div>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-16 w-16 rounded-2xl border-2"
                onClick={() => adjustValue("min", -1)}
              >
                <Minus className="h-8 w-8" />
              </Button>
            </div>

            <span className="text-5xl font-mono font-bold pb-8">:</span>

            {/* Seconds */}
            <div className="flex flex-col items-center gap-3">
              <Button 
                variant="outline" 
                size="icon" 
                className="h-16 w-16 rounded-2xl border-2"
                onClick={() => adjustValue("sec", 5)}
              >
                <Plus className="h-8 w-8" />
              </Button>
              <div className="flex flex-col items-center">
                <span className="text-5xl font-mono font-bold">{seconds.toString().padStart(2, "0")}</span>
                <span className="text-xs font-semibold uppercase text-muted-foreground">Sec</span>
              </div>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-16 w-16 rounded-2xl border-2"
                onClick={() => adjustValue("sec", -5)}
              >
                <Minus className="h-8 w-8" />
              </Button>
            </div>
          </div>

          {/* Label Presets */}
          <div className="space-y-4">
            <Label className="text-base font-bold px-1">Quick Label</Label>
            <div className="flex flex-wrap gap-2">
              {labelPresets.map((p) => (
                <Button
                  key={p}
                  variant={label === p ? "default" : "outline"}
                  className="h-12 px-5 rounded-full text-base font-semibold border-2"
                  onClick={() => setLabel(label === p ? "" : p)}
                >
                  {p}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="flex-row gap-4 sm:justify-center">
          <Button 
            variant="outline" 
            size="lg" 
            className="h-16 text-xl font-bold flex-1 rounded-2xl border-2" 
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button 
            size="lg" 
            className="h-16 text-xl font-bold flex-1 rounded-2xl" 
            onClick={handleStart}
          >
            Start Timer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

