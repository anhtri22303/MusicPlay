import { NextResponse } from "next/server"
import { getSpotifyNewReleases, formatSpotifyAlbum } from "@/lib/spotify"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    // Get new releases from Spotify
    const albums = await getSpotifyNewReleases(limit, offset)

    // Format albums for our app
    const formattedAlbums = albums.map(formatSpotifyAlbum)

    return NextResponse.json({
      success: true,
      albums: formattedAlbums,
    })
  } catch (error) {
    console.error("Error getting new releases:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to get new releases",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
