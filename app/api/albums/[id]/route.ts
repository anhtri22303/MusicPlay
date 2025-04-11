import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

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

    return NextResponse.json({
      album,
      songs,
    })
  } catch (error) {
    console.error("Error fetching album:", error)
    return NextResponse.json({ error: "Failed to fetch album" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const albumId = params.id
    const body = await request.json()

    const client = await clientPromise
    const db = client.db("musicapp")

    // Find the album
    const album = await db.collection("albums").findOne({ id: albumId })

    if (!album) {
      return NextResponse.json({ error: "Album not found" }, { status: 404 })
    }

    // Update album
    const updatedAlbum = {
      ...album,
      ...body,
      id: albumId, // Ensure ID doesn't change
    }

    await db.collection("albums").updateOne({ id: albumId }, { $set: updatedAlbum })

    return NextResponse.json(updatedAlbum)
  } catch (error) {
    console.error("Error updating album:", error)
    return NextResponse.json({ error: "Failed to update album" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const albumId = params.id

    const client = await clientPromise
    const db = client.db("musicapp")

    // Find the album
    const album = await db.collection("albums").findOne({ id: albumId })

    if (!album) {
      return NextResponse.json({ error: "Album not found" }, { status: 404 })
    }

    // Delete album
    await db.collection("albums").deleteOne({ id: albumId })

    return NextResponse.json({ message: "Album deleted successfully" })
  } catch (error) {
    console.error("Error deleting album:", error)
    return NextResponse.json({ error: "Failed to delete album" }, { status: 500 })
  }
}
