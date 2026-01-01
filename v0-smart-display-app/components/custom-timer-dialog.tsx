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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface CustomTimerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddTimer: (seconds: number, label?: string) => void
}

export function CustomTimerDialog({ open, onOpenChange, onAddTimer }: CustomTimerDialogProps) {
  const [minutes, setMinutes] = useState("5")
  const [seconds, setSeconds] = useState("0")
  const [label, setLabel] = useState("")

  const handleStart = () => {
    const totalSeconds = (parseInt(minutes) || 0) * 60 + (parseInt(seconds) || 0)
    if (totalSeconds > 0) {
      onAddTimer(totalSeconds, label || undefined)
      // Reset fields
      setMinutes("5")
      setSeconds("0")
      setLabel("")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Set Custom Timer</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="minutes">Minutes</Label>
              <Input
                id="minutes"
                type="number"
                min="0"
                max="1440"
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="seconds">Seconds</Label>
              <Input
                id="seconds"
                type="number"
                min="0"
                max="59"
                value={seconds}
                onChange={(e) => setSeconds(e.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="label">Label (Optional)</Label>
            <Input
              id="label"
              placeholder="Pizza, Eggs, etc."
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleStart}>Start Timer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

