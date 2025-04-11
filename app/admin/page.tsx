"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, ListMusic, RefreshCw, Music } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/hooks/use-toast"

export default function AdminPage() {
  const [songForm, setSongForm] = useState({
    title: "",
    artist: "",
    album: "",
    audioUrl: "",
    coverUrl: "",
  })

  const [playlistForm, setPlaylistForm] = useState({
    name: "",
    coverUrl: "",
  })

  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [importStats, setImportStats] = useState(null)

  const handleSongChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setSongForm({
      ...songForm,
      [e.target.name]: e.target.value,
    })
  }

  const handlePlaylistChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setPlaylistForm({
      ...playlistForm,
      [e.target.name]: e.target.value,
    })
  }

  const handleSongSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch("/api/songs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(songForm),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Song added successfully!",
        })
        setSongForm({
          title: "",
          artist: "",
          album: "",
          audioUrl: "",
          coverUrl: "",
        })
      } else {
        const data = await response.json()
        toast({
          title: "Error",
          description: data.error || "Failed to add song",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error adding song",
        variant: "destructive",
      })
      console.error(error)
    }
  }

  const handlePlaylistSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch("/api/playlists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(playlistForm),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Playlist created successfully!",
        })
        setPlaylistForm({
          name: "",
          coverUrl: "",
        })
      } else {
        const data = await response.json()
        toast({
          title: "Error",
          description: data.error || "Failed to create playlist",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error creating playlist",
        variant: "destructive",
      })
      console.error(error)
    }
  }

  const handleSpotifySearch = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!searchQuery.trim()) return

    setIsSearching(true)
    setSearchResults([])

    try {
      const response = await fetch(`/api/spotify/search?q=${encodeURIComponent(searchQuery)}`)

      if (response.ok) {
        const data = await response.json()
        setSearchResults(data.tracks || [])
      } else {
        const data = await response.json()
        toast({
          title: "Error",
          description: data.error || "Failed to search Spotify",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error searching Spotify",
        variant: "destructive",
      })
      console.error(error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleAddTrack = async (track: any) => {
    try {
      const response = await fetch("/api/spotify/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ track }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Track added to your library!",
        })
      } else {
        const data = await response.json()
        toast({
          title: "Error",
          description: data.error || "Failed to add track",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error adding track",
        variant: "destructive",
      })
      console.error(error)
    }
  }

  const handleImportFromSpotify = async () => {
    setIsImporting(true)
    setImportStats(null)

    try {
      const response = await fetch("/api/spotify/import")

      if (response.ok) {
        const data = await response.json()
        setImportStats(data.stats)
        toast({
          title: "Success",
          description: `Imported ${data.stats.importedTracks} tracks and ${data.stats.importedPlaylists} playlists from Spotify!`,
        })
      } else {
        const data = await response.json()
        toast({
          title: "Error",
          description: data.error || "Failed to import from Spotify",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error importing from Spotify",
        variant: "destructive",
      })
      console.error(error)
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

        <Tabs defaultValue="spotify">
          <TabsList className="mb-6">
            <TabsTrigger value="spotify">Spotify Import</TabsTrigger>
            <TabsTrigger value="add-song">Add Song</TabsTrigger>
            <TabsTrigger value="create-playlist">Create Playlist</TabsTrigger>
          </TabsList>

          <TabsContent value="spotify">
            <Card>
              <CardHeader>
                <CardTitle>Import Music from Spotify</CardTitle>
                <CardDescription>Search for songs or import new releases and featured playlists</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Auto Import Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Auto Import</h3>
                  <p className="text-sm text-zinc-400">
                    Import new releases and featured playlists from Spotify automatically.
                  </p>
                  <Button onClick={handleImportFromSpotify} disabled={isImporting} className="gap-2">
                    <RefreshCw className={`h-4 w-4 ${isImporting ? "animate-spin" : ""}`} />
                    {isImporting ? "Importing..." : "Import from Spotify"}
                  </Button>

                  {importStats && (
                    <div className="p-4 bg-zinc-800 rounded-md text-sm">
                      <p>Successfully imported:</p>
                      <ul className="list-disc list-inside mt-2">
                        <li>{importStats.importedTracks} tracks</li>
                        <li>{importStats.importedPlaylists} playlists</li>
                      </ul>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Search Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Search Spotify</h3>
                  <form onSubmit={handleSpotifySearch} className="flex gap-2">
                    <Input
                      placeholder="Search for songs, artists, or albums..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1"
                    />
                    <Button type="submit" disabled={isSearching}>
                      {isSearching ? "Searching..." : "Search"}
                    </Button>
                  </form>

                  {searchResults.length > 0 && (
                    <div className="space-y-4 mt-4">
                      <h4 className="font-medium">Search Results</h4>
                      <div className="grid gap-4 max-h-96 overflow-y-auto pr-2">
                        {searchResults.map((track: any) => (
                          <div key={track.id} className="flex items-center gap-3 p-3 bg-zinc-800 rounded-md">
                            <div className="h-12 w-12 bg-zinc-700 rounded overflow-hidden flex-shrink-0">
                              {track.coverUrl ? (
                                <img
                                  src={track.coverUrl || "/placeholder.svg"}
                                  alt={track.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Music className="h-6 w-6 text-zinc-500" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="font-medium truncate">{track.title}</div>
                              <div className="text-sm text-zinc-400 truncate">{track.artist}</div>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => handleAddTrack(track)}>
                              Add
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="add-song">
            <Card>
              <CardHeader>
                <CardTitle>Add New Song</CardTitle>
                <CardDescription>Add a new song to your music library</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSongSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Song Title</Label>
                      <Input
                        id="title"
                        name="title"
                        value={songForm.title}
                        onChange={handleSongChange}
                        placeholder="Enter song title"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="artist">Artist</Label>
                      <Input
                        id="artist"
                        name="artist"
                        value={songForm.artist}
                        onChange={handleSongChange}
                        placeholder="Enter artist name"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="album">Album</Label>
                    <Input
                      id="album"
                      name="album"
                      value={songForm.album}
                      onChange={handleSongChange}
                      placeholder="Enter album name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="audioUrl">Audio URL</Label>
                    <Input
                      id="audioUrl"
                      name="audioUrl"
                      value={songForm.audioUrl}
                      onChange={handleSongChange}
                      placeholder="Enter audio file URL"
                      required
                    />
                    <p className="text-xs text-zinc-400">
                      Enter a direct URL to an MP3 file. For testing, you can use:
                      https://storage.googleapis.com/media-session/elephants-dream/the-wires.mp3
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="coverUrl">Cover Image URL</Label>
                    <Input
                      id="coverUrl"
                      name="coverUrl"
                      value={songForm.coverUrl}
                      onChange={handleSongChange}
                      placeholder="Enter cover image URL"
                    />
                  </div>

                  <div className="flex items-center gap-4 pt-4">
                    <Button type="submit" className="gap-2">
                      <Upload className="h-4 w-4" />
                      Add Song
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="create-playlist">
            <Card>
              <CardHeader>
                <CardTitle>Create New Playlist</CardTitle>
                <CardDescription>Create a new playlist for your music</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePlaylistSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Playlist Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={playlistForm.name}
                      onChange={handlePlaylistChange}
                      placeholder="Enter playlist name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="coverUrl">Cover Image URL</Label>
                    <Input
                      id="coverUrl"
                      name="coverUrl"
                      value={playlistForm.coverUrl}
                      onChange={handlePlaylistChange}
                      placeholder="Enter cover image URL"
                    />
                  </div>

                  <div className="flex items-center gap-4 pt-4">
                    <Button type="submit" className="gap-2">
                      <ListMusic className="h-4 w-4" />
                      Create Playlist
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
