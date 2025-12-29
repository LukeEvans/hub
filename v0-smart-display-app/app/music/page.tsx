"use client"

import { Music, Play, Pause, SkipBack, SkipForward, Volume2, Heart, Repeat, Shuffle, ListMusic } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { useState } from "react"

const playlists = [
  {
    id: 1,
    name: "Family Favorites",
    image: "/family-playlist-cover.jpg",
    trackCount: 48,
    color: "from-purple-500 to-pink-500",
  },
  {
    id: 2,
    name: "Cooking Vibes",
    image: "/cooking-music-playlist.jpg",
    trackCount: 32,
    color: "from-orange-500 to-red-500",
  },
  {
    id: 3,
    name: "Morning Energy",
    image: "/morning-energy-playlist.jpg",
    trackCount: 24,
    color: "from-yellow-500 to-orange-500",
  },
  {
    id: 4,
    name: "Chill Evening",
    image: "/chill-evening-playlist.jpg",
    trackCount: 36,
    color: "from-blue-500 to-purple-500",
  },
]

const recentTracks = [
  {
    id: 1,
    title: "Sweet Child O' Mine",
    artist: "Guns N' Roses",
    album: "Appetite for Destruction",
    duration: "5:56",
    image: "/rock-album-cover.jpg",
  },
  {
    id: 2,
    title: "Lovely Day",
    artist: "Bill Withers",
    album: "Menagerie",
    duration: "4:15",
    image: "/soul-album-cover.jpg",
  },
  {
    id: 3,
    title: "Don't Stop Believin'",
    artist: "Journey",
    album: "Escape",
    duration: "4:10",
    image: "/journey-album-cover.jpg",
  },
  {
    id: 4,
    title: "Here Comes The Sun",
    artist: "The Beatles",
    album: "Abbey Road",
    duration: "3:05",
    image: "/beatles-album-cover.jpg",
  },
  {
    id: 5,
    title: "Walking On Sunshine",
    artist: "Katrina & The Waves",
    album: "Walking on Sunshine",
    duration: "3:59",
    image: "/sunshine-album-cover.jpg",
  },
]

export default function MusicPage() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(45)
  const [volume, setVolume] = useState(75)

  const currentTrack = recentTracks[0]

  return (
    <div className="min-h-screen p-8 bg-background">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[var(--widget-lavender)] to-[var(--widget-pink)] flex items-center justify-center">
            <Music className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold">Music</h1>
            <p className="text-muted-foreground text-lg">Spotify Connect</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Now Playing - Large Card */}
        <Card className="lg:col-span-2 p-8 bg-gradient-to-br from-[var(--widget-lavender)] to-[var(--widget-pink)]">
          <div className="flex gap-6 mb-6">
            <div className="flex-shrink-0">
              <img
                src={currentTrack.image || "/placeholder.svg"}
                alt={currentTrack.title}
                className="w-48 h-48 rounded-xl shadow-2xl"
              />
            </div>
            <div className="flex-1 flex flex-col justify-between text-white">
              <div>
                <div className="text-sm mb-2 text-white/80">Now Playing</div>
                <h2 className="text-4xl font-bold mb-2 text-balance">{currentTrack.title}</h2>
                <p className="text-xl text-white/90">{currentTrack.artist}</p>
                <p className="text-sm text-white/70">{currentTrack.album}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="icon"
                  className="rounded-full w-10 h-10 bg-white/20 hover:bg-white/30"
                >
                  <Heart className="w-5 h-5 text-white" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="rounded-full w-10 h-10 bg-white/20 hover:bg-white/30"
                >
                  <ListMusic className="w-5 h-5 text-white" />
                </Button>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <Slider
              value={[currentTime]}
              max={356}
              step={1}
              onValueChange={(value) => setCurrentTime(value[0] || 0)}
              className="mb-2"
            />
            <div className="flex justify-between text-sm text-white/80">
              <span>0:45</span>
              <span>5:56</span>
            </div>
          </div>

          {/* Playback Controls */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full w-12 h-12 text-white hover:bg-white/20 hover:text-white"
            >
              <Shuffle className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full w-12 h-12 text-white hover:bg-white/20 hover:text-white"
            >
              <SkipBack className="w-6 h-6" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="rounded-full w-16 h-16 bg-white text-foreground hover:bg-white/90"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full w-12 h-12 text-white hover:bg-white/20 hover:text-white"
            >
              <SkipForward className="w-6 h-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full w-12 h-12 text-white hover:bg-white/20 hover:text-white"
            >
              <Repeat className="w-5 h-5" />
            </Button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-3">
            <Volume2 className="w-5 h-5 text-white" />
            <Slider value={[volume]} max={100} step={1} onValueChange={(value) => setVolume(value[0] || 0)} />
            <span className="text-sm text-white/80 w-10">{volume}%</span>
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="space-y-4">
          <Card className="p-4 bg-[var(--widget-mint)]">
            <div className="text-sm text-foreground/70 mb-1">Recently Played</div>
            <div className="text-2xl font-bold text-foreground">{recentTracks.length}</div>
            <div className="text-xs text-foreground/60">tracks</div>
          </Card>

          <Card className="p-4 bg-[var(--widget-blue)]">
            <div className="text-sm text-foreground/70 mb-1">Playlists</div>
            <div className="text-2xl font-bold text-foreground">{playlists.length}</div>
            <div className="text-xs text-foreground/60">available</div>
          </Card>

          <Card className="p-4 bg-[var(--widget-yellow)]">
            <div className="text-sm text-foreground/70 mb-1">Total Tracks</div>
            <div className="text-2xl font-bold text-foreground">
              {playlists.reduce((sum, p) => sum + p.trackCount, 0)}
            </div>
            <div className="text-xs text-foreground/60">in library</div>
          </Card>
        </div>
      </div>

      {/* Playlists Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">Your Playlists</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {playlists.map((playlist) => (
            <Card key={playlist.id} className="overflow-hidden cursor-pointer hover:shadow-lg transition-all group">
              <div className="relative aspect-square overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${playlist.color} opacity-80`} />
                <img
                  src={playlist.image || "/placeholder.svg"}
                  alt={playlist.name}
                  className="w-full h-full object-cover mix-blend-overlay group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="icon"
                    className="rounded-full w-14 h-14 bg-white text-foreground hover:bg-white/90 shadow-xl"
                  >
                    <Play className="w-6 h-6 ml-1" />
                  </Button>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg mb-1">{playlist.name}</h3>
                <p className="text-sm text-muted-foreground">{playlist.trackCount} tracks</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Tracks */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">Recently Played</h2>
        <Card className="p-6">
          <div className="space-y-3">
            {recentTracks.map((track, index) => (
              <div
                key={track.id}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-accent transition-colors cursor-pointer group"
              >
                <div className="text-muted-foreground w-6">{index + 1}</div>
                <img src={track.image || "/placeholder.svg"} alt={track.title} className="w-12 h-12 rounded" />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{track.title}</div>
                  <div className="text-sm text-muted-foreground truncate">{track.artist}</div>
                </div>
                <div className="text-sm text-muted-foreground hidden md:block">{track.album}</div>
                <div className="text-sm text-muted-foreground">{track.duration}</div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Play className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
