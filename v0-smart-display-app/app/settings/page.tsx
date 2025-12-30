"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LogIn, Settings, Image as ImageIcon, RefreshCw, Check, Loader2, Volume2, Square, Play } from "lucide-react"

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null)
  
  // Google Photos states
  const [albums, setAlbums] = useState<any[]>([])
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null)
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null)
  const [isSyncing, setIsSyncing] = useState(false)
  const [isFetchingAlbums, setIsFetchingAlbums] = useState(false)
  const [syncCount, setSyncCount] = useState<number | null>(null)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [diagnostics, setDiagnostics] = useState<any>(null)
  const [isRunningDiagnostics, setIsRunningDiagnostics] = useState(false)

  useEffect(() => {
    // Fetch current config
    fetch('/api/google/photos/config')
      .then(res => res.json())
      .then(data => {
        setSelectedAlbumId(data.selectedAlbumId)
        setLastSyncTime(data.lastSyncTime)
      })
      .catch(err => console.error('Failed to fetch Google Photos config:', err))

    // Fetch available albums
    setIsFetchingAlbums(true)
    fetch('/api/google/photos/albums')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch albums');
        return res.json();
      })
      .then(data => {
        if (data.albums) setAlbums(data.albums)
        if (data.error) setError(data.error)
      })
      .catch(err => {
        console.error('Failed to fetch albums:', err)
        setError('Failed to load Google Photos albums. Check connection and authentication.')
      })
      .finally(() => setIsFetchingAlbums(false))
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
      setAlbums([])
      setSelectedAlbumId(null)
      setLastSyncTime(null)
      setSyncCount(null)
      alert("Successfully disconnected from Google. You can now log in fresh.")
    } catch (err) {
      console.error("Logout failed:", err)
      setError("Failed to disconnect Google account")
    } finally {
      setIsLoggingOut(false)
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

  const handleAlbumChange = async (albumId: string) => {
    console.log('Changing album to:', albumId)
    const album = albums.find(a => a.id === albumId)
    setSelectedAlbumId(albumId)
    try {
      const response = await fetch('/api/google/photos/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          selectedAlbumId: albumId, 
          selectedAlbumTitle: album?.title,
          lastSyncTime: lastSyncTime // Use the state value directly
        })
      })
      if (!response.ok) {
        throw new Error('Failed to save config')
      }
      console.log('Album config saved successfully')
    } catch (err) {
      console.error('Failed to save album config:', err)
      setError('Failed to save album selection. Please try again.')
    }
  }

  const handleSync = async () => {
    if (!selectedAlbumId) return
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Google Photos Smart Cache</CardTitle>
            <CardDescription>
              Select a smart album to download and cache locally for fast display.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <label className="text-lg font-semibold">Select Album</label>
              <div className="grid grid-cols-1 gap-3">
                {isFetchingAlbums ? (
                  <div className="flex items-center justify-center p-8 border-2 border-dashed rounded-xl text-muted-foreground animate-pulse">
                    <Loader2 className="w-6 h-6 animate-spin mr-2" />
                    <span>Loading albums...</span>
                  </div>
                ) : albums.length === 0 ? (
                  <div className="p-8 border-2 border-dashed rounded-xl text-center text-muted-foreground">
                    No albums found. Try logging in again.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto p-1">
                    {albums.map(album => (
                      <button
                        key={album.id}
                        onClick={() => handleAlbumChange(album.id)}
                        className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left ${
                          selectedAlbumId === album.id
                            ? "border-primary bg-primary/10 shadow-sm"
                            : "border-muted hover:border-primary/50 bg-background"
                        }`}
                      >
                        <div className="flex flex-col overflow-hidden">
                          <span className={`font-bold truncate ${selectedAlbumId === album.id ? "text-primary" : ""}`}>
                            {album.title}
                          </span>
                          {album.productUrl && (
                            <span className="text-xs text-muted-foreground">Google Photos Album</span>
                          )}
                        </div>
                        {selectedAlbumId === album.id && (
                          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
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
                            const isPhotosScope = scope.includes('photoslibrary');
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
                      {diagnostics.token.actualScopes && !diagnostics.token.actualScopes.some((s: string) => s.includes('photoslibrary')) && (
                        <p className="text-red-400 text-xs mt-2">
                          ⚠️ Access token missing photos scope! Click Disconnect, then Login again.
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
                  <ImageIcon className="w-6 h-6" />
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
                disabled={isSyncing || !selectedAlbumId}
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
