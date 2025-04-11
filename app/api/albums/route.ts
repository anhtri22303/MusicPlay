import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import type { Album } from "@/lib/types"

export async function GET() {
  try {
    console.log("GET /api/albums: Attempting to fetch albums")

    // Connect to MongoDB
    const client = await clientPromise
    const db = client.db("musicapp")

    // Fetch albums from database
    const albums = await db.collection("albums").find({}).toArray()

    console.log(`GET /api/albums: Successfully fetched ${albums.length} albums`)

    // If no albums found, return empty array
    if (albums.length === 0) {
      console.log("GET /api/albums: No albums found, returning empty array")
      return NextResponse.json([])
    }

    return NextResponse.json(albums)
  } catch (error) {
    console.error("GET /api/albums: Error fetching albums:", error)
    return NextResponse.json([], { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate the album data
    if (!body.title || !body.artist) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("musicapp")

    // Check if album already exists
    const existingAlbum = await db.collection("albums").findOne({
      $or: [{ spotifyId: body.spotifyId }, { title: body.title, artist: body.artist }],
    })

    if (existingAlbum) {
      return NextResponse.json({ message: "Album already exists", album: existingAlbum }, { status: 200 })
    }

    // Create a new album document
    const newAlbum: Album = {
      id: `album_${Date.now()}`,
      title: body.title,
      artist: body.artist,
      releaseDate: body.releaseDate || "",
      coverUrl: body.coverUrl || "/placeholder.svg?height=400&width=400",
      songs: body.songs || [],
      spotifyId: body.spotifyId || null,
      spotifyUrl: body.spotifyUrl || null,
      source: body.source || "custom",
      createdAt: new Date(),
    }

    const result = await db.collection("albums").insertOne(newAlbum)

    return NextResponse.json({ ...newAlbum, _id: result.insertedId }, { status: 201 })
  } catch (error) {
    console.error("POST /api/albums: Error adding album:", error)
    return NextResponse.json({ error: "Failed to add album" }, { status: 500 })
  }
}
