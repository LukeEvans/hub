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
              <Button 
                onClick={handleGoogleLogin} 
                disabled={isLoading}
                className="w-full sm:w-auto h-14 px-8 gap-3 text-lg font-semibold"
              >
                <LogIn className="w-5 h-5" />
                {isLoading ? "Redirecting..." : "Login with Google"}
              </Button>
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
