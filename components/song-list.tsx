"use client"

import { Clock, Heart, MoreHorizontal, Play, Pause, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { type Song, useMusicStore } from "@/lib/music-store"
import { formatTime } from "@/lib/utils"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface SongListProps {
  songs: Song[]
  title?: string
}

export default function SongList({ songs, title }: SongListProps) {
  const { setCurrentSong, currentSong, isPlaying, togglePlay } = useMusicStore()
  const [filter, setFilter] = useState("")
  const [page, setPage] = useState(1)
  const songsPerPage = 20

  // Debug log khi component re-render
  useEffect(() => {
    console.log("SongList rendered with", songs.length, "songs")
    if (currentSong) {
      console.log("Current song in SongList:", currentSong.id, currentSong.title)
    }
  }, [songs.length, currentSong])

  const handlePlay = (song: Song) => {
    try {
      console.log("Attempting to play song:", song.id, song.title, song.audioUrl)

      if (currentSong?.id === song.id) {
        // If the same song is already selected, just toggle play/pause
        console.log("Toggling play for current song")
        togglePlay()
      } else {
        // Otherwise, set the new song and start playing
        console.log("Setting new current song")
        setCurrentSong(song)
      }
    } catch (error) {
      console.error("Error playing song:", error)
    }
  }

  // Filter songs based on search input
  const filteredSongs = songs.filter(
    (song) =>
      song.title.toLowerCase().includes(filter.toLowerCase()) ||
      song.artist.toLowerCase().includes(filter.toLowerCase()) ||
      song.album.toLowerCase().includes(filter.toLowerCase()),
  )

  // Paginate songs
  const totalPages = Math.ceil(filteredSongs.length / songsPerPage)
  const paginatedSongs = filteredSongs.slice((page - 1) * songsPerPage, page * songsPerPage)

  return (
    <div className="w-full">
      {title && <h2 className="text-2xl font-bold mb-4">{title}</h2>}

      {/* Search and pagination controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <div className="relative w-full md:w-64">
          <Input
            placeholder="Filter songs..."
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value)
              setPage(1) // Reset to first page when filtering
            }}
            className="pl-10 bg-zinc-800 border-zinc-700"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 h-4 w-4" />
        </div>

        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>
              Previous
            </Button>
            <span className="text-sm text-zinc-400">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-[auto_1fr_auto_auto] md:grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-4 py-2 text-zinc-400 text-sm border-b border-zinc-800">
        <div className="w-8">#</div>
        <div>TITLE</div>
        <div className="hidden md:block">ALBUM</div>
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
        </div>
        <div></div>
      </div>

      {paginatedSongs.length === 0 ? (
        <div className="py-8 text-center text-zinc-400">
          {filter ? "No songs match your search" : "No songs available"}
        </div>
      ) : (
        <div className="divide-y divide-zinc-800/50">
          {paginatedSongs.map((song, index) => {
            const isActive = currentSong?.id === song.id
            const actualIndex = (page - 1) * songsPerPage + index + 1

            return (
              <div
                key={song.id}
                className={cn(
                  "grid grid-cols-[auto_1fr_auto_auto] md:grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-4 py-3 items-center hover:bg-zinc-800/50 rounded-md cursor-pointer transition-colors",
                  isActive && "bg-zinc-800/70 text-green-400 border-l-2 border-green-400",
                )}
                onClick={() => handlePlay(song)}
              >
                <div className="w-8 text-center">
                  <div className="h-8 w-8 rounded-full flex items-center justify-center group">
                    {isActive && isPlaying ? (
                      <Pause className="h-4 w-4 text-green-400" />
                    ) : isActive ? (
                      <Play className="h-4 w-4 text-green-400" />
                    ) : (
                      <span className="text-zinc-400 group-hover:hidden">{actualIndex}</span>
                    )}
                    {!isActive && <Play className="h-4 w-4 text-white hidden group-hover:block" />}
                  </div>
                </div>

                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 bg-zinc-800 rounded overflow-hidden flex-shrink-0">
                    {song.coverUrl ? (
                      <img
                        src={song.coverUrl || "/placeholder.svg"}
                        alt={song.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-zinc-700"></div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className={cn("font-medium truncate", isActive && "text-green-400")}>{song.title}</div>
                    <div className="text-sm text-zinc-400 truncate">{song.artist}</div>
                  </div>
                </div>

                <div className="hidden md:block text-zinc-400 truncate">{song.album}</div>

                <div className="text-zinc-400">{formatTime(song.duration)}</div>

                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
