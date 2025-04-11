// Spotify API utilities
const SPOTIFY_API_TOKEN_URL = "https://accounts.spotify.com/api/token"
const SPOTIFY_API_BASE_URL = "https://api.spotify.com/v1"

// Spotify credentials
const SPOTIFY_CLIENT_ID = "aa954cb5c425421cb1b6e9e39fbe2d9c"
const SPOTIFY_CLIENT_SECRET = "653d2032b48b4433bf0bd62ee0468714"

// Get Spotify access token
export async function getSpotifyAccessToken() {
  try {
    const basic = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString("base64")

    const response = await fetch(SPOTIFY_API_TOKEN_URL, {
      method: "POST",
      headers: {
        Authorization: `Basic ${basic}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
      }),
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`Failed to get Spotify token: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data.access_token
  } catch (error) {
    console.error("Error getting Spotify access token:", error)
    throw error
  }
}

// Search tracks on Spotify
export async function searchSpotifyTracks(query: string, limit = 20) {
  try {
    const accessToken = await getSpotifyAccessToken()

    const response = await fetch(
      `${SPOTIFY_API_BASE_URL}/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
      },
    )

    if (!response.ok) {
      throw new Error(`Failed to search Spotify: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data.tracks.items
  } catch (error) {
    console.error("Error searching Spotify tracks:", error)
    throw error
  }
}

// Get new releases from Spotify
export async function getSpotifyNewReleases(limit = 20, offset = 0) {
  try {
    const accessToken = await getSpotifyAccessToken()

    const response = await fetch(`${SPOTIFY_API_BASE_URL}/browse/new-releases?limit=${limit}&offset=${offset}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`Failed to get new releases: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data.albums.items
  } catch (error) {
    console.error("Error getting Spotify new releases:", error)
    throw error
  }
}

// Get featured playlists from Spotify
export async function getSpotifyFeaturedPlaylists(limit = 10, offset = 0) {
  try {
    const accessToken = await getSpotifyAccessToken()

    const response = await fetch(`${SPOTIFY_API_BASE_URL}/browse/featured-playlists?limit=${limit}&offset=${offset}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`Failed to get featured playlists: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data.playlists.items
  } catch (error) {
    console.error("Error getting Spotify featured playlists:", error)
    throw error
  }
}

// Get tracks from a Spotify playlist
export async function getSpotifyPlaylistTracks(playlistId: string, limit = 50, offset = 0) {
  try {
    const accessToken = await getSpotifyAccessToken()

    const response = await fetch(
      `${SPOTIFY_API_BASE_URL}/playlists/${playlistId}/tracks?limit=${limit}&offset=${offset}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
      },
    )

    if (!response.ok) {
      throw new Error(`Failed to get playlist tracks: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data.items
  } catch (error) {
    console.error("Error getting Spotify playlist tracks:", error)
    throw error
  }
}

// Get album tracks from Spotify
export async function getSpotifyAlbumTracks(albumId: string, limit = 50, offset = 0) {
  try {
    const accessToken = await getSpotifyAccessToken()

    const response = await fetch(`${SPOTIFY_API_BASE_URL}/albums/${albumId}/tracks?limit=${limit}&offset=${offset}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`Failed to get album tracks: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data.items
  } catch (error) {
    console.error("Error getting Spotify album tracks:", error)
    throw error
  }
}

// Get track details from Spotify
export async function getSpotifyTrack(trackId: string) {
  try {
    const accessToken = await getSpotifyAccessToken()

    const response = await fetch(`${SPOTIFY_API_BASE_URL}/tracks/${trackId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`Failed to get track: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error getting Spotify track:", error)
    throw error
  }
}

// Get artist details from Spotify
export async function getSpotifyArtist(artistId: string) {
  try {
    const accessToken = await getSpotifyAccessToken()

    const response = await fetch(`${SPOTIFY_API_BASE_URL}/artists/${artistId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`Failed to get artist: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error getting Spotify artist:", error)
    throw error
  }
}

// Get top tracks for an artist from Spotify
export async function getSpotifyArtistTopTracks(artistId: string, market = "US") {
  try {
    const accessToken = await getSpotifyAccessToken()

    const response = await fetch(`${SPOTIFY_API_BASE_URL}/artists/${artistId}/top-tracks?market=${market}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`Failed to get artist top tracks: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data.tracks
  } catch (error) {
    console.error("Error getting Spotify artist top tracks:", error)
    throw error
  }
}

// Format Spotify track to our app's song format
export function formatSpotifyTrack(track: any) {
  return {
    id: `spotify_${track.id}`,
    title: track.name,
    artist: track.artists.map((artist: any) => artist.name).join(", "),
    album: track.album?.name || "",
    duration: Math.floor(track.duration_ms / 1000),
    audioUrl: track.preview_url || "https://storage.googleapis.com/media-session/elephants-dream/the-wires.mp3", // Fallback if no preview URL
    coverUrl: track.album?.images[0]?.url || "/placeholder.svg?height=400&width=400",
    spotifyId: track.id,
    spotifyUrl: track.external_urls?.spotify || "",
    source: "spotify",
    createdAt: new Date(),
  }
}

// Format Spotify album to our app's format
export function formatSpotifyAlbum(album: any) {
  return {
    id: `spotify_album_${album.id}`,
    name: album.name,
    artist: album.artists.map((artist: any) => artist.name).join(", "),
    coverUrl: album.images[0]?.url || "/placeholder.svg?height=400&width=400",
    spotifyId: album.id,
    spotifyUrl: album.external_urls?.spotify || "",
    totalTracks: album.total_tracks,
    releaseDate: album.release_date,
    source: "spotify",
    createdAt: new Date(),
  }
}

// Format Spotify playlist to our app's format
export function formatSpotifyPlaylist(playlist: any) {
  return {
    id: `spotify_playlist_${playlist.id}`,
    name: playlist.name,
    description: playlist.description || "",
    coverUrl: playlist.images[0]?.url || "/placeholder.svg?height=400&width=400",
    songs: [],
    spotifyId: playlist.id,
    spotifyUrl: playlist.external_urls?.spotify || "",
    owner: playlist.owner?.display_name || "",
    totalTracks: playlist.tracks?.total || 0,
    source: "spotify",
    createdAt: new Date(),
  }
}
