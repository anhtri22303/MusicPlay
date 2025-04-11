"use client"

import { useState, useEffect, useRef } from "react"
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Repeat,
  Shuffle,
  Heart,
  Music,
  Search,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useMusicStore } from "@/lib/music-store"
import { formatTime } from "@/lib/utils"
import SongList from "./song-list"
import SpotifySongs from "./spotify-songs"
import AlbumGrid from "./album-grid"
import { useMobile } from "@/hooks/use-mobile"
import { toast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

export default function MusicPlayer() {
  const {
    currentSong,
    isPlaying,
    togglePlay,
    nextSong,
    prevSong,
    playlists,
    albums,
    recentlyPlayed,
    featuredSongs,
    songs,
    setCurrentSong,
  } = useMusicStore()

  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(80)
  const [isMuted, setIsMuted] = useState(false)
  const [isRepeat, setIsRepeat] = useState(false)
  const [isShuffle, setIsShuffle] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [isAudioLoading, setIsAudioLoading] = useState(false)
  const [showVolumeSlider, setShowVolumeSlider] = useState(false)
  const [audioError, setAudioError] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const prevVolumeRef = useRef(volume)
  const isMobile = useMobile()

  // Debug log khi currentSong thay đổi
  useEffect(() => {
    if (currentSong) {
      console.log("Current song changed:", currentSong.id, currentSong.title, currentSong.audioUrl)
    }
  }, [currentSong])

  // Handle play/pause
  useEffect(() => {
    if (!audioRef.current || !currentSong) return

    const audioElement = audioRef.current

    const playAudio = async () => {
      if (isPlaying) {
        setIsAudioLoading(true)
        try {
          // Use the play() promise
          await audioElement.play()
        } catch (error) {
          console.error("Playback error:", error)
          // If autoplay is prevented, we need to update our state
          if (error instanceof DOMException && error.name === "NotAllowedError") {
            toast({
              title: "Playback blocked",
              description: "Interaction required before audio can play",
              variant: "destructive",
            })
          }
        } finally {
          setIsAudioLoading(false)
        }
      } else {
        audioElement.pause()
      }
    }

    playAudio()
  }, [isPlaying, currentSong, toast])

  // Update audio source when currentSong changes
  useEffect(() => {
    if (!audioRef.current || !currentSong) return

    // Reset current time when changing songs
    setCurrentTime(0)
    setAudioError(null)

    // Đảm bảo audio element được cập nhật với source mới
    audioRef.current.src = currentSong.audioUrl

    // Load the new audio source
    audioRef.current.load()

    // If isPlaying is true, attempt to play the new song
    if (isPlaying) {
      const playNewSong = async () => {
        setIsAudioLoading(true)
        try {
          await audioRef.current?.play()
        } catch (error) {
          console.error("Error playing new song:", error)
        } finally {
          setIsAudioLoading(false)
        }
      }

      playNewSong()
    }
  }, [currentSong, isPlaying])

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100
    }
  }, [volume, isMuted])

  // Handle time update
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
      setDuration(audioRef.current.duration || 0)
    }
  }

  // Handle slider change
  const handleSliderChange = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0]
      setCurrentTime(value[0])
    }
  }

  // Handle song end
  const handleSongEnd = () => {
    if (isRepeat) {
      // Repeat the current song
      if (audioRef.current) {
        audioRef.current.currentTime = 0
        audioRef.current.play()
      }
    } else {
      // Play next song
      nextSong()
    }
  }

  // Handle direct play from player controls
  const handlePlayPause = () => {
    if (!currentSong && songs.length > 0) {
      // If no song is selected, select the first one
      setCurrentSong(songs[0])
    } else {
      // Otherwise toggle play/pause
      togglePlay()
    }
  }

  // Toggle mute
  const handleToggleMute = () => {
    if (isMuted) {
      setIsMuted(false)
    } else {
      prevVolumeRef.current = volume
      setIsMuted(true)
    }
  }

  // Toggle repeat
  const handleToggleRepeat = () => {
    setIsRepeat(!isRepeat)
  }

  // Toggle shuffle
  const handleToggleShuffle = () => {
    setIsShuffle(!isShuffle)
    // Implement shuffle logic in the music store
  }

  // Toggle like
  const handleToggleLike = () => {
    setIsLiked(!isLiked)
    // Implement like functionality
  }

  return (
    <>
      {/* Audio Element */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleSongEnd}
        onLoadedMetadata={handleTimeUpdate}
        onCanPlay={() => setIsAudioLoading(false)}
        onLoadStart={() => setIsAudioLoading(true)}
        onError={(e) => {
          console.error("Audio error:", e)
          setIsAudioLoading(false)
          setAudioError("Could not play this track. Try another one.")
          toast({
            title: "Playback error",
            description: "Could not play this track. Try another one.",
            variant: "destructive",
          })
        }}
      />

      {/* Main Content Area */}
      <div className="flex flex-col h-full">
        {/* Search Bar */}
        <div className="p-4 border-b border-zinc-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 h-4 w-4" />
            <Input
              placeholder="Search for songs, artists, or albums..."
              className="pl-10 bg-zinc-800 border-zinc-700 text-zinc-300"
            />
          </div>
        </div>

        {/* Main Content Area */}
        <ScrollArea className="flex-1 p-6">
          <Tabs defaultValue="all">
            <TabsList className="mb-6">
              <TabsTrigger value="all">All Songs</TabsTrigger>
              <TabsTrigger value="spotify">Spotify Songs</TabsTrigger>
              <TabsTrigger value="albums">Albums</TabsTrigger>
              <TabsTrigger value="playlists">Playlists</TabsTrigger>
              <TabsTrigger value="featured">Featured</TabsTrigger>
              <TabsTrigger value="recent">Recently Played</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-6">
              <SongList songs={songs} title="All Songs" />
            </TabsContent>

            <TabsContent value="spotify" className="space-y-6">
              <SpotifySongs />
            </TabsContent>

            <TabsContent value="albums" className="space-y-6">
              <AlbumGrid albums={albums} title="Your Albums" />
            </TabsContent>

            <TabsContent value="playlists" className="space-y-6">
              <h1 className="text-2xl font-bold">Your Playlists</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {playlists.map((playlist) => (
                  <div
                    key={playlist.id}
                    className="bg-zinc-800/50 p-4 rounded-lg hover:bg-zinc-800 transition cursor-pointer"
                  >
                    <div className="aspect-square bg-zinc-700 rounded-md mb-3 overflow-hidden">
                      {playlist.coverUrl ? (
                        <img
                          src={playlist.coverUrl || "/placeholder.svg"}
                          alt={playlist.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Music className="h-12 w-12 text-zinc-500" />
                        </div>
                      )}
                    </div>
                    <h3 className="font-medium">{playlist.name}</h3>
                    <p className="text-sm text-zinc-400">{playlist.songs?.length || 0} songs</p>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="featured" className="space-y-6">
              <SongList songs={featuredSongs} title="Featured Songs" />
            </TabsContent>

            <TabsContent value="recent" className="space-y-6">
              <SongList songs={recentlyPlayed} title="Recently Played" />
            </TabsContent>
          </Tabs>
        </ScrollArea>
      </div>

      {/* Player Controls */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-zinc-800 bg-zinc-900/95 backdrop-blur-md p-3 z-50">
        {/* Progress Bar - Full Width */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-zinc-800 -translate-y-full">
          <div
            className="h-full bg-green-500"
            style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
          ></div>
        </div>

        <div className="flex items-center gap-4 max-w-7xl mx-auto">
          {/* Song Info */}
          <div className="flex items-center gap-3 w-1/4 min-w-[200px]">
            <div className="h-14 w-14 bg-zinc-800 rounded-md overflow-hidden flex-shrink-0 shadow-lg">
              {currentSong?.coverUrl ? (
                <img
                  src={currentSong.coverUrl || "/placeholder.svg"}
                  alt={currentSong.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Music className="h-6 w-6 text-zinc-500" />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <h3 className={`font-medium truncate ${currentSong ? "text-white" : "text-zinc-400"}`}>
                {currentSong?.title || "No song selected"}
              </h3>
              <p className="text-sm text-zinc-400 truncate">{currentSong?.artist || "Select a song to play"}</p>
              {audioError && <p className="text-xs text-red-400">{audioError}</p>}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className={cn("text-zinc-400 hover:text-white", isLiked && "text-green-500 hover:text-green-400")}
              onClick={handleToggleLike}
            >
              <Heart className={cn("h-5 w-5", isLiked && "fill-green-500")} />
            </Button>
          </div>

          {/* Main Controls */}
          <div className="flex flex-col items-center gap-1 flex-1">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleToggleShuffle}
                className={cn("text-zinc-400 hover:text-white", isShuffle && "text-green-500")}
              >
                <Shuffle className="h-4 w-4" />
              </Button>

              <Button variant="ghost" size="icon" onClick={prevSong} disabled={!currentSong}>
                <SkipBack className="h-5 w-5" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                className="rounded-full h-10 w-10 bg-white text-black hover:bg-zinc-200 hover:text-black"
                onClick={handlePlayPause}
                disabled={isAudioLoading}
              >
                {isAudioLoading ? (
                  <div className="h-5 w-5 border-2 border-t-transparent border-black rounded-full animate-spin"></div>
                ) : isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5" />
                )}
              </Button>

              <Button variant="ghost" size="icon" onClick={nextSong} disabled={!currentSong}>
                <SkipForward className="h-5 w-5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleToggleRepeat}
                className={cn("text-zinc-400 hover:text-white", isRepeat && "text-green-500")}
              >
                <Repeat className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2 w-full max-w-xl">
              <span className="text-xs text-zinc-400 w-10 text-right">{formatTime(currentTime)}</span>
              <Slider
                value={[currentTime]}
                max={duration || 100}
                step={0.1}
                onValueChange={handleSliderChange}
                className="flex-1"
                disabled={!currentSong}
              />
              <span className="text-xs text-zinc-400 w-10">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Volume Controls */}
          <div className="w-1/6 min-w-[120px] relative">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleToggleMute}
                onMouseEnter={() => setShowVolumeSlider(true)}
                className="text-zinc-400 hover:text-white"
              >
                {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </Button>

              <div
                className={cn("transition-opacity duration-200", showVolumeSlider ? "opacity-100" : "opacity-0")}
                onMouseEnter={() => setShowVolumeSlider(true)}
                onMouseLeave={() => setShowVolumeSlider(false)}
              >
                <Slider
                  value={[isMuted ? 0 : volume]}
                  max={100}
                  onValueChange={(value) => {
                    setVolume(value[0])
                    if (isMuted && value[0] > 0) {
                      setIsMuted(false)
                    }
                  }}
                  className="w-24"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
