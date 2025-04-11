"use client"

import { useState, useEffect } from "react"
import MusicPlayer from "@/components/music-player"
import Sidebar from "@/components/sidebar"
import DebugPanel from "@/components/debug-panel"

export default function ClientPageWrapper() {
  const [isMounted, setIsMounted] = useState(false)

  // Ensure we only render on the client
  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  return (
    <>
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 overflow-hidden">
          <MusicPlayer />
        </div>
      </div>
      <DebugPanel />
    </>
  )
}
