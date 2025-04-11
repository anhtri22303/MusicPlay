"use client"

import { useState } from "react"
import { useMusicStore } from "@/lib/music-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Bug, RefreshCw, X } from "lucide-react"

export default function DebugPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const { songs, playlists, currentSong } = useMusicStore()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [importResult, setImportResult] = useState<any>(null)

  const handleManualImport = async () => {
    setIsLoading(true)
    setError(null)
    setImportResult(null)

    try {
      const response = await fetch("/api/spotify/import")
      const data = await response.json()

      if (response.ok) {
        setImportResult(data)
        // Refresh the page to load new data
        window.location.reload()
      } else {
        setError(data.error || "Failed to import music")
      }
    } catch (error) {
      setError("Error connecting to the server")
      console.error("Import error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTestMongoDB = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/debug/mongodb")
      const data = await response.json()

      if (response.ok) {
        setImportResult(data)
      } else {
        setError(data.error || "Failed to connect to MongoDB")
      }
    } catch (error) {
      setError("Error connecting to the server")
      console.error("MongoDB test error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-20 left-4 z-50 bg-zinc-800/80 backdrop-blur-sm"
        onClick={() => setIsOpen(true)}
      >
        <Bug className="h-4 w-4" />
      </Button>
    )
  }

  return (
    <Card className="fixed bottom-20 left-4 z-50 w-80 bg-zinc-900 border-zinc-700">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base">Debug Panel</CardTitle>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>Troubleshoot your music player</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div>
          <p className="font-medium">Library Status:</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Songs: {songs.length}</li>
            <li>Playlists: {playlists.length}</li>
            <li>Current Song: {currentSong ? currentSong.title : "None"}</li>
          </ul>
        </div>

        {error && (
          <div className="p-2 bg-red-900/30 border border-red-700 rounded text-red-200">
            <p className="font-medium">Error:</p>
            <p>{error}</p>
          </div>
        )}

        {importResult && (
          <div className="p-2 bg-green-900/30 border border-green-700 rounded text-green-200">
            <p className="font-medium">Result:</p>
            <pre className="text-xs overflow-auto max-h-20">{JSON.stringify(importResult, null, 2)}</pre>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex gap-2 pt-0">
        <Button variant="outline" size="sm" className="w-full gap-2" onClick={handleManualImport} disabled={isLoading}>
          <RefreshCw className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`} />
          Force Import
        </Button>
        <Button variant="outline" size="sm" className="w-full" onClick={handleTestMongoDB} disabled={isLoading}>
          Test MongoDB
        </Button>
      </CardFooter>
    </Card>
  )
}
