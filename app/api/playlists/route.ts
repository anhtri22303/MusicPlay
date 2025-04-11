import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET() {
  try {
    console.log("GET /api/playlists: Attempting to fetch playlists")

    // Connect to MongoDB
    const client = await clientPromise
    const db = client.db("musicapp")

    // Fetch playlists from database
    const playlists = await db.collection("playlists").find({}).toArray()

    console.log(`GET /api/playlists: Successfully fetched ${playlists.length} playlists`)

    // If no playlists found, return sample playlists
    if (playlists.length === 0) {
      console.log("GET /api/playlists: No playlists found, returning sample playlists")
      return NextResponse.json(getSamplePlaylists())
    }

    return NextResponse.json(playlists)
  } catch (error) {
    console.error("GET /api/playlists: Error fetching playlists:", error)

    // Return sample playlists on error
    console.log("GET /api/playlists: Returning sample playlists due to error")
    return NextResponse.json(getSamplePlaylists())
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate the playlist data
    if (!body.name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("musicapp")

    // Create a new playlist document
    const newPlaylist = {
      id: "p" + Date.now().toString(),
      name: body.name,
      coverUrl: body.coverUrl || "/placeholder.svg?height=400&width=400",
      songs: [],
      createdAt: new Date(),
    }

    const result = await db.collection("playlists").insertOne(newPlaylist)

    return NextResponse.json({ ...newPlaylist, _id: result.insertedId }, { status: 201 })
  } catch (error) {
    console.error("POST /api/playlists: Error adding playlist:", error)
    return NextResponse.json({ error: "Failed to add playlist" }, { status: 500 })
  }
}

// Sample playlists to return when database is empty or errors occur
function getSamplePlaylists() {
  return [
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
}
