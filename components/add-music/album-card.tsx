"use client"

import { Album } from "lucide-react"

interface AlbumCardProps {
  album: any
  onSelect: () => void
}

export default function AlbumCard({ album, onSelect }: AlbumCardProps) {
  return (
    <div
      className="bg-zinc-700/50 rounded-lg overflow-hidden hover:bg-zinc-700 transition cursor-pointer"
      onClick={onSelect}
    >
      <div className="aspect-square bg-zinc-700 overflow-hidden">
        {album.coverUrl ? (
          <img src={album.coverUrl || "/placeholder.svg"} alt={album.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Album className="h-12 w-12 text-zinc-500" />
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-medium truncate">{album.name}</h3>
        <p className="text-sm text-zinc-400 truncate">{album.artist}</p>
      </div>
    </div>
  )
}
