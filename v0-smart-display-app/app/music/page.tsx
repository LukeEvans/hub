"use client"

import { Music, ExternalLink, RefreshCw, ListMusic, Play } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import axios from "axios"

export default function MusicPage() {
  const [config, setConfig] = useState<any>(null)
  const [currentEmbedUrl, setCurrentEmbedUrl] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)

  const fetchConfig = async () => {
    setIsLoading(true)
    try {
      const resp = await axios.get('/api/spotify/config')
      setConfig(resp.data)
      if (resp.data.primaryPlaylist) {
        setCurrentEmbedUrl(getEmbedUrl(resp.data.primaryPlaylist))
      }
    } catch (err) {
      console.error("Failed to fetch Spotify config:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const getEmbedUrl = (url: string) => {
    if (!url) return ""
    try {
      const urlObj = new URL(url)
      const pathParts = urlObj.pathname.split('/')
      const type = pathParts[1] // 'playlist', 'album', 'track'
      const id = pathParts[2]
      if (type && id) {
        return `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`
      }
    } catch (e) {
      console.error("Invalid Spotify URL:", url)
    }
    return ""
  }

  useEffect(() => {
    fetchConfig()
  }, [])

  const handleLaunchWebPlayer = () => {
    window.open("https://open.spotify.com", "_blank")
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-background">
        <RefreshCw className="w-12 h-12 animate-spin text-primary opacity-20" />
      </div>
    )
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
              <p className="text-muted-foreground text-lg">Spotify Player (Iframe Mode)</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="lg" 
            className="rounded-full gap-2 bg-[#1DB954] text-white hover:bg-[#1ed760] border-none"
            onClick={handleLaunchWebPlayer}
          >
            <ExternalLink className="w-5 h-5" />
            Launch Web Player (for Alexa Connect)
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Player Area */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="p-0 overflow-hidden border-none bg-black/40 shadow-2xl rounded-3xl aspect-video lg:aspect-auto lg:h-[600px]">
            {currentEmbedUrl ? (
              <iframe
                src={currentEmbedUrl}
                width="100%"
                height="100%"
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                className="rounded-3xl"
              ></iframe>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-12">
                <Music className="w-24 h-24 mb-6 opacity-10" />
                <h2 className="text-2xl font-bold mb-2">No Playlist Configured</h2>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  Go to the Settings tab to configure your favorite Spotify playlists.
                </p>
                <Button 
                  variant="secondary" 
                  className="mt-6 rounded-full"
                  onClick={() => window.location.href = '/settings'}
                >
                  Go to Settings
                </Button>
              </div>
            )}
          </Card>

          <div className="bg-muted/30 p-6 rounded-2xl border flex items-start gap-4">
            <div className="text-2xl">💡</div>
            <div>
              <p className="font-semibold text-foreground">How to control your Alexa</p>
              <p className="text-sm text-muted-foreground leading-relaxed mt-1">
                Due to Spotify restrictions, this player cannot directly control external speakers. 
                To play on your Alexa, click <strong>Launch Web Player</strong> above, log in, and use the "Connect to a device" menu in the web player.
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar - Your Other Playlists */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-2 px-2">
            <ListMusic className="w-6 h-6 text-[#1DB954]" />
            <h2 className="text-xl font-bold">Your Shortcuts</h2>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {config?.primaryPlaylist && (
              <Card 
                className={`p-4 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] border-none flex items-center gap-4 ${
                  currentEmbedUrl === getEmbedUrl(config.primaryPlaylist) ? 'bg-[#1DB954]/20' : 'bg-accent/30 hover:bg-accent/50'
                }`}
                onClick={() => setCurrentEmbedUrl(getEmbedUrl(config.primaryPlaylist))}
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#1DB954] to-black flex items-center justify-center text-white shrink-0 shadow-lg">
                  <Play className="w-6 h-6 ml-1" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold truncate">Primary Playlist</div>
                  <div className="text-xs text-muted-foreground">Family Favorites</div>
                </div>
              </Card>
            )}

            {config?.secondaryPlaylists?.map((url: string, index: number) => {
              const embedUrl = getEmbedUrl(url)
              if (!embedUrl) return null
              return (
                <Card 
                  key={index}
                  className={`p-4 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] border-none flex items-center gap-4 ${
                    currentEmbedUrl === embedUrl ? 'bg-[#1DB954]/20' : 'bg-accent/30 hover:bg-accent/50'
                  }`}
                  onClick={() => setCurrentEmbedUrl(embedUrl)}
                >
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#1DB954]/60 to-black flex items-center justify-center text-white shrink-0 shadow-lg">
                    <Play className="w-5 h-5 ml-0.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold truncate">Shortcut {index + 1}</div>
                    <div className="text-xs text-muted-foreground truncate">{new URL(url).pathname.split('/').pop()}</div>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
