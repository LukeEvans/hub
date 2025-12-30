"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LogIn, Settings, Image as ImageIcon, RefreshCw, Check, Loader2 } from "lucide-react"

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Google Photos states
  const [albums, setAlbums] = useState<any[]>([])
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null)
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null)
  const [isSyncing, setIsSyncing] = useState(false)
  const [isFetchingAlbums, setIsFetchingAlbums] = useState(false)

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
      .then(res => res.json())
      .then(data => {
        if (data.albums) setAlbums(data.albums)
      })
      .catch(err => console.error('Failed to fetch albums:', err))
      .finally(() => setIsFetchingAlbums(false))
  }, [])

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
    const album = albums.find(a => a.id === albumId)
    setSelectedAlbumId(albumId)
    try {
      await fetch('/api/google/photos/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          selectedAlbumId: albumId, 
          selectedAlbumTitle: album?.title,
          lastSyncTime // Keep existing sync time
        })
      })
    } catch (err) {
      console.error('Failed to save album config:', err)
    }
  }

  const handleSync = async () => {
    if (!selectedAlbumId) return
    setIsSyncing(true)
    setError(null)
    try {
      const response = await fetch('/api/google/photos/sync', { method: 'POST' })
      const data = await response.json()
      if (response.ok) {
        setLastSyncTime(data.lastSyncTime)
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
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#4285F4] flex items-center justify-center text-white font-bold">
                  G
                </div>
                <div>
                  <p className="font-medium">Google Account</p>
                  <p className="text-sm text-muted-foreground">Required for Calendar and Photos</p>
                </div>
              </div>
              <Button 
                onClick={handleGoogleLogin} 
                disabled={isLoading}
                className="gap-2"
              >
                <LogIn className="w-4 h-4" />
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
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Album</label>
              <div className="flex gap-4">
                <select 
                  value={selectedAlbumId || ""} 
                  onChange={(e) => handleAlbumChange(e.target.value)}
                  disabled={isFetchingAlbums}
                  className="flex-1 h-10 px-3 py-2 bg-background border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="" disabled>Select an album...</option>
                  {albums.map(album => (
                    <option key={album.id} value={album.id}>{album.title}</option>
                  ))}
                </select>
                {isFetchingAlbums && <Loader2 className="w-6 h-6 animate-spin mt-2" />}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-sm">Local Cache Status</p>
                  <p className="text-xs text-muted-foreground">
                    {lastSyncTime ? `Last synced: ${new Date(lastSyncTime).toLocaleString()}` : 'Never synced'}
                  </p>
                </div>
              </div>
              <Button 
                onClick={handleSync} 
                disabled={isSyncing || !selectedAlbumId}
                variant="outline"
                className="gap-2"
              >
                {isSyncing ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                {isSyncing ? "Syncing..." : "Sync Now"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
