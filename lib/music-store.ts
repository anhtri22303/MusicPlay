"use client"

import { create } from "zustand"
import type { Song, Album, Playlist } from "./types"

interface MusicStore {
  songs: Song[]
  playlists: Playlist[]
  albums: Album[]
  currentSong: Song | null
  isPlaying: boolean
  recentlyPlayed: Song[]
  featuredSongs: Song[]

  setSongs: (songs: Song[]) => void
  setPlaylists: (playlists: Playlist[]) => void
  setAlbums: (albums: Album[]) => void
  setFeaturedSongs: (songs: Song[]) => void
  setCurrentSong: (song: Song) => void
  togglePlay: () => void
  nextSong: () => void
  prevSong: () => void
  addToRecentlyPlayed: (song: Song) => void
}

export const useMusicStore = create<MusicStore>((set, get) => ({
  // Khởi tạo với mảng rỗng thay vì dữ liệu tĩnh
  songs: [],
  playlists: [],
  albums: [],
  currentSong: null,
  isPlaying: false,
  recentlyPlayed: [],
  featuredSongs: [],

  setSongs: (songs) => set({ songs }),

  setPlaylists: (playlists) => set({ playlists }),

  setAlbums: (albums) => set({ albums }),

  setFeaturedSongs: (songs) => set({ featuredSongs: songs }),

  setCurrentSong: (song) => {
    console.log("Setting current song:", song.title, song.id, song.audioUrl)
    // Đảm bảo bài hát có audioUrl hợp lệ
    if (!song.audioUrl) {
      console.error("Song has no audio URL:", song)
      return
    }
    set({ currentSong: song, isPlaying: true })
    get().addToRecentlyPlayed(song)
  },

  togglePlay: () => {
    console.log("Toggling play state")
    set((state) => ({ isPlaying: !state.isPlaying }))
  },

  nextSong: () => {
    const { songs, currentSong } = get()
    if (!currentSong || songs.length === 0) return

    const currentIndex = songs.findIndex((song) => song.id === currentSong.id)
    const nextIndex = (currentIndex + 1) % songs.length
    const nextSong = songs[nextIndex]

    console.log("Playing next song:", nextSong.title)
    set({ currentSong: nextSong, isPlaying: true })
    get().addToRecentlyPlayed(nextSong)
  },

  prevSong: () => {
    const { songs, currentSong } = get()
    if (!currentSong || songs.length === 0) return

    const currentIndex = songs.findIndex((song) => song.id === currentSong.id)
    const prevIndex = (currentIndex - 1 + songs.length) % songs.length
    const prevSong = songs[prevIndex]

    console.log("Playing previous song:", prevSong.title)
    set({ currentSong: prevSong, isPlaying: true })
    get().addToRecentlyPlayed(prevSong)
  },

  addToRecentlyPlayed: (song) => {
    set((state) => {
      // Remove the song if it's already in the recently played list
      const filteredRecent = state.recentlyPlayed.filter((s) => s.id !== song.id)

      // Add the song to the beginning of the list and limit to 10 items
      return {
        recentlyPlayed: [song, ...filteredRecent].slice(0, 10),
      }
    })
  },
}))

export type { Song } from "./types"
