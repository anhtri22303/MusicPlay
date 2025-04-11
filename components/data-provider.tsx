"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useMusicStore } from "@/lib/music-store"
import AutoImport from "./auto-import"
import DebugPanel from "./debug-panel"

export default function DataProvider({ children }: { children: React.ReactNode }) {
  const { setSongs, setPlaylists, setAlbums, setFeaturedSongs } = useMusicStore()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Fetch songs from API
    const fetchSongs = async () => {
      try {
        console.log("Fetching songs...")
        const response = await fetch("/api/songs")

        if (response.ok) {
          const data = await response.json()
          console.log(`Fetched ${data.length} songs`)
          setSongs(data)

          // Set featured songs (first 10 songs or all if less than 10)
          setFeaturedSongs(data.slice(0, 10))
        } else {
          console.error("Error fetching songs:", response.statusText)
          setSongs([])
          setFeaturedSongs([])
        }
      } catch (error) {
        console.error("Error fetching songs:", error)
        setSongs([])
        setFeaturedSongs([])
      }
    }

    // Fetch playlists from API
    const fetchPlaylists = async () => {
      try {
        console.log("Fetching playlists...")
        const response = await fetch("/api/playlists")

        if (response.ok) {
          const data = await response.json()
          console.log(`Fetched ${data.length} playlists`)
          setPlaylists(data)
        } else {
          console.error("Error fetching playlists:", response.statusText)
          setPlaylists([])
        }
      } catch (error) {
        console.error("Error fetching playlists:", error)
        setPlaylists([])
      }
    }

    // Fetch albums from API
    const fetchAlbums = async () => {
      try {
        console.log("Fetching albums...")
        const response = await fetch("/api/albums")

        if (response.ok) {
          const data = await response.json()
          console.log(`Fetched ${data.length} albums`)
          setAlbums(data)
        } else {
          console.error("Error fetching albums:", response.statusText)
          setAlbums([])
        }
      } catch (error) {
        console.error("Error fetching albums:", error)
        setAlbums([])
      } finally {
        setIsLoading(false)
      }
    }

    // Import music from Spotify
    const importMusic = async () => {
      try {
        console.log("Importing music from Spotify...")
        await fetch("/api/spotify/import")
        console.log("Import complete")
      } catch (error) {
        console.error("Error importing music:", error)
      }
    }

    // Run all data fetching operations
    const loadData = async () => {
      try {
        await importMusic()
        await fetchSongs()
        await fetchPlaylists()
        await fetchAlbums()
      } catch (error) {
        console.error("Error loading data:", error)
        setError("Failed to load music data")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [setSongs, setPlaylists, setAlbums, setFeaturedSongs])

  return (
    <>
      {children}
      <AutoImport />
      <DebugPanel />
      {isLoading && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-t-green-400 border-zinc-700 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white text-lg">Loading your music library...</p>
            <p className="text-zinc-400 text-sm mt-2">This may take a moment...</p>
          </div>
        </div>
      )}
    </>
  )
}
