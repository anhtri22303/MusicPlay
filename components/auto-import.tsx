"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

export default function AutoImport() {
  const [isImporting, setIsImporting] = useState(false)
  const [importComplete, setImportComplete] = useState(false)
  const [stats, setStats] = useState<{ importedTracks: number; importedPlaylists: number } | null>(null)

  // Function to import music from Spotify
  const importMusic = async () => {
    if (isImporting) return

    setIsImporting(true)

    try {
      const response = await fetch("/api/spotify/import")

      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
        setImportComplete(true)
      } else {
        console.error("Failed to import music")
      }
    } catch (error) {
      console.error("Error importing music:", error)
    } finally {
      setIsImporting(false)
    }
  }

  // Auto-import on component mount
  useEffect(() => {
    importMusic()
  }, [])

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isImporting ? (
        <Button disabled className="gap-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          Importing Music...
        </Button>
      ) : importComplete ? (
        <Button onClick={importMusic} variant="outline" className="gap-2 bg-zinc-800/80 backdrop-blur-sm">
          <RefreshCw className="h-4 w-4" />
          {stats ? `Imported ${stats.importedTracks} tracks` : "Update Music"}
        </Button>
      ) : (
        <Button onClick={importMusic} variant="outline" className="gap-2 bg-zinc-800/80 backdrop-blur-sm">
          <RefreshCw className="h-4 w-4" />
          Import Music
        </Button>
      )}
    </div>
  )
}
