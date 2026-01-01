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
        <div className="grid gap-6 py-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="grid gap-3">
              <Label htmlFor="minutes" className="text-base font-semibold">Minutes</Label>
              <Input
                id="minutes"
                type="number"
                min="0"
                max="1440"
                className="h-14 text-lg text-center"
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="seconds" className="text-base font-semibold">Seconds</Label>
              <Input
                id="seconds"
                type="number"
                min="0"
                max="59"
                className="h-14 text-lg text-center"
                value={seconds}
                onChange={(e) => setSeconds(e.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-3">
            <Label htmlFor="label" className="text-base font-semibold">Label (Optional)</Label>
            <Input
              id="label"
              placeholder="Pizza, Eggs, etc."
              className="h-14 text-lg"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter className="gap-3">
          <Button variant="outline" size="lg" className="h-14 text-lg flex-1" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button size="lg" className="h-14 text-lg flex-1" onClick={handleStart}>Start Timer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

