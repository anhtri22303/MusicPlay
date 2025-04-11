import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { playlist, songs } = body

    if (!playlist) {
      return NextResponse.json({ error: "Playlist data is required" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("musicapp")

    // Check if playlist already exists
    const existingPlaylist = await db.collection("playlists").findOne({
      $or: [{ spotifyId: playlist.spotifyId }, { id: playlist.id }],
    })

    if (existingPlaylist) {
      return NextResponse.json({
        success: true,
        message: "Playlist already exists in database",
        playlist: existingPlaylist,
      })
    }

    // Add songs to database if provided
    if (songs && Array.isArray(songs) && songs.length > 0) {
      const songIds = []

      for (const song of songs) {
        // Check if song already exists
        const existingTrack = await db.collection("songs").findOne({
          $or: [{ spotifyId: song.spotifyId }, { id: song.id }],
        })

        if (existingTrack) {
          songIds.push(existingTrack.id)
        } else {
          // Add song to database
          const result = await db.collection("songs").insertOne(song)
          songIds.push(song.id)
        }
      }

      // Update playlist with song IDs
      playlist.songs = songIds
    }

    // Add playlist to database
    const result = await db.collection("playlists").insertOne(playlist)

    return NextResponse.json({
      success: true,
      message: "Playlist imported successfully",
      playlist: { ...playlist, _id: result.insertedId },
    })
  } catch (error) {
    console.error("Error importing playlist:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to import playlist",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
