import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

// Sample songs data
const sampleSongs = [
  {
    id: "1",
    title: "Blinding Lights",
    artist: "The Weeknd",
    album: "After Hours",
    duration: 203,
    audioUrl: "https://storage.googleapis.com/media-session/elephants-dream/the-wires.mp3",
    coverUrl: "/placeholder.svg?height=400&width=400",
  },
  {
    id: "2",
    title: "Dance Monkey",
    artist: "Tones and I",
    album: "The Kids Are Coming",
    duration: 210,
    audioUrl: "https://storage.googleapis.com/media-session/elephants-dream/the-wires.mp3",
    coverUrl: "/placeholder.svg?height=400&width=400",
  },
  {
    id: "3",
    title: "Watermelon Sugar",
    artist: "Harry Styles",
    album: "Fine Line",
    duration: 174,
    audioUrl: "https://storage.googleapis.com/media-session/elephants-dream/the-wires.mp3",
    coverUrl: "/placeholder.svg?height=400&width=400",
  },
  {
    id: "4",
    title: "Don't Start Now",
    artist: "Dua Lipa",
    album: "Future Nostalgia",
    duration: 183,
    audioUrl: "https://storage.googleapis.com/media-session/elephants-dream/the-wires.mp3",
    coverUrl: "/placeholder.svg?height=400&width=400",
  },
  {
    id: "5",
    title: "Circles",
    artist: "Post Malone",
    album: "Hollywood's Bleeding",
    duration: 215,
    audioUrl: "https://storage.googleapis.com/media-session/elephants-dream/the-wires.mp3",
    coverUrl: "/placeholder.svg?height=400&width=400",
  },
]

// Sample playlists data
const samplePlaylists = [
  {
    id: "p1",
    name: "Chill Vibes",
    coverUrl: "/placeholder.svg?height=400&width=400",
    songs: ["1", "3", "5"],
  },
  {
    id: "p2",
    name: "Workout Mix",
    coverUrl: "/placeholder.svg?height=400&width=400",
    songs: ["2", "4"],
  },
  {
    id: "p3",
    name: "Study Focus",
    coverUrl: "/placeholder.svg?height=400&width=400",
    songs: ["3", "5"],
  },
]

export async function GET() {
  try {
    console.log("Starting database seed...")
    const client = await clientPromise
    const db = client.db("musicapp")

    // Clear existing data
    await db.collection("songs").deleteMany({})
    await db.collection("playlists").deleteMany({})

    console.log("Existing data cleared")

    // Insert sample data
    await db.collection("songs").insertMany(sampleSongs)
    await db.collection("playlists").insertMany(samplePlaylists)

    console.log("Sample data inserted")

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully",
      songsCount: sampleSongs.length,
      playlistsCount: samplePlaylists.length,
    })
  } catch (error) {
    console.error("Database seeding error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to seed database",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
