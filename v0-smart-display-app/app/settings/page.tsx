"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LogIn, Settings, Image as ImageIcon, RefreshCw, Loader2, Volume2, Square, Play, ExternalLink } from "lucide-react"

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null)
  
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
  const pollingRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Fetch Spotify status
    fetch('/api/spotify/status')
      .then(res => res.json())
      .then(data => setSpotifyStatus(data))
      .catch(() => {})
    // Fetch current config
    fetch('/api/google/photos/config')
      .then(res => res.json())
      .then(data => {
        setLastSyncTime(data.lastSyncTime)
      })
      .catch(err => console.error('Failed to fetch Google Photos config:', err))

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

  return (
    <div className="flex-1 p-8">
      <div className="flex items-center gap-4 mb-8">
        <Settings className="w-10 h-10" />
        <h1 className="text-4xl font-bold">Settings</h1>
      </div>

      <div className="max-w-2xl space-y-6">
        {error && (
          <div className="p-4 bg-destructive/15 text-destructive border border-destructive/20 rounded-lg text-sm">
            Error: {error}
          </div>
        )}

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
          </CardContent>
        </Card>

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
      </div>
    </div>
  )
}
