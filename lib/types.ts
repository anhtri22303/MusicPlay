export interface Song {
  id: string
  title: string
  artist: string
  album: string
  duration: number
  audioUrl: string
  coverUrl: string
  spotifyId?: string
  spotifyUrl?: string
  source?: string
  albumId?: string // Reference to album
}

export interface Album {
  id: string
  title: string
  artist: string
  releaseDate?: string
  coverUrl: string
  songs: string[] // Array of song IDs
  spotifyId?: string
  spotifyUrl?: string
  source?: string
  createdAt: Date
}

export interface Playlist {
  id: string
  name: string
  description?: string
  coverUrl?: string
  songs: string[] // Array of song IDs
  spotifyId?: string
  spotifyUrl?: string
  source?: string
}
