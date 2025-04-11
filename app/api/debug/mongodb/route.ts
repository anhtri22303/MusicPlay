import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET() {
  try {
    // Test MongoDB connection
    const client = await clientPromise
    const db = client.db("musicapp")

    // Get collection stats
    const songCount = await db.collection("songs").countDocuments()
    const playlistCount = await db.collection("playlists").countDocuments()

    // Get a sample song if available
    const sampleSong = songCount > 0 ? await db.collection("songs").findOne({}) : null

    return NextResponse.json({
      success: true,
      message: "MongoDB connection successful",
      stats: {
        songCount,
        playlistCount,
      },
      sampleSong: sampleSong ? { id: sampleSong.id, title: sampleSong.title } : null,
    })
  } catch (error) {
    console.error("MongoDB connection error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to connect to MongoDB",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
