import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { songs } = body

    if (!songs || !Array.isArray(songs) || songs.length === 0) {
      return NextResponse.json({ error: "Songs array is required" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("musicapp")

    // Track stats
    let added = 0
    let skipped = 0

    // Process each song
    for (const song of songs) {
      // Check if song already exists
      const existingTrack = await db.collection("songs").findOne({
        $or: [{ spotifyId: song.spotifyId }, { id: song.id }],
      })

      if (existingTrack) {
        skipped++
        continue
      }

      // Add song to database
      await db.collection("songs").insertOne(song)
      added++
    }

    return NextResponse.json({
      success: true,
      message: `Imported ${added} songs (${skipped} skipped)`,
      stats: {
        added,
        skipped,
        total: songs.length,
      },
    })
  } catch (error) {
    console.error("Error importing songs:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to import songs",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
