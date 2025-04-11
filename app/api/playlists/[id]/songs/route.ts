import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const playlistId = params.id
    const { songId } = await request.json()

    if (!songId) {
      return NextResponse.json({ error: "Song ID is required" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("musicapp")

    // Find the playlist
    const playlist = await db.collection("playlists").findOne({ id: playlistId })

    if (!playlist) {
      return NextResponse.json({ error: "Playlist not found" }, { status: 404 })
    }

    // Check if song exists
    const song = await db.collection("songs").findOne({ id: songId })

    if (!song) {
      return NextResponse.json({ error: "Song not found" }, { status: 404 })
    }

    // Add song to playlist if not already there
    if (!playlist.songs.includes(songId)) {
      await db.collection("playlists").updateOne({ id: playlistId }, { $push: { songs: songId } })
    }

    // Get updated playlist
    const updatedPlaylist = await db.collection("playlists").findOne({ id: playlistId })

    return NextResponse.json(updatedPlaylist)
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to add song to playlist" }, { status: 500 })
  }
}
