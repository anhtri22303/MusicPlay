"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Clock, Music, Plus, Check } from "lucide-react"
import { formatTime } from "@/lib/utils"

interface TrackListProps {
  tracks: any[]
  onAddTrack: (track: any) => Promise<boolean>
}

export default function TrackList({ tracks, onAddTrack }: TrackListProps) {
  const [addingTrackIds, setAddingTrackIds] = useState<string[]>([])
  const [addedTrackIds, setAddedTrackIds] = useState<string[]>([])

  const handleAddTrack = async (track: any) => {
    // Skip if already added or in progress
    if (addedTrackIds.includes(track.id) || addingTrackIds.includes(track.id)) {
      return
    }

    // Mark as adding
    setAddingTrackIds((prev) => [...prev, track.id])

    // Add track
    const success = await onAddTrack(track)

    // Update state
    setAddingTrackIds((prev) => prev.filter((id) => id !== track.id))
    if (success) {
      setAddedTrackIds((prev) => [...prev, track.id])
    }
  }

  return (
    <div className="space-y-1">
      <div className="grid grid-cols-[1fr_auto_auto] gap-4 px-4 py-2 text-zinc-400 text-sm border-b border-zinc-700">
        <div>TITLE</div>
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
        </div>
        <div></div>
      </div>

      <div className="divide-y divide-zinc-700/50">
        {tracks.map((track) => (
          <div
            key={track.id}
            className="grid grid-cols-[1fr_auto_auto] gap-4 px-4 py-3 items-center hover:bg-zinc-700/30 rounded-md"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-10 w-10 bg-zinc-700 rounded overflow-hidden flex-shrink-0">
                {track.coverUrl ? (
                  <img
                    src={track.coverUrl || "/placeholder.svg"}
                    alt={track.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Music className="h-5 w-5 text-zinc-500" />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <div className="font-medium truncate">{track.title}</div>
                <div className="text-sm text-zinc-400 truncate">{track.artist}</div>
              </div>
            </div>

            <div className="text-zinc-400">{formatTime(track.duration)}</div>

            <div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleAddTrack(track)}
                disabled={addingTrackIds.includes(track.id) || addedTrackIds.includes(track.id)}
                className={addedTrackIds.includes(track.id) ? "text-green-400" : ""}
              >
                {addingTrackIds.includes(track.id) ? (
                  <div className="h-4 w-4 border-2 border-t-transparent border-current rounded-full animate-spin"></div>
                ) : addedTrackIds.includes(track.id) ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
