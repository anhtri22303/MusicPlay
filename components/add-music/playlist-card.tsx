"use client"

import { ListMusic } from "lucide-react"

interface PlaylistCardProps {
  playlist: any
  onSelect: () => void
}

export default function PlaylistCard({ playlist, onSelect }: PlaylistCardProps) {
  return (
    <div
      className="bg-zinc-700/50 rounded-lg overflow-hidden hover:bg-zinc-700 transition cursor-pointer"
      onClick={onSelect}
    >
      <div className="aspect-square bg-zinc-700 overflow-hidden">
        {playlist.coverUrl ? (
          <img
            src={playlist.coverUrl || "/placeholder.svg"}
            alt={playlist.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ListMusic className="h-12 w-12 text-zinc-500" />
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-medium truncate">{playlist.name}</h3>
        <p className="text-sm text-zinc-400 truncate">{playlist.totalTracks || 0} tracks</p>
      </div>
    </div>
  )
}
