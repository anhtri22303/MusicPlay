"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, RefreshCw, Music, Play, Pause, MoreHorizontal } from "lucide-react"
import { formatTime } from "@/lib/utils"
import { useMusicStore } from "@/lib/music-store"
import { toast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

export default function SpotifySongs() {
  const [isLoading, setIsLoading] = useState(false)
  const [spotifySongs, setSpotifySongs] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredSongs, setFilteredSongs] = useState([])
  const { setCurrentSong, currentSong, isPlaying, togglePlay } = useMusicStore()

  // Load songs on mount
  useEffect(() => {
    fetchSpotifySongs()
  }, [])

  // Filter songs when search query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredSongs(spotifySongs)
      return
    }

    const filtered = spotifySongs.filter(
      (song: any) =>
        song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        song.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
        song.album.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    setFilteredSongs(filtered)
  }, [searchQuery, spotifySongs])

  const fetchSpotifySongs = async () => {
    setIsLoading(true)
    try {
      // First try to get songs from our database that are from Spotify
      const dbResponse = await fetch("/api/songs?source=spotify")
      let songs = []

      if (dbResponse.ok) {
        const dbData = await dbResponse.json()
        songs = dbData.filter((song: any) => song.source === "spotify")
      }

      // If we don't have enough songs, fetch some from Spotify directly
      if (songs.length < 20) {
        // Fetch some popular tracks as a fallback
        const spotifyResponse = await fetch("/api/spotify/search?q=top%20hits&limit=50")
        if (spotifyResponse.ok) {
          const spotifyData = await spotifyResponse.json()
          // Combine with existing songs, avoiding duplicates
          const existingIds = new Set(songs.map((s: any) => s.spotifyId))
          const newSongs = spotifyData.tracks.filter((s: any) => !existingIds.has(s.spotifyId))
          songs = [...songs, ...newSongs]
        }
      }

      setSpotifySongs(songs)
      setFilteredSongs(songs)
    } catch (error) {
      console.error("Error fetching Spotify songs:", error)
      toast({
        title: "Error",
        description: "Failed to load songs from Spotify",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePlay = (song: any) => {
    try {
      if (currentSong?.id === song.id) {
        // If the same song is already selected, just toggle play/pause
        togglePlay()
      } else {
        // Otherwise, set the new song and start playing
        setCurrentSong(song)
      }
    } catch (error) {
      console.error("Error playing song:", error)
    }
  }

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <div className="relative w-full md:w-64">
          <Input
            placeholder="Filter Spotify songs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-zinc-800 border-zinc-700"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 h-4 w-4" />
        </div>

        <Button variant="outline" onClick={fetchSpotifySongs} disabled={isLoading}>
          <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-10 h-10 border-2 border-t-green-400 border-zinc-600 rounded-full animate-spin"></div>
        </div>
      ) : filteredSongs.length === 0 ? (
        <div className="text-center py-12">
          <Music className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
          <p className="text-zinc-400">No Spotify songs found</p>
          <Button variant="outline" onClick={fetchSpotifySongs} className="mt-4">
            Refresh
          </Button>
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-[auto_1fr_auto_auto] md:grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-4 py-2 text-zinc-400 text-sm border-b border-zinc-800">
            <div className="w-8">#</div>
            <div>TITLE</div>
            <div className="hidden md:block">ALBUM</div>
            <div>DURATION</div>
            <div></div>
          </div>

          <div className="divide-y divide-zinc-800/50">
            {filteredSongs.map((song: any, index) => {
              const isActive = currentSong?.id === song.id

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
                        <span className="text-zinc-400 group-hover:hidden">{index + 1}</span>
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
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
