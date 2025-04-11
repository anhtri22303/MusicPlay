import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const albumId = params.id
    const { songId } = await request.json()

    if (!songId) {
      return NextResponse.json({ error: "Song ID is required" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("musicapp")

    // Find the album
    const album = await db.collection("albums").findOne({ id: albumId })

    if (!album) {
      return NextResponse.json({ error: "Album not found" }, { status: 404 })
    }

    // Check if song exists
    const song = await db.collection("songs").findOne({ id: songId })

    if (!song) {
      return NextResponse.json({ error: "Song not found" }, { status: 404 })
    }

    // Add song to album if not already there
    if (!album.songs.includes(songId)) {
      await db.collection("albums").updateOne({ id: albumId }, { $push: { songs: songId } })
    }

    // Update song with albumId reference
    await db.collection("songs").updateOne({ id: songId }, { $set: { albumId: albumId } })

    // Get updated album
    const updatedAlbum = await db.collection("albums").findOne({ id: albumId })

    return NextResponse.json(updatedAlbum)
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to add song to album" }, { status: 500 })
  }
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const albumId = params.id

    const client = await clientPromise
    const db = client.db("musicapp")

    // Find the album
    const album = await db.collection("albums").findOne({ id: albumId })

    if (!album) {
      return NextResponse.json({ error: "Album not found" }, { status: 404 })
    }

    // Get all songs in the album
    const songs = await db
      .collection("songs")
      .find({
        $or: [{ albumId: albumId }, { id: { $in: album.songs || [] } }],
      })
      .toArray()

    return NextResponse.json(songs)
  } catch (error) {
    console.error("Error fetching album songs:", error)
    return NextResponse.json({ error: "Failed to fetch album songs" }, { status: 500 })
  }
}
