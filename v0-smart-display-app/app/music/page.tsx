"use client"

import { Music, Play, Pause, SkipBack, SkipForward, Volume2, Heart, Repeat, Shuffle, ListMusic, Speaker } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { useState, useEffect, useRef } from "react"
import axios from "axios"
import { DevicePicker, SpotifyDevice } from "@/components/device-picker"
import { toast } from "sonner"

export default function MusicPage() {
  const [playback, setPlayback] = useState<any>(null)
  const [devices, setDevices] = useState<SpotifyDevice[]>([])
  const [playlists, setPlaylists] = useState<any[]>([])
  const [queue, setQueue] = useState<any>(null)
  const [isDevicePickerOpen, setIsDevicePickerOpen] = useState(false)
  const [volume, setVolume] = useState(50)
  const [currentTime, setCurrentTime] = useState(0)
  const [isAuthed, setIsAuthed] = useState(true)

  const progressInterval = useRef<NodeJS.Timeout | null>(null)

  const fetchData = async () => {
    try {
      const resp = await axios.get('/api/spotify/current')
      setPlayback(resp.data.playback)
      setDevices(resp.data.devices)
      if (resp.data.playback?.device?.volume_percent !== undefined) {
        setVolume(resp.data.playback.device.volume_percent)
      }
      if (resp.data.playback?.progress_ms !== undefined) {
        setCurrentTime(Math.floor(resp.data.playback.progress_ms / 1000))
      }
      setIsAuthed(true)
    } catch (err: any) {
      if (err.response?.status === 401) {
        setIsAuthed(false)
      }
    }
  }

  const fetchPlaylists = async () => {
    try {
      const resp = await axios.get('/api/spotify/playlists')
      setPlaylists(resp.data)
    } catch (err) {}
  }

  const fetchQueue = async () => {
    try {
      const resp = await axios.get('/api/spotify/queue')
      setQueue(resp.data)
    } catch (err) {}
  }

  useEffect(() => {
    fetchData()
    fetchPlaylists()
    fetchQueue()

    const interval = setInterval(() => {
      if (!document.hidden) {
        fetchData()
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (playback?.is_playing) {
      if (progressInterval.current) clearInterval(progressInterval.current)
      progressInterval.current = setInterval(() => {
        setCurrentTime(prev => prev + 1)
      }, 1000)
    } else {
      if (progressInterval.current) clearInterval(progressInterval.current)
    }
    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current)
    }
  }, [playback?.is_playing, playback?.item?.id])

  const handlePlayPause = async () => {
    try {
      if (playback?.is_playing) {
        await axios.post('/api/spotify/pause')
      } else {
        await axios.post('/api/spotify/play')
      }
      fetchData()
    } catch (err) {
      toast.error("Failed to toggle playback")
    }
  }

  const handleNext = async () => {
    try {
      await axios.post('/api/spotify/next')
      fetchData()
      fetchQueue()
    } catch (err) {}
  }

  const handlePrevious = async () => {
    try {
      await axios.post('/api/spotify/previous')
      fetchData()
    } catch (err) {}
  }

  const handleVolumeChange = async (value: number[]) => {
    const newVol = value[0]
    setVolume(newVol)
    try {
      await axios.put('/api/spotify/volume', { volume: newVol })
    } catch (err) {}
  }

  const handleDeviceSelect = async (deviceId: string) => {
    try {
      await axios.put('/api/spotify/device', { deviceId })
      setIsDevicePickerOpen(false)
      fetchData()
      toast.success("Transferred playback")
    } catch (err) {
      toast.error("Failed to transfer playback")
    }
  }

  const handlePlayPlaylist = async (playlistUri: string) => {
    try {
      await axios.post('/api/spotify/play', { context_uri: playlistUri })
      fetchData()
      fetchQueue()
      toast.success("Playing playlist")
    } catch (err) {
      toast.error("Failed to play playlist")
    }
  }

  if (!isAuthed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-background">
        <Music className="w-16 h-16 mb-4 text-muted-foreground" />
        <h1 className="text-2xl font-bold mb-2">Spotify not connected</h1>
        <p className="text-muted-foreground mb-6">Connect your Spotify account in settings to use this tab.</p>
        <Button onClick={() => window.location.href = '/settings'}>Go to Settings</Button>
      </div>
    )
  }

  const currentTrack = playback?.item
  const duration = currentTrack ? Math.floor(currentTrack.duration_ms / 1000) : 0

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen p-8 bg-background pb-32">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#1DB954] to-[#191414] flex items-center justify-center">
              <Music className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Music</h1>
              <p className="text-muted-foreground text-lg">
                {playback?.device?.name ? `Playing on ${playback.device.name}` : "Spotify Connect"}
              </p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="lg" 
            className="rounded-full gap-2"
            onClick={() => setIsDevicePickerOpen(true)}
          >
            <Speaker className="w-5 h-5" />
            Devices
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Now Playing - Large Card */}
        <Card className="lg:col-span-2 p-8 bg-gradient-to-br from-[#1DB954]/20 to-[#191414]/40 border-none">
          {currentTrack ? (
            <>
              <div className="flex gap-6 mb-6">
                <div className="flex-shrink-0">
                  <img
                    src={currentTrack.album?.images[0]?.url || "/placeholder.svg"}
                    alt={currentTrack.name}
                    className="w-48 h-48 rounded-xl shadow-2xl"
                  />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="text-sm mb-2 opacity-80 uppercase tracking-wider font-semibold">Now Playing</div>
                    <h2 className="text-4xl font-bold mb-2 text-balance leading-tight">{currentTrack.name}</h2>
                    <p className="text-xl opacity-90">{currentTrack.artists?.map((a: any) => a.name).join(', ')}</p>
                    <p className="text-sm opacity-70 mt-1">{currentTrack.album?.name}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="icon"
                      className="rounded-full w-10 h-10 bg-white/10 hover:bg-white/20 border-none"
                    >
                      <Heart className="w-5 h-5" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="rounded-full w-10 h-10 bg-white/10 hover:bg-white/20 border-none"
                    >
                      <ListMusic className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <Slider
                  value={[currentTime]}
                  max={duration}
                  step={1}
                  onValueChange={(value) => setCurrentTime(value[0] || 0)}
                  className="mb-2"
                />
                <div className="flex justify-between text-sm opacity-80 font-mono">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Playback Controls */}
              <div className="flex items-center justify-center gap-6 mb-6">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full w-12 h-12 hover:bg-white/10"
                >
                  <Shuffle className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full w-14 h-14 hover:bg-white/10"
                  onClick={handlePrevious}
                >
                  <SkipBack className="w-8 h-8" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="rounded-full w-20 h-20 bg-white text-black hover:bg-white/90 shadow-lg"
                  onClick={handlePlayPause}
                >
                  {playback?.is_playing ? <Pause className="w-10 h-10" /> : <Play className="w-10 h-10 ml-1" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full w-14 h-14 hover:bg-white/10"
                  onClick={handleNext}
                >
                  <SkipForward className="w-8 h-8" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full w-12 h-12 hover:bg-white/10"
                >
                  <Repeat className="w-5 h-5" />
                </Button>
              </div>

              {/* Volume Control */}
              <div className="flex items-center gap-4">
                <Volume2 className="w-6 h-6" />
                <Slider 
                  value={[volume]} 
                  max={100} 
                  step={1} 
                  onValueChange={handleVolumeChange} 
                />
                <span className="text-sm font-mono w-12">{volume}%</span>
              </div>
            </>
          ) : (
            <div className="h-[400px] flex flex-col items-center justify-center text-center">
              <Music className="w-24 h-24 mb-6 opacity-20" />
              <h2 className="text-3xl font-bold mb-3">No playback active</h2>
              <p className="text-lg opacity-70 max-w-md mx-auto">
                Select a device below or start playing from your Spotify app to control it from here.
              </p>
              <Button 
                size="lg"
                className="mt-8 rounded-full px-8 py-6 text-lg" 
                onClick={() => setIsDevicePickerOpen(true)}
              >
                Connect to a device
              </Button>
            </div>
          )}
        </Card>

        {/* Sidebar Info */}
        <div className="space-y-4">
          <Card className="p-6 bg-[var(--widget-mint)] border-none">
            <div className="text-sm text-foreground/70 mb-1 font-semibold uppercase tracking-wider">Available Devices</div>
            <div className="text-4xl font-bold text-foreground">{devices.length}</div>
            <div className="text-xs text-foreground/60 mt-1">Found on your network</div>
          </Card>

          <Card className="p-6 bg-[var(--widget-blue)] border-none">
            <div className="text-sm text-foreground/70 mb-1 font-semibold uppercase tracking-wider">Your Playlists</div>
            <div className="text-4xl font-bold text-foreground">{playlists.length}</div>
            <div className="text-xs text-foreground/60 mt-1">Available in your library</div>
          </Card>

          <Card className="p-6 bg-[var(--widget-yellow)] border-none">
            <div className="text-sm text-foreground/70 mb-1 font-semibold uppercase tracking-wider">Up Next</div>
            <div className="text-4xl font-bold text-foreground">{queue?.queue?.length || 0}</div>
            <div className="text-xs text-foreground/60 mt-1">Tracks in your queue</div>
          </Card>
        </div>
      </div>

      {/* Playlists Section */}
      <div className="mt-16">
        <h2 className="text-3xl font-bold mb-6">Your Playlists</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {playlists.slice(0, 8).map((playlist) => (
            <Card 
              key={playlist.id} 
              className="overflow-hidden cursor-pointer hover:shadow-2xl transition-all group border-none bg-accent/30 hover:bg-accent/50"
              onClick={() => handlePlayPlaylist(playlist.uri)}
            >
              <div className="relative aspect-square overflow-hidden">
                <img
                  src={playlist.images?.[0]?.url || "/placeholder.svg"}
                  alt={playlist.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/60">
                  <Button
                    size="icon"
                    className="rounded-full w-16 h-16 bg-[#1DB954] text-white hover:bg-[#1ed760] shadow-2xl border-none transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300"
                  >
                    <Play className="w-8 h-8 ml-1" />
                  </Button>
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-xl mb-1 truncate">{playlist.name}</h3>
                <p className="text-sm text-muted-foreground font-medium">{playlist.tracks?.total} tracks</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Queue Section */}
      {queue?.queue?.length > 0 && (
        <div className="mt-16">
          <h2 className="text-3xl font-bold mb-6">Up Next</h2>
          <Card className="p-6 bg-accent/20 border-none rounded-2xl">
            <div className="space-y-2">
              {queue.queue.slice(0, 5).map((track: any, index: number) => (
                <div
                  key={`${track.id}-${index}`}
                  className="flex items-center gap-4 p-4 rounded-xl hover:bg-accent/40 transition-colors cursor-pointer group"
                  onClick={() => handlePlayPlaylist(track.uri)} // Play single track from queue (simplified)
                >
                  <div className="text-muted-foreground w-8 font-mono text-lg">{index + 1}</div>
                  <img src={track.album?.images?.[0]?.url || "/placeholder.svg"} alt={track.name} className="w-14 h-14 rounded-md shadow-md" />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold truncate text-lg">{track.name}</div>
                    <div className="text-muted-foreground truncate font-medium">{track.artists?.map((a: any) => a.name).join(', ')}</div>
                  </div>
                  <div className="text-muted-foreground hidden md:block flex-1 truncate px-4">{track.album?.name}</div>
                  <div className="text-muted-foreground font-mono">{formatTime(Math.floor(track.duration_ms / 1000))}</div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="rounded-full opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                  >
                    <Play className="w-5 h-5 text-[#1DB954]" />
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      <DevicePicker 
        devices={devices}
        isOpen={isDevicePickerOpen}
        onClose={() => setIsDevicePickerOpen(false)}
        onSelect={handleDeviceSelect}
      />
    </div>
  )
}
