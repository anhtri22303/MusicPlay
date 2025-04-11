import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET(request: Request) {
  try {
    console.log("GET /api/songs: Attempting to fetch songs")
    const { searchParams } = new URL(request.url)
    const source = searchParams.get("source")

    // Connect to MongoDB
    const client = await clientPromise
    const db = client.db("musicapp")

    // Prepare query
    const query = source ? { source } : {}

    // Fetch songs from database
    const songs = await db.collection("songs").find(query).toArray()

    console.log(`GET /api/songs: Successfully fetched ${songs.length} songs`)

    // If no songs found, return sample songs
    if (songs.length === 0) {
      console.log("GET /api/songs: No songs found, returning sample songs")
      return NextResponse.json(getSampleSongs())
    }

    return NextResponse.json(songs)
  } catch (error) {
    console.error("GET /api/songs: Error fetching songs:", error)

    // Return sample songs on error
    console.log("GET /api/songs: Returning sample songs due to error")
    return NextResponse.json(getSampleSongs())
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate the song data
    if (!body.title || !body.artist || !body.audioUrl) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("musicapp")

    // Add duration if not provided
    if (!body.duration) {
      body.duration = 180 // Default 3 minutes
    }

    // Create a new song document
    const newSong = {
      id: Date.now().toString(),
      title: body.title,
      artist: body.artist,
      album: body.album || "",
      duration: body.duration,
      audioUrl: body.audioUrl,
      coverUrl: body.coverUrl || "/placeholder.svg?height=400&width=400",
      createdAt: new Date(),
    }

    const result = await db.collection("songs").insertOne(newSong)

    return NextResponse.json({ ...newSong, _id: result.insertedId }, { status: 201 })
  } catch (error) {
    console.error("POST /api/songs: Error adding song:", error)
    return NextResponse.json({ error: "Failed to add song" }, { status: 500 })
  }
}

// Sample songs to return when database is empty or errors occur
function getSampleSongs() {
  return [
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
}
