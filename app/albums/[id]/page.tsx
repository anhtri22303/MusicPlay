"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Play, Pause, Heart, MoreHorizontal, Clock, Music } from "lucide-react"
import Link from "next/link"
import { useMusicStore } from "@/lib/music-store"
import { formatTime } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"
import type { Album, Song } from "@/lib/types"
import { cn } from "@/lib/utils"

export default function AlbumDetailPage() {
  const params = useParams()
  const router = useRouter()
  const albumId = params.id as string
  const { setCurrentSong, currentSong, isPlaying, togglePlay } = useMusicStore()

  const [album, setAlbum] = useState<Album | null>(null)
  const [songs, setSongs] = useState<Song[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLiked, setIsLiked] = useState(false)

  useEffect(() => {
    const fetchAlbumDetails = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/albums/${albumId}`)

        if (response.ok) {
          const data = await response.json()
          setAlbum(data.album)
          setSongs(data.songs)
        } else {
          toast({
            title: "Error",
            description: "Failed to load album details",

            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error fetching album details:", error)
        toast({
          title: "Error",
          description: "Failed to load album details",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (albumId) {
      fetchAlbumDetails()
    }
  }, [albumId, toast])

  const handlePlay = (song: Song) => {
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

  const handlePlayAll = () => {
    if (songs.length > 0) {
      setCurrentSong(songs[0])
    }
  }

  const handleToggleLike = () => {
    setIsLiked(!isLiked)
    // Implement like functionality
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-900 text-white p-6 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-t-green-400 border-zinc-700 rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!album) {
    return (
      <div className="min-h-screen bg-zinc-900 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <Button variant="ghost" onClick={() => router.back()} className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Album Not Found</h1>
            <p className="text-zinc-400 mb-6">The album you're looking for doesn't exist or has been removed.</p>
            <Link href="/">
              <Button>Return to Home</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>

        <div className="flex flex-col md:flex-row gap-8 mb-8">
          {/* Album Cover */}
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="aspect-square bg-zinc-800 rounded-lg overflow-hidden shadow-xl">
              {album.coverUrl ? (
                <img
                  src={album.coverUrl || "/placeholder.svg"}
                  alt={album.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-zinc-700 flex items-center justify-center">
                  <Music className="h-16 w-16 text-zinc-500" />
                </div>
              )}
            </div>
          </div>

          {/* Album Info */}
          <div className="flex-1">
            <div className="mb-4">
              <h1 className="text-3xl font-bold mb-2">{album.title}</h1>
              <p className="text-xl text-zinc-400">{album.artist}</p>
              {album.releaseDate && <p className="text-sm text-zinc-500 mt-1">Released: {album.releaseDate}</p>}
              <p className="text-sm text-zinc-500">{songs.length} songs</p>
            </div>

            <div className="flex gap-3">
              <Button onClick={handlePlayAll} className="gap-2" disabled={songs.length === 0}>
                <Play className="h-4 w-4" /> Play All
              </Button>
              <Button
                variant="outline"
                className={cn("gap-2", isLiked && "text-green-500 border-green-500")}
                onClick={handleToggleLike}
              >
                <Heart className={cn("h-4 w-4", isLiked && "fill-green-500")} />
                {isLiked ? "Liked" : "Like"}
              </Button>
            </div>
          </div>
        </div>

        {/* Songs List */}
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Songs</h2>

          {songs.length === 0 ? (
            <div className="text-center py-8 bg-zinc-800/30 rounded-lg">
              <p className="text-zinc-400">No songs found in this album</p>
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-[auto_1fr_auto_auto] gap-4 px-4 py-2 text-zinc-400 text-sm border-b border-zinc-800">
                <div className="w-8">#</div>
                <div>TITLE</div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                </div>
                <div></div>
              </div>

              <div className="divide-y divide-zinc-800/50">
                {songs.map((song, index) => {
                  const isActive = currentSong?.id === song.id

                  return (
                    <div
                      key={song.id}
                      className={cn(
                        "grid grid-cols-[auto_1fr_auto_auto] gap-4 px-4 py-3 items-center hover:bg-zinc-800/50 rounded-md cursor-pointer transition-colors",
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

                      <div className="min-w-0">
                        <div className={cn("font-medium truncate", isActive && "text-green-400")}>{song.title}</div>
                        <div className="text-sm text-zinc-400 truncate">{song.artist}</div>
                      </div>

                      <div className="text-zinc-400">{formatTime(song.duration)}</div>

                      <div>
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
      </div>
    </div>
  )
}
