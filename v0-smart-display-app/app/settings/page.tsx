"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LogIn, Settings, Image as ImageIcon, RefreshCw, Loader2, Volume2, Square, Play, ExternalLink, Music, Check, Search, Minimize2, X, RotateCcw, Moon, Sun, Power, Monitor } from "lucide-react"
import { useSWRConfig } from "swr"
import { toast } from "sonner"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useOrientation } from "@/lib/orientation-context"
import { cn } from "@/lib/utils"

export default function SettingsPage() {
  const { mutate } = useSWRConfig()
  const { orientation, softwareRotation, setOrientation, setSoftwareRotation } = useOrientation()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null)
  
  // System Config states
  const [systemConfig, setSystemConfig] = useState<any>({
    sleepScheduleEnabled: false,
    sleepStartTime: '22:00',
    sleepEndTime: '07:00',
    softwareRotation: false
  })
  const [isSavingSystemConfig, setIsSavingSystemConfig] = useState(false)
  
  // Google Photos Picker states
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null)
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncCount, setSyncCount] = useState<number | null>(null)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [diagnostics, setDiagnostics] = useState<any>(null)
  const [isRunningDiagnostics, setIsRunningDiagnostics] = useState(false)
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const [pickerStatus, setPickerStatus] = useState<string | null>(null)
  const [selectedCount, setSelectedCount] = useState<number | null>(null)
  const [spotifyStatus, setSpotifyStatus] = useState<any>(null)
  const [isSpotifyLoading, setIsSpotifyLoading] = useState(false)
  const [isSpotifyLoggingOut, setIsSpotifyLoggingOut] = useState(false)
  const [spotifyConfig, setSpotifyConfig] = useState<any>({ primaryPlaylist: '', secondaryPlaylists: [] })
  const [isSavingSpotify, setIsSavingSpotify] = useState(false)

  // Home Assistant states
  const [haEntities, setHaEntities] = useState<any[]>([])
  const [haConfig, setHaConfig] = useState<any>({ selectedEntities: [], entityNames: {} })
  const [isHaLoading, setIsHaLoading] = useState(false)
  const [isSavingHa, setIsSavingHa] = useState(false)
  const [haSearch, setHaSearch] = useState("")
  const [isSystemActionLoading, setIsSystemActionLoading] = useState<string | null>(null)

  const pollingRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Fetch HA config and all entities
    setIsHaLoading(true)
    Promise.all([
      fetch('/api/homeassistant/config').then(res => res.json()),
      fetch('/api/homeassistant/states?all=true').then(res => res.json())
    ]).then(([config, states]) => {
      setHaConfig(config)
      setHaEntities(states.entities || [])
    }).catch(err => console.error('Failed to fetch HA data:', err))
      .finally(() => setIsHaLoading(false))

    // Fetch Spotify status
    fetch('/api/spotify/status')
      .then(res => res.json())
      .then(data => setSpotifyStatus(data))
      .catch(() => {})
    
    // Fetch Spotify config
    fetch('/api/spotify/config')
      .then(res => res.json())
      .then(data => setSpotifyConfig(data))
      .catch(() => {})

    // Fetch current config
    fetch('/api/google/photos/config')
      .then(res => res.json())
      .then(data => {
        setLastSyncTime(data.lastSyncTime)
      })
      .catch(err => console.error('Failed to fetch Google Photos config:', err))

    // Fetch system config
    fetch('/api/system/config')
      .then(res => res.json())
      .then(data => setSystemConfig(data))
      .catch(err => console.error('Failed to fetch system config:', err))

    // Check if we have picker media saved
    fetch('/api/google/photos/picker/status')
      .then(res => res.json())
      .then(data => {
        if (data.count) {
          setSelectedCount(data.count)
        }
      })
      .catch(() => {})

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [])

  useEffect(() => {
    return () => {
      if (audio) {
        audio.pause()
      }
    }
  }, [audio])

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/google/auth-url")
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`)
      }
      const data = await response.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setError("No URL returned from server")
      }
    } catch (err) {
      console.error("Failed to fetch auth URL:", err)
      setError(err instanceof Error ? err.message : "Failed to connect to server")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogout = async () => {
    if (!confirm("Are you sure you want to disconnect your Google account? This will clear all synced photos.")) return
    
    setIsLoggingOut(true)
    setError(null)
    try {
      const response = await fetch("/api/google/logout", { method: "POST" })
      if (!response.ok) {
        throw new Error("Failed to logout")
      }
      // Clear local states
      setLastSyncTime(null)
      setSyncCount(null)
      setSelectedCount(null)
      alert("Successfully disconnected from Google. You can now log in fresh.")
    } catch (err) {
      console.error("Logout failed:", err)
      setError("Failed to disconnect Google account")
    } finally {
      setIsLoggingOut(false)
    }
  }

  const handleSpotifyLogin = async () => {
    setIsSpotifyLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/spotify/auth-url")
      if (!response.ok) throw new Error("Failed to get auth URL")
      const data = await response.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch (err) {
      console.error("Spotify login failed:", err)
      setError("Failed to connect to Spotify")
    } finally {
      setIsSpotifyLoading(false)
    }
  }

  const handleSpotifyLogout = async () => {
    if (!confirm("Are you sure you want to disconnect your Spotify account?")) return
    setIsSpotifyLoggingOut(true)
    try {
      await fetch("/api/spotify/logout", { method: "POST" })
      setSpotifyStatus({ connected: false })
      alert("Successfully disconnected from Spotify.")
    } catch (err) {
      console.error("Spotify logout failed:", err)
      setError("Failed to disconnect Spotify")
    } finally {
      setIsSpotifyLoggingOut(false)
    }
  }

  const handleSaveSpotifyConfig = async () => {
    setIsSavingSpotify(true)
    try {
      const response = await fetch("/api/spotify/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(spotifyConfig),
      })
      if (response.ok) {
        alert("Spotify configuration saved!")
      }
    } catch (err) {
      console.error("Failed to save Spotify config:", err)
      setError("Failed to save Spotify config")
    } finally {
      setIsSavingSpotify(false)
    }
  }

  const runDiagnostics = async () => {
    setIsRunningDiagnostics(true)
    setDiagnostics(null)
    try {
      const res = await fetch('/api/google/diagnostics')
      const data = await res.json()
      setDiagnostics(data)
    } catch (err) {
      console.error('Diagnostics failed:', err)
      setError('Failed to run diagnostics')
    } finally {
      setIsRunningDiagnostics(false)
    }
  }

  const handlePickPhotos = async () => {
    setIsPickerOpen(true)
    setPickerStatus('Creating session...')
    setError(null)
    
    try {
      // Create a picker session
      const response = await fetch('/api/google/photos/picker', { method: 'POST' })
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create picker session')
      }

      // Open the picker URL in a new window
      const pickerUrl = data.pickerUri + '/autoclose'
      setPickerStatus('Opening Google Photos...')
      window.open(pickerUrl, '_blank', 'width=800,height=600')
      
      setPickerStatus('Waiting for selection...')
      
      // Start polling for completion
      pollingRef.current = setInterval(async () => {
        try {
          const statusRes = await fetch('/api/google/photos/picker/status')
          const statusData = await statusRes.json()
          
          if (statusData.status === 'complete') {
            if (pollingRef.current) clearInterval(pollingRef.current)
            setSelectedCount(statusData.count)
            setPickerStatus(null)
            setIsPickerOpen(false)
          }
        } catch (err) {
          console.error('Polling error:', err)
        }
      }, 2000)
      
      // Stop polling after 5 minutes
      setTimeout(() => {
        if (pollingRef.current) {
          clearInterval(pollingRef.current)
          setPickerStatus(null)
          setIsPickerOpen(false)
        }
      }, 5 * 60 * 1000)
      
    } catch (err) {
      console.error('Picker failed:', err)
      setError(err instanceof Error ? err.message : 'Failed to open photo picker')
      setPickerStatus(null)
      setIsPickerOpen(false)
    }
  }

  const handleSync = async () => {
    setIsSyncing(true)
    setError(null)
    setSyncCount(null)
    try {
      const response = await fetch('/api/google/photos/sync', { method: 'POST' })
      const data = await response.json()
      if (response.ok) {
        setLastSyncTime(data.lastSyncTime)
        setSyncCount(data.count)
      } else {
        throw new Error(data.error || 'Sync failed')
      }
    } catch (err) {
      console.error('Sync failed:', err)
      setError(err instanceof Error ? err.message : 'Failed to sync photos')
    } finally {
      setIsSyncing(false)
    }
  }

  const handlePlaySound = () => {
    if (isPlaying) {
      audio?.pause()
      setIsPlaying(false)
      setAudio(null)
      return
    }

    const newAudio = new Audio("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3")
    newAudio.onended = () => {
      setIsPlaying(false)
      setAudio(null)
    }
    newAudio.play().catch(err => {
      console.error("Failed to play sound:", err)
      setError("Failed to play sound. Please check your browser's audio permissions.")
    })
    setAudio(newAudio)
    setIsPlaying(true)
  }

  const handleSaveSystemConfig = async (newConfig: any) => {
    setIsSavingSystemConfig(true)
    try {
      const response = await fetch('/api/system/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig),
      })
      if (response.ok) {
        setSystemConfig(newConfig)
        toast.success("System configuration saved!")
      } else {
        throw new Error("Failed to save configuration")
      }
    } catch (err: any) {
      console.error("Failed to save system config:", err)
      toast.error(err.message || "Failed to save system config")
    } finally {
      setIsSavingSystemConfig(false)
    }
  }

  const handleSystemAction = async (action: string) => {
    if (!confirm(`Are you sure you want to ${action === 'quit' ? 'close the app' : action}?`)) return
    
    setIsSystemActionLoading(action)
    try {
      const response = await fetch('/api/system', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      const data = await response.json()
      
      if (data.success) {
        if (action === 'quit') {
          toast.success("Close command sent. The app will close shortly.")
          setTimeout(() => window.close(), 1000)
        } else {
          toast.success(`System ${action} initiated.`)
        }
      } else {
        throw new Error(data.error || 'Failed to execute system action')
      }
    } catch (err: any) {
      console.error('System action failed:', err)
      toast.error(err.message || 'Failed to execute system action')
      setError(err.message || 'Failed to execute system action')
    } finally {
      setIsSystemActionLoading(null)
    }
  }

  const handleSaveHaConfig = async () => {
    setIsSavingHa(true)
    try {
      const response = await fetch("/api/homeassistant/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(haConfig),
      })
      if (response.ok) {
        // Trigger a revalidation of the curated states so the Home page updates
        mutate('/api/homeassistant/states')
        toast.success("Home Assistant configuration saved!")
      } else {
        throw new Error("Failed to save configuration")
      }
    } catch (err: any) {
      console.error("Failed to save HA config:", err)
      setError(err.message || "Failed to save Home Assistant config")
      toast.error(err.message || "Failed to save HA config")
    } finally {
      setIsSavingHa(false)
    }
  }

  const toggleHaEntity = (entityId: string) => {
    setHaConfig((prev: any) => {
      const selected = prev.selectedEntities || []
      const newSelected = selected.includes(entityId)
        ? selected.filter((id: string) => id !== entityId)
        : [...selected, entityId]
      return { ...prev, selectedEntities: newSelected }
    })
  }

  const filteredHaEntities = haEntities.filter(e => 
    e.entity_id.toLowerCase().includes(haSearch.toLowerCase()) ||
    (e.attributes.friendly_name || "").toLowerCase().includes(haSearch.toLowerCase())
  )

  return (
    <div className={cn(
      "flex-1 transition-all duration-300",
      orientation === 'landscape' ? "p-8" : "p-4 pb-24"
    )}>
      <div className={cn(
        "flex items-center gap-4 mb-8",
        orientation === 'portrait' && "flex-col text-center"
      )}>
        <Settings className="w-10 h-10" />
        <h1 className="text-4xl font-bold">Settings</h1>
      </div>

      <div className={cn(
        "max-w-2xl space-y-6 mx-auto",
        orientation === 'portrait' && "max-w-full"
      )}>
        {error && (
          <div className="p-4 bg-destructive/15 text-destructive border border-destructive/20 rounded-lg text-sm">
            Error: {error}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Display Settings</CardTitle>
            <CardDescription>
              Adjust how the app looks on your device.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className={cn(
              "flex items-center justify-between p-6 border-2 rounded-xl gap-4",
              orientation === 'portrait' && "flex-col text-center"
            )}>
              <div className={cn(
                "flex items-center gap-4",
                orientation === 'portrait' && "flex-col"
              )}>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Monitor className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-lg">Screen Orientation</p>
                  <p className="text-sm text-muted-foreground">Toggle between landscape and portrait</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Label className={`text-sm ${orientation === 'landscape' ? 'font-bold' : 'text-muted-foreground'}`}>Landscape</Label>
                <Switch 
                  checked={orientation === 'portrait'}
                  onCheckedChange={(checked) => setOrientation(checked ? 'portrait' : 'landscape')}
                />
                <Label className={`text-sm ${orientation === 'portrait' ? 'font-bold' : 'text-muted-foreground'}`}>Portrait</Label>
              </div>
            </div>

            <div className={cn(
              "flex items-center justify-between p-6 border-2 rounded-xl gap-4 bg-muted/30",
              orientation === 'portrait' && "flex-col text-center"
            )}>
              <div className={cn(
                "flex items-center gap-4",
                orientation === 'portrait' && "flex-col"
              )}>
                <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500">
                  <RotateCcw className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-lg">Software Rotation Fallback</p>
                  <p className="text-sm text-muted-foreground">Force 90° flip via CSS if OS rotation fails</p>
                </div>
              </div>
              <Switch 
                checked={softwareRotation}
                onCheckedChange={setSoftwareRotation}
                disabled={orientation === 'landscape'}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Authentication</CardTitle>
            <CardDescription>
              Manage your connections to external services.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 border-2 rounded-xl gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#4285F4] flex items-center justify-center text-white text-xl font-bold">
                  G
                </div>
                <div>
                  <p className="font-bold text-lg">Google Account</p>
                  <p className="text-sm text-muted-foreground">Required for Calendar and Photos</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <Button 
                  onClick={handleGoogleLogin} 
                  disabled={isLoading || isLoggingOut}
                  className="h-14 px-8 gap-3 text-lg font-semibold flex-1"
                >
                  <LogIn className="w-5 h-5" />
                  {isLoading ? "Redirecting..." : "Login"}
                </Button>
                <Button 
                  onClick={runDiagnostics}
                  disabled={isLoading || isLoggingOut || isRunningDiagnostics}
                  variant="secondary"
                  className="h-14 px-8 gap-3 text-lg font-semibold flex-1"
                >
                  {isRunningDiagnostics ? <Loader2 className="w-5 h-5 animate-spin" /> : <Settings className="w-5 h-5" />}
                  Test
                </Button>
                <Button 
                  onClick={handleGoogleLogout} 
                  disabled={isLoading || isLoggingOut}
                  variant="destructive"
                  className="h-14 px-8 gap-3 text-lg font-semibold flex-1"
                >
                  {isLoggingOut ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
                  Disconnect
                </Button>
              </div>
            </div>

            {/* 
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 border-2 rounded-xl gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#1DB954] flex items-center justify-center text-white">
                  <Music className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-lg">Spotify Account</p>
                  <p className="text-sm text-muted-foreground">
                    {spotifyStatus?.connected 
                      ? `Connected as ${spotifyStatus.display_name || 'user'}` 
                      : 'Required for Spotify tab'}
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                {!spotifyStatus?.connected ? (
                  <Button 
                    onClick={handleSpotifyLogin} 
                    disabled={isSpotifyLoading}
                    className="h-14 px-8 gap-3 text-lg font-semibold flex-1 bg-[#1DB954] hover:bg-[#1ed760] text-white border-none"
                  >
                    <LogIn className="w-5 h-5" />
                    {isSpotifyLoading ? "Redirecting..." : "Connect Spotify"}
                  </Button>
                ) : (
                  <Button 
                    onClick={handleSpotifyLogout} 
                    disabled={isSpotifyLoggingOut}
                    variant="destructive"
                    className="h-14 px-8 gap-3 text-lg font-semibold flex-1"
                  >
                    {isSpotifyLoggingOut ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
                    Disconnect
                  </Button>
                )}
              </div>
            </div>
            */}
          </CardContent>
        </Card>

        {/* 
        <Card>
          <CardHeader>
            <CardTitle>Spotify Iframe Settings</CardTitle>
            <CardDescription>
              Configure the Spotify playlists to display in the Music tab. Use the full Spotify URL (e.g., https://open.spotify.com/playlist/...).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Primary Playlist URL</label>
              <Input 
                value={spotifyConfig.primaryPlaylist}
                onChange={(e) => setSpotifyConfig({ ...spotifyConfig, primaryPlaylist: e.target.value })}
                placeholder="https://open.spotify.com/playlist/..."
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Secondary Playlist URLs (one per line)</label>
              <textarea 
                className="w-full min-h-[100px] p-3 rounded-md border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={spotifyConfig.secondaryPlaylists?.join('\n')}
                onChange={(e) => setSpotifyConfig({ 
                  ...spotifyConfig, 
                  secondaryPlaylists: e.target.value.split('\n').filter(url => url.trim() !== '') 
                })}
                placeholder="https://open.spotify.com/playlist/..."
              />
            </div>
            <Button 
              onClick={handleSaveSpotifyConfig}
              disabled={isSavingSpotify}
              className="w-full h-12 gap-2"
            >
              {isSavingSpotify ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Save Spotify Configuration
            </Button>
            <div className="pt-2 text-xs text-muted-foreground flex items-center gap-2 bg-muted/30 p-3 rounded-lg border">
              <span className="text-lg">💡</span>
              <p>Since Spotify has paused new API registrations, we use iframes. To control your Alexa, use the <strong>Launch Web Player</strong> button on the Music page.</p>
            </div>
          </CardContent>
        </Card>
        */}

        <Card>
          <CardHeader>
            <CardTitle>Google Photos</CardTitle>
            <CardDescription>
              Pick photos from your Google Photos library to display on your smart display.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 border-2 rounded-xl gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-lg">Photo Selection</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedCount !== null 
                      ? `${selectedCount} photos selected`
                      : 'No photos selected yet'}
                  </p>
                  {pickerStatus && (
                    <p className="text-sm text-primary animate-pulse">{pickerStatus}</p>
                  )}
                </div>
              </div>
              <Button 
                onClick={handlePickPhotos}
                disabled={isPickerOpen}
                className="w-full sm:w-auto h-14 px-8 gap-3 text-lg font-semibold"
              >
                {isPickerOpen ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <ExternalLink className="w-5 h-5" />
                )}
                {isPickerOpen ? "Picking..." : "Pick Photos"}
              </Button>
            </div>

            {diagnostics && (
              <div className="p-6 border-2 rounded-xl bg-muted/20 space-y-3">
                <p className="font-bold">Connection Diagnostics</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="p-3 bg-background rounded-lg border">
                    <p className="text-muted-foreground">Calendar API</p>
                    <p className={`font-mono ${diagnostics.calendar?.status === 200 ? 'text-green-500' : 'text-red-500'}`}>
                      {diagnostics.calendar?.status === 200 ? 'SUCCESS' : `FAILED (${diagnostics.calendar?.status})`}
                    </p>
                  </div>
                  <div className="p-3 bg-background rounded-lg border">
                    <p className="text-muted-foreground">Photos API</p>
                    <p className={`font-mono ${diagnostics.photos?.status === 'Success (200)' ? 'text-green-500' : 'text-red-500'}`}>
                      {diagnostics.photos?.status === 'Success (200)' ? 'SUCCESS' : `FAILED (${diagnostics.photos?.status})`}
                    </p>
                  </div>
                </div>
                {diagnostics.token && (
                  <div className="p-3 bg-background rounded-lg border space-y-3">
                    <div>
                      <p className="text-muted-foreground mb-2">Actual Access Token Scopes <span className="text-xs">(from Google)</span></p>
                      <div className="flex flex-wrap gap-1">
                        {diagnostics.token.actualScopes?.length > 0 ? (
                          diagnostics.token.actualScopes.map((scope: string, i: number) => {
                            const isPhotosScope = scope.includes('photospicker') || scope.includes('photoslibrary');
                            const isCalendarScope = scope.includes('calendar');
                            return (
                              <span 
                                key={i} 
                                className={`px-2 py-0.5 rounded text-xs font-mono ${
                                  isPhotosScope ? 'bg-green-500/20 text-green-400' :
                                  isCalendarScope ? 'bg-blue-500/20 text-blue-400' :
                                  'bg-muted text-muted-foreground'
                                }`}
                              >
                                {scope.split('/').pop()}
                              </span>
                            );
                          })
                        ) : (
                          <span className="text-red-400 text-xs">Could not verify token scopes!</span>
                        )}
                      </div>
                      {diagnostics.token.actualScopes && !diagnostics.token.actualScopes.some((s: string) => s.includes('photospicker')) && (
                        <p className="text-red-400 text-xs mt-2">
                          ⚠️ Access token missing photos picker scope! Click Disconnect, then Login again.
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-2 text-xs">Stored Token Scopes <span className="opacity-50">(may be stale)</span></p>
                      <div className="flex flex-wrap gap-1">
                        {diagnostics.token.storedScopes?.map((scope: string, i: number) => (
                          <span key={i} className="px-2 py-0.5 rounded text-xs font-mono bg-muted text-muted-foreground">
                            {scope.split('/').pop()}
                          </span>
                        ))}
                      </div>
                    </div>
                    {diagnostics.token.tokenInfoError && (
                      <p className="text-red-400 text-xs">Token verification error: {JSON.stringify(diagnostics.token.tokenInfoError)}</p>
                    )}
                  </div>
                )}
                {diagnostics.photos?.error && (
                  <div className="space-y-2">
                    <pre className="p-3 bg-black text-xs text-red-400 rounded-lg overflow-auto max-h-40">
                      {JSON.stringify(diagnostics.photos.error, null, 2)}
                    </pre>
                    {diagnostics.photos.hint && (
                      <div className="p-3 bg-blue-500/20 text-blue-200 text-xs rounded-lg border border-blue-500/30">
                        <strong>Hint:</strong> {diagnostics.photos.hint}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 border-2 rounded-xl bg-muted/30 gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <RefreshCw className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-lg">Local Cache Status</p>
                  <p className="text-sm text-muted-foreground">
                    {lastSyncTime ? (
                      <>
                        Last synced: {new Date(lastSyncTime).toLocaleString()}
                        {syncCount !== null && ` (${syncCount} images)`}
                      </>
                    ) : 'Never synced'}
                  </p>
                </div>
              </div>
              <Button 
                onClick={handleSync} 
                disabled={isSyncing || selectedCount === null || selectedCount === 0}
                variant="outline"
                className="w-full sm:w-auto h-14 px-8 gap-3 text-lg font-semibold border-2"
              >
                {isSyncing ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <RefreshCw className="w-5 h-5" />
                )}
                {isSyncing ? "Syncing..." : "Sync Now"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Home Assistant Entities</CardTitle>
            <CardDescription>
              Select which devices should appear on your Smart Home dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search entities (e.g. light, living room)..." 
                  value={haSearch}
                  onChange={(e) => setHaSearch(e.target.value)}
                  className="h-12 pl-10"
                />
              </div>
              <Button 
                onClick={handleSaveHaConfig}
                disabled={isSavingHa}
                className="h-12 px-6 gap-2"
              >
                {isSavingHa ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                Save Selection
              </Button>
            </div>
            
            <div className="border rounded-xl overflow-hidden bg-muted/10">
              <div className="max-h-[400px] overflow-y-auto">
                {isHaLoading ? (
                  <div className="p-12 flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Loading entities from Home Assistant...</p>
                  </div>
                ) : (
                  <div className="divide-y border-t">
                    {filteredHaEntities.length === 0 && (
                      <div className="p-12 text-center text-muted-foreground italic">
                        No entities found matching "{haSearch}"
                      </div>
                    )}
                    {filteredHaEntities.map((entity) => {
                      const isSelected = haConfig.selectedEntities?.includes(entity.entity_id)
                      return (
                        <div 
                          key={entity.entity_id}
                          className={`flex items-center justify-between p-4 hover:bg-muted/50 transition-colors cursor-pointer ${
                            isSelected ? 'bg-primary/10' : ''
                          }`}
                          onClick={() => toggleHaEntity(entity.entity_id)}
                        >
                          <div className="flex-1 min-w-0 pr-4">
                            <div className="flex items-center gap-2">
                              <p className={`font-semibold truncate ${isSelected ? 'text-primary' : ''}`}>
                                {entity.attributes.friendly_name || entity.entity_id}
                              </p>
                              {isSelected && <Check className="w-4 h-4 text-primary" />}
                            </div>
                            <p className="text-xs text-muted-foreground font-mono truncate">
                              {entity.entity_id}
                            </p>
                          </div>
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                            isSelected 
                              ? 'bg-primary border-primary' 
                              : 'border-muted-foreground/30'
                          }`}>
                            {isSelected && (
                              <div className="w-2 h-2 rounded-full bg-white" />
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
            
            <p className="text-xs text-muted-foreground">
              Tip: Start by selecting just your most-used lights, climate controls, and locks.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hardware Test</CardTitle>
            <CardDescription>
              Test your device's hardware components.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 border-2 rounded-xl bg-muted/30 gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Volume2 className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-lg">Speaker Test</p>
                  <p className="text-sm text-muted-foreground">
                    Play a high-quality audio track to check internal speakers.
                  </p>
                </div>
              </div>
              <Button 
                onClick={handlePlaySound} 
                variant={isPlaying ? "destructive" : "outline"}
                className="w-full sm:w-auto h-14 px-8 gap-3 text-lg font-semibold border-2"
              >
                {isPlaying ? (
                  <>
                    <Square className="w-5 h-5 fill-current" />
                    Stop Sound
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 fill-current" />
                    Play Sound
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Power Management</CardTitle>
            <CardDescription>
              Configure when the display should automatically turn off to save power.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-6 border-2 rounded-xl gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Moon className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-lg">Sleep Schedule</p>
                  <p className="text-sm text-muted-foreground">Automatically turn off display at night</p>
                </div>
              </div>
              <Switch 
                checked={systemConfig.sleepScheduleEnabled}
                onCheckedChange={(checked) => handleSaveSystemConfig({ ...systemConfig, sleepScheduleEnabled: checked })}
                disabled={isSavingSystemConfig}
              />
            </div>

            {systemConfig.sleepScheduleEnabled && (
              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 border-2 rounded-xl bg-muted/30 space-y-3">
                  <div className="flex items-center gap-3 text-primary">
                    <Moon className="w-5 h-5" />
                    <Label className="font-bold">Sleep Time</Label>
                  </div>
                  <Input 
                    type="time" 
                    value={systemConfig.sleepStartTime}
                    onChange={(e) => setSystemConfig({ ...systemConfig, sleepStartTime: e.target.value })}
                    onBlur={() => handleSaveSystemConfig(systemConfig)}
                    className="h-12 text-lg"
                  />
                </div>
                <div className="p-6 border-2 rounded-xl bg-muted/30 space-y-3">
                  <div className="flex items-center gap-3 text-primary">
                    <Sun className="w-5 h-5" />
                    <Label className="font-bold">Wake Time</Label>
                  </div>
                  <Input 
                    type="time" 
                    value={systemConfig.sleepEndTime}
                    onChange={(e) => setSystemConfig({ ...systemConfig, sleepEndTime: e.target.value })}
                    onBlur={() => handleSaveSystemConfig(systemConfig)}
                    className="h-12 text-lg"
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={() => handleSystemAction('display_off')}
                variant="outline"
                className="flex-1 h-14 gap-3 text-lg font-semibold border-2"
                disabled={isSystemActionLoading !== null}
              >
                <Power className="w-5 h-5" />
                Turn Display Off
              </Button>
              <Button 
                onClick={() => handleSystemAction('display_on')}
                variant="outline"
                className="flex-1 h-14 gap-3 text-lg font-semibold border-2"
                disabled={isSystemActionLoading !== null}
              >
                <Sun className="w-5 h-5" />
                Turn Display On
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System</CardTitle>
            <CardDescription>
              Manage the application window and device.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 border-2 rounded-xl gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Minimize2 className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-lg">Minimize / Close</p>
                  <p className="text-sm text-muted-foreground">
                    Try to close the app window to access the OS.
                  </p>
                </div>
              </div>
              <Button 
                onClick={() => handleSystemAction('quit')}
                disabled={isSystemActionLoading !== null}
                variant="outline"
                className="w-full sm:w-auto h-14 px-8 gap-3 text-lg font-semibold border-2"
              >
                {isSystemActionLoading === 'quit' ? <Loader2 className="w-5 h-5 animate-spin" /> : <X className="w-5 h-5" />}
                Close App
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col items-start p-6 border-2 rounded-xl bg-muted/30 gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <RotateCcw className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-lg">Reboot</p>
                    <p className="text-sm text-muted-foreground">Restart the display.</p>
                  </div>
                </div>
                <Button 
                  onClick={() => handleSystemAction('reboot')}
                  disabled={isSystemActionLoading !== null}
                  variant="outline"
                  className="w-full h-14 px-8 gap-3 text-lg font-semibold border-2"
                >
                  {isSystemActionLoading === 'reboot' ? <Loader2 className="w-5 h-5 animate-spin" /> : <RotateCcw className="w-5 h-5" />}
                  Reboot Device
                </Button>
              </div>

              <div className="flex flex-col items-start p-6 border-2 rounded-xl bg-muted/30 gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
                    <Minimize2 className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-lg">Shutdown</p>
                    <p className="text-sm text-muted-foreground">Turn off the device.</p>
                  </div>
                </div>
                <Button 
                  onClick={() => handleSystemAction('shutdown')}
                  disabled={isSystemActionLoading !== null}
                  variant="destructive"
                  className="w-full h-14 px-8 gap-3 text-lg font-semibold border-2"
                >
                  {isSystemActionLoading === 'shutdown' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Minimize2 className="w-5 h-5" />}
                  Power Off
                </Button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 border-2 rounded-xl bg-muted/30 gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <RefreshCw className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-lg">Reload App</p>
                  <p className="text-sm text-muted-foreground">
                    Refresh the page to clear states or update.
                  </p>
                </div>
              </div>
              <Button 
                onClick={() => window.location.reload()}
                variant="outline"
                className="w-full sm:w-auto h-14 px-8 gap-3 text-lg font-semibold border-2"
              >
                <RefreshCw className="w-5 h-5" />
                Reload
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
