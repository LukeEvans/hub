"use client"

import { ImageIcon, Heart, Share2, Download, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { useState } from "react"
import { useApi } from "@/lib/use-api"

export default function PhotosPage() {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null)
  const { data, isLoading: loading } = useApi<any>('/api/photos')
  const photos = data?.images || []

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    )
  }

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
            <p className="text-muted-foreground text-lg">Local Photo Library</p>
          </div>
        </div>
      </div>

      {/* Recent Photos Section */}
      <div>
        <h2 className="text-2xl font-bold mb-4">All Photos</h2>
        {photos.length === 0 ? (
          <p className="text-muted-foreground">No photos found in the photos directory.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {photos.map((photoUrl, index) => (
              <Card
                key={index}
                className="overflow-hidden cursor-pointer hover:shadow-lg transition-all hover:scale-105 duration-200 group"
                onClick={() => setSelectedPhotoIndex(index)}
              >
                <div className="relative aspect-square">
                  <img src={photoUrl} alt={`Photo ${index}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Photo Viewer Dialog */}
      <Dialog open={selectedPhotoIndex !== null} onOpenChange={() => setSelectedPhotoIndex(null)}>
        <DialogContent className="max-w-5xl p-0 bg-black/95 border-0">
          {selectedPhotoIndex !== null && (
            <div className="relative">
              <img
                src={photos[selectedPhotoIndex]}
                alt={`Photo ${selectedPhotoIndex}`}
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
                  setSelectedPhotoIndex(selectedPhotoIndex > 0 ? selectedPhotoIndex - 1 : photos.length - 1)
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
                  setSelectedPhotoIndex(selectedPhotoIndex < photos.length - 1 ? selectedPhotoIndex + 1 : 0)
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
