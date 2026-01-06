"use client"

import { useEffect, useRef, useCallback, useState } from "react"

export function PowerManager() {
  const [config, setConfig] = useState<any>(null)
  const [isAsleep, setIsAsleep] = useState(false)
  const [lastWakeTime, setLastWakeTime] = useState(0)
  const checkInterval = useRef<NodeJS.Timeout | null>(null)
  const wakeDuration = 30000 // 30 seconds of wake on touch

  const fetchConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/system/config')
      if (res.ok) {
        const data = await res.json()
        setConfig(data)
      }
    } catch (err) {
      console.error('Failed to fetch system config:', err)
    }
  }, [])

  const setDisplayPower = useCallback(async (power: 'on' | 'off') => {
    try {
      await fetch('/api/system', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: power === 'on' ? 'display_on' : 'display_off' }),
      })
    } catch (err) {
      console.error(`Failed to set display power to ${power}:`, err)
    }
  }, [])

  const checkSchedule = useCallback(() => {
    if (!config || !config.sleepScheduleEnabled) {
      if (isAsleep) {
        setDisplayPower('on')
        setIsAsleep(false)
      }
      return
    }

    const now = new Date()
    const currentMinutes = now.getHours() * 60 + now.getMinutes()
    
    const [startH, startM] = config.sleepStartTime.split(':').map(Number)
    const [endH, endM] = config.sleepEndTime.split(':').map(Number)
    
    const startMinutes = startH * 60 + startM
    const endMinutes = endH * 60 + endM

    let shouldBeAsleep = false
    if (startMinutes < endMinutes) {
      // Daytime sleep (unlikely but possible)
      shouldBeAsleep = currentMinutes >= startMinutes && currentMinutes < endMinutes
    } else {
      // Overnight sleep
      shouldBeAsleep = currentMinutes >= startMinutes || currentMinutes < endMinutes
    }

    // Handle temporary wake-on-touch
    const isTemporarilyAwake = Date.now() - lastWakeTime < wakeDuration

    if (shouldBeAsleep && !isTemporarilyAwake) {
      if (!isAsleep) {
        setDisplayPower('off')
        setIsAsleep(true)
      }
    } else {
      if (isAsleep) {
        setDisplayPower('on')
        setIsAsleep(false)
      }
    }
  }, [config, isAsleep, lastWakeTime, setDisplayPower])

  useEffect(() => {
    fetchConfig()
    // Refresh config every 5 minutes
    const configInterval = setInterval(fetchConfig, 300000)
    return () => clearInterval(configInterval)
  }, [fetchConfig])

  useEffect(() => {
    checkSchedule()
    checkInterval.current = setInterval(checkSchedule, 10000) // Check every 10 seconds
    return () => {
      if (checkInterval.current) clearInterval(checkInterval.current)
    }
  }, [checkSchedule])

  useEffect(() => {
    const handleTouch = () => {
      if (isAsleep) {
        setLastWakeTime(Date.now())
        // Immediately check schedule to wake up
        setTimeout(checkSchedule, 0)
      }
    }

    window.addEventListener('touchstart', handleTouch)
    window.addEventListener('mousedown', handleTouch)
    return () => {
      window.removeEventListener('touchstart', handleTouch)
      window.removeEventListener('mousedown', handleTouch)
    }
  }, [isAsleep, checkSchedule])

  return null // This component doesn't render anything
}

