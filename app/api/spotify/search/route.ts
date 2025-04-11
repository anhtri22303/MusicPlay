import { NextResponse } from "next/server"
import { searchSpotifyTracks, formatSpotifyTrack } from "@/lib/spotify"
import clientPromise from "@/lib/mongodb"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")
    const limit = Number.parseInt(searchParams.get("limit") || "20")

    if (!query) {
      return NextResponse.json({ error: "Query parameter 'q' is required" }, { status: 400 })
    }

    // Search tracks on Spotify
    const tracks = await searchSpotifyTracks(query, limit)

    // Format tracks for our app
    const formattedTracks = tracks.map(formatSpotifyTrack)

    return NextResponse.json({
      success: true,
      tracks: formattedTracks,
    })
  } catch (error) {
    console.error("Error searching Spotify:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to search Spotify",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { track } = body

    if (!track) {
      return NextResponse.json({ error: "Track data is required" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("musicapp")

    // Check if track already exists
    const existingTrack = await db.collection("songs").findOne({ spotifyId: track.spotifyId })

    if (existingTrack) {
      return NextResponse.json({
        success: true,
        message: "Track already exists in database",
        track: existingTrack,
      })
    }

    // Add track to database
    const result = await db.collection("songs").insertOne(track)

    return NextResponse.json({
      success: true,
      message: "Track added to database",
      track: { ...track, _id: result.insertedId },
    })
  } catch (error) {
    console.error("Error adding track:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to add track to database",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
