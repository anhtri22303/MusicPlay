"use client"

import { Album } from "lucide-react"
import Link from "next/link"
import type { Album as AlbumType } from "@/lib/types"

interface AlbumGridProps {
  albums: AlbumType[]
  title?: string
}

export default function AlbumGrid({ albums, title }: AlbumGridProps) {
  return (
    <div className="w-full">
      {title && <h2 className="text-2xl font-bold mb-4">{title}</h2>}

      {albums.length === 0 ? (
        <div className="py-8 text-center text-zinc-400 bg-zinc-800/30 rounded-lg">
          No albums available. Add some from the Add Music page.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {albums.map((album) => (
            <Link key={album.id} href={`/albums/${album.id}`}>
              <div className="bg-zinc-800/50 rounded-lg overflow-hidden hover:bg-zinc-800 transition cursor-pointer">
                <div className="aspect-square bg-zinc-700 overflow-hidden">
                  {album.coverUrl ? (
                    <img
                      src={album.coverUrl || "/placeholder.svg"}
                      alt={album.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Album className="h-16 w-16 text-zinc-500" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-medium truncate">{album.title}</h3>
                  <p className="text-sm text-zinc-400 truncate">{album.artist}</p>
                  <p className="text-xs text-zinc-500 mt-1">{album.songs?.length || 0} songs</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
