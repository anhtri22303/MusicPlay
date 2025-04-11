"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/hooks/use-toast"
import { Search, RefreshCw, Plus, Album, ListMusic, ArrowLeft } from "lucide-react"
import Link from "next/link"
import AlbumCard from "@/components/add-music/album-card"
import PlaylistCard from "@/components/add-music/playlist-card"
import TrackList from "@/components/add-music/track-list"

export default function AddMusicPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)

  const [newReleases, setNewReleases] = useState([])
  const [isLoadingReleases, setIsLoadingReleases] = useState(false)

  const [featuredPlaylists, setFeaturedPlaylists] = useState([])
  const [isLoadingPlaylists, setIsLoadingPlaylists] = useState(false)

  const [selectedAlbum, setSelectedAlbum] = useState(null)
  const [albumTracks, setAlbumTracks] = useState([])
  const [isLoadingAlbumTracks, setIsLoadingAlbumTracks] = useState(false)

  const [selectedPlaylist, setSelectedPlaylist] = useState(null)
  const [playlistTracks, setPlaylistTracks] = useState([])
  const [isLoadingPlaylistTracks, setIsLoadingPlaylistTracks] = useState(false)

  // Load new releases and featured playlists on mount
  useEffect(() => {
    fetchNewReleases()
    fetchFeaturedPlaylists()
  }, [])

  // Search Spotify
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setIsSearching(true)
    setSearchResults([])

    try {
      const response = await fetch(`/api/spotify/search?q=${encodeURIComponent(searchQuery)}&limit=50`)

      if (response.ok) {
        const data = await response.json()
        setSearchResults(data.tracks || [])
      } else {
        const errorData = await response.json()
        toast({
          title: "Search Error",
          description: errorData.error || "Failed to search Spotify",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Search Error",
        description: "Failed to connect to the server",
        variant: "destructive",
      })
      console.error("Search error:", error)
    } finally {
      setIsSearching(false)
    }
  }

  // Fetch new releases
  const fetchNewReleases = async () => {
    setIsLoadingReleases(true)

    try {
      const response = await fetch("/api/spotify/new-releases?limit=12")

      if (response.ok) {
        const data = await response.json()
        setNewReleases(data.albums || [])
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.error || "Failed to fetch new releases",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to connect to the server",
        variant: "destructive",
      })
      console.error("Error fetching new releases:", error)
    } finally {
      setIsLoadingReleases(false)
    }
  }

  // Fetch featured playlists
  const fetchFeaturedPlaylists = async () => {
    setIsLoadingPlaylists(true)

    try {
      const response = await fetch("/api/spotify/featured-playlists?limit=12")

      if (response.ok) {
        const data = await response.json()
        setFeaturedPlaylists(data.playlists || [])
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.error || "Failed to fetch featured playlists",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to connect to the server",
        variant: "destructive",
      })
      console.error("Error fetching featured playlists:", error)
    } finally {
      setIsLoadingPlaylists(false)
    }
  }

  // Fetch album tracks
  const fetchAlbumTracks = async (albumId: string) => {
    setIsLoadingAlbumTracks(true)

    try {
      const response = await fetch(`/api/spotify/albums/${albumId}/tracks`)

      if (response.ok) {
        const data = await response.json()
        setAlbumTracks(data.tracks || [])
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.error || "Failed to fetch album tracks",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to connect to the server",
        variant: "destructive",
      })
      console.error("Error fetching album tracks:", error)
    } finally {
      setIsLoadingAlbumTracks(false)
    }
  }

  // Fetch playlist tracks
  const fetchPlaylistTracks = async (playlistId: string) => {
    setIsLoadingPlaylistTracks(true)

    try {
      const response = await fetch(`/api/spotify/playlists/${playlistId}/tracks`)

      if (response.ok) {
        const data = await response.json()
        setPlaylistTracks(data.tracks || [])
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.error || "Failed to fetch playlist tracks",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to connect to the server",
        variant: "destructive",
      })
      console.error("Error fetching playlist tracks:", error)
    } finally {
      setIsLoadingPlaylistTracks(false)
    }
  }

  // Add track to database
  const handleAddTrack = async (track: any) => {
    try {
      const response = await fetch("/api/songs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(track),
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: "Success",
          description: "Track added to your library",
        })
        return true
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.error || "Failed to add track",
          variant: "destructive",
        })
        return false
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to connect to the server",
        variant: "destructive",
      })
      console.error("Error adding track:", error)
      return false
    }
  }

  // Import all tracks from album
  const handleImportAlbum = async () => {
    if (!albumTracks.length || !selectedAlbum) return

    try {
      // First create the album
      const albumResponse = await fetch("/api/albums", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: selectedAlbum.title,
          artist: selectedAlbum.artist,
          releaseDate: selectedAlbum.releaseDate,
          coverUrl: selectedAlbum.coverUrl,
          spotifyId: selectedAlbum.spotifyId,
          spotifyUrl: selectedAlbum.spotifyUrl,
          source: "spotify",
        }),
      })

      if (!albumResponse.ok) {
        throw new Error("Failed to create album")
      }

      const albumData = await albumResponse.json()
      const albumId = albumData.id

      // Then add all tracks
      const songIds = []
      for (const track of albumTracks) {
        // Add albumId to track
        track.albumId = albumId

        const response = await fetch("/api/songs", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(track),
        })

        if (response.ok) {
          const songData = await response.json()
          songIds.push(songData.id)
        }
      }

      // Update album with song IDs
      if (songIds.length > 0) {
        await fetch(`/api/albums/${albumId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            songs: songIds,
          }),
        })
      }

      toast({
        title: "Success",
        description: `Album imported with ${songIds.length} tracks`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to import album",
        variant: "destructive",
      })
      console.error("Error importing album:", error)
    }
  }

  // Import playlist with tracks
  const handleImportPlaylist = async () => {
    if (!playlistTracks.length || !selectedPlaylist) return

    try {
      // First add all tracks
      const songIds = []
      for (const track of playlistTracks) {
        const response = await fetch("/api/songs", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(track),
        })

        if (response.ok) {
          const songData = await response.json()
          songIds.push(songData.id)
        }
      }

      // Then create the playlist with song IDs
      const playlistResponse = await fetch("/api/playlists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: selectedPlaylist.name,
          description: selectedPlaylist.description,
          coverUrl: selectedPlaylist.coverUrl,
          songs: songIds,
          spotifyId: selectedPlaylist.spotifyId,
          spotifyUrl: selectedPlaylist.spotifyUrl,
          source: "spotify",
        }),
      })

      if (!playlistResponse.ok) {
        throw new Error("Failed to create playlist")
      }

      toast({
        title: "Success",
        description: `Playlist imported with ${songIds.length} tracks`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to import playlist",
        variant: "destructive",
      })
      console.error("Error importing playlist:", error)
    }
  }

  // Handle album selection
  const handleSelectAlbum = (album: any) => {
    setSelectedAlbum(album)
    fetchAlbumTracks(album.spotifyId)
  }

  // Handle playlist selection
  const handleSelectPlaylist = (playlist: any) => {
    setSelectedPlaylist(playlist)
    fetchPlaylistTracks(playlist.spotifyId)
  }

  // Go back from album or playlist view
  const handleBack = () => {
    setSelectedAlbum(null)
    setAlbumTracks([])
    setSelectedPlaylist(null)
    setPlaylistTracks([])
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-white p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Add Music</h1>
            <p className="text-zinc-400">Import music from Spotify to your library</p>
          </div>
          <Link href="/">
            <Button variant="outline">Back to Player</Button>
          </Link>
        </header>

        {selectedAlbum ? (
          <div className="space-y-6">
            <Button variant="ghost" onClick={handleBack} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Browse
            </Button>

            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-64 flex-shrink-0">
                <div className="aspect-square bg-zinc-800 rounded-md overflow-hidden">
                  {selectedAlbum.coverUrl ? (
                    <img
                      src={selectedAlbum.coverUrl || "/placeholder.svg"}
                      alt={selectedAlbum.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-zinc-700">
                      <Album className="h-16 w-16 text-zinc-500" />
                    </div>
                  )}
                </div>
                <div className="mt-4">
                  <h2 className="text-xl font-bold">{selectedAlbum.title}</h2>
                  <p className="text-zinc-400">{selectedAlbum.artist}</p>
                  <p className="text-sm text-zinc-500 mt-1">
                    {selectedAlbum.totalTracks} tracks • {selectedAlbum.releaseDate}
                  </p>

                  <Button
                    className="w-full mt-4 gap-2"
                    onClick={handleImportAlbum}
                    disabled={isLoadingAlbumTracks || albumTracks.length === 0}
                  >
                    <Plus className="h-4 w-4" />
                    Import Album with All Tracks
                  </Button>
                </div>
              </div>

              <div className="flex-1">
                <Card className="bg-zinc-800 border-zinc-700">
                  <CardHeader>
                    <CardTitle>Album Tracks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingAlbumTracks ? (
                      <div className="flex justify-center py-8">
                        <div className="w-8 h-8 border-2 border-t-green-400 border-zinc-600 rounded-full animate-spin"></div>
                      </div>
                    ) : albumTracks.length === 0 ? (
                      <p className="text-center py-8 text-zinc-400">No tracks found</p>
                    ) : (
                      <TrackList tracks={albumTracks} onAddTrack={handleAddTrack} />
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        ) : selectedPlaylist ? (
          <div className="space-y-6">
            <Button variant="ghost" onClick={handleBack} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Browse
            </Button>

            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-64 flex-shrink-0">
                <div className="aspect-square bg-zinc-800 rounded-md overflow-hidden">
                  {selectedPlaylist.coverUrl ? (
                    <img
                      src={selectedPlaylist.coverUrl || "/placeholder.svg"}
                      alt={selectedPlaylist.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-zinc-700">
                      <ListMusic className="h-16 w-16 text-zinc-500" />
                    </div>
                  )}
                </div>
                <div className="mt-4">
                  <h2 className="text-xl font-bold">{selectedPlaylist.name}</h2>
                  {selectedPlaylist.description && (
                    <p className="text-zinc-400 text-sm mt-1">{selectedPlaylist.description}</p>
                  )}
                  <p className="text-sm text-zinc-500 mt-2">
                    {selectedPlaylist.totalTracks} tracks • By {selectedPlaylist.owner || "Spotify"}
                  </p>

                  <Button
                    className="w-full mt-4 gap-2"
                    onClick={handleImportPlaylist}
                    disabled={isLoadingPlaylistTracks || playlistTracks.length === 0}
                  >
                    <Plus className="h-4 w-4" />
                    Import Playlist with All Tracks
                  </Button>
                </div>
              </div>

              <div className="flex-1">
                <Card className="bg-zinc-800 border-zinc-700">
                  <CardHeader>
                    <CardTitle>Playlist Tracks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingPlaylistTracks ? (
                      <div className="flex justify-center py-8">
                        <div className="w-8 h-8 border-2 border-t-green-400 border-zinc-600 rounded-full animate-spin"></div>
                      </div>
                    ) : playlistTracks.length === 0 ? (
                      <p className="text-center py-8 text-zinc-400">No tracks found</p>
                    ) : (
                      <TrackList tracks={playlistTracks} onAddTrack={handleAddTrack} />
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        ) : (
          <Tabs defaultValue="search">
            <TabsList className="mb-6">
              <TabsTrigger value="search">Search</TabsTrigger>
              <TabsTrigger value="new-releases">New Releases</TabsTrigger>
              <TabsTrigger value="playlists">Featured Playlists</TabsTrigger>
            </TabsList>

            <TabsContent value="search" className="space-y-6">
              <Card className="bg-zinc-800 border-zinc-700">
                <CardHeader>
                  <CardTitle>Search Spotify</CardTitle>
                  <CardDescription>Search for songs, artists, or albums</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSearch} className="flex gap-2">
                    <Input
                      placeholder="Search for songs, artists, or albums..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 bg-zinc-700 border-zinc-600"
                    />
                    <Button type="submit" disabled={isSearching}>
                      {isSearching ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Searching...
                        </>
                      ) : (
                        <>
                          <Search className="h-4 w-4 mr-2" />
                          Search
                        </>
                      )}
                    </Button>
                  </form>

                  {searchResults.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-lg font-medium mb-4">Search Results</h3>
                      <TrackList tracks={searchResults} onAddTrack={handleAddTrack} />
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="new-releases" className="space-y-6">
              <Card className="bg-zinc-800 border-zinc-700">
                <CardHeader>
                  <CardTitle>New Releases</CardTitle>
                  <CardDescription>Latest albums and singles from Spotify</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingReleases ? (
                    <div className="flex justify-center py-8">
                      <div className="w-8 h-8 border-2 border-t-green-400 border-zinc-600 rounded-full animate-spin"></div>
                    </div>
                  ) : newReleases.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-zinc-400 mb-4">No new releases found</p>
                      <Button onClick={fetchNewReleases}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {newReleases.map((album: any) => (
                        <AlbumCard key={album.id} album={album} onSelect={() => handleSelectAlbum(album)} />
                      ))}
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button variant="outline" onClick={fetchNewReleases} disabled={isLoadingReleases}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingReleases ? "animate-spin" : ""}`} />
                    Refresh
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="playlists" className="space-y-6">
              <Card className="bg-zinc-800 border-zinc-700">
                <CardHeader>
                  <CardTitle>Featured Playlists</CardTitle>
                  <CardDescription>Curated playlists from Spotify</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingPlaylists ? (
                    <div className="flex justify-center py-8">
                      <div className="w-8 h-8 border-2 border-t-green-400 border-zinc-600 rounded-full animate-spin"></div>
                    </div>
                  ) : featuredPlaylists.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-zinc-400 mb-4">No featured playlists found</p>
                      <Button onClick={fetchFeaturedPlaylists}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {featuredPlaylists.map((playlist: any) => (
                        <PlaylistCard
                          key={playlist.id}
                          playlist={playlist}
                          onSelect={() => handleSelectPlaylist(playlist)}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button variant="outline" onClick={fetchFeaturedPlaylists} disabled={isLoadingPlaylists}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingPlaylists ? "animate-spin" : ""}`} />
                    Refresh
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  )
}
