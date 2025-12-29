"use client"

import { ImageIcon, Heart, Share2, Download, ChevronLeft, ChevronRight } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { useState } from "react"

// Sample photo albums
const albums = [
  {
    id: 1,
    name: "Summer Vacation 2024",
    count: 48,
    cover: "/family-beach-fun.png",
    date: "July 2024",
  },
  {
    id: 2,
    name: "Emma's Birthday",
    count: 32,
    cover: "/birthday-party.png",
    date: "June 2024",
  },
  {
    id: 3,
    name: "Hiking Adventures",
    count: 24,
    cover: "/family-mountain-hike.png",
    date: "May 2024",
  },
  {
    id: 4,
    name: "Home Sweet Home",
    count: 156,
    cover: "/cozy-family-home.jpg",
    date: "2024",
  },
]

// Recent photos grid
const recentPhotos = Array.from({ length: 24 }, (_, i) => ({
  id: i + 1,
  url: `/placeholder.svg?height=400&width=400&query=family photo ${i + 1}`,
  title: `Family Memory ${i + 1}`,
  date: "2024",
}))

export default function PhotosPage() {
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null)

  return (
    <div className="min-h-screen p-8 bg-background">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-14 h-14 rounded-full bg-[var(--widget-mint)] flex items-center justify-center">
            <ImageIcon className="w-7 h-7 text-foreground" />
          </div>
          <div>
            <h1 className="text-4xl font-bold">Family Photos</h1>
            <p className="text-muted-foreground text-lg">iCloud Photo Library</p>
          </div>
        </div>
      </div>

      {/* Albums Section */}
      <div className="mb-12 max-w-7xl">
        <h2 className="text-2xl font-bold mb-4">Albums</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {albums.map((album) => (
            <Card key={album.id} className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow group">
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={album.cover || "/placeholder.svg"}
                  alt={album.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <div className="font-semibold text-lg">{album.name}</div>
                  <div className="text-sm text-white/80">
                    {album.count} photos • {album.date}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Photos Section */}
      <div className="max-w-7xl">
        <h2 className="text-2xl font-bold mb-4">Recent Photos</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {recentPhotos.map((photo) => (
            <Card
              key={photo.id}
              className="overflow-hidden cursor-pointer hover:shadow-lg transition-all hover:scale-105 duration-200 group"
              onClick={() => setSelectedPhoto(photo.id)}
            >
              <div className="relative aspect-square">
                <img src={photo.url || "/placeholder.svg"} alt={photo.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Photo Viewer Dialog */}
      <Dialog open={selectedPhoto !== null} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-5xl p-0 bg-black/95 border-0">
          {selectedPhoto && (
            <div className="relative">
              <img
                src={recentPhotos[selectedPhoto - 1]?.url || "/placeholder.svg"}
                alt={recentPhotos[selectedPhoto - 1]?.title}
                className="w-full h-auto max-h-[85vh] object-contain"
              />
              {/* Navigation and Actions */}
              <div className="absolute top-4 right-4 flex gap-2">
                <Button
                  variant="secondary"
                  size="icon"
                  className="rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30"
                >
                  <Heart className="w-5 h-5 text-white" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30"
                >
                  <Share2 className="w-5 h-5 text-white" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30"
                >
                  <Download className="w-5 h-5 text-white" />
                </Button>
              </div>
              <Button
                variant="secondary"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30"
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedPhoto(selectedPhoto > 1 ? selectedPhoto - 1 : recentPhotos.length)
                }}
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30"
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedPhoto(selectedPhoto < recentPhotos.length ? selectedPhoto + 1 : 1)
                }}
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
