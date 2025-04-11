import { NextResponse } from "next/server"
import { getSpotifyPlaylistTracks, formatSpotifyTrack } from "@/lib/spotify"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const playlistId = params.id
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    // Get playlist tracks from Spotify
    const items = await getSpotifyPlaylistTracks(playlistId, limit, offset)

    // Format tracks for our app
    const formattedTracks = items
      .filter((item: any) => item.track) // Filter out null tracks
      .map((item: any) => formatSpotifyTrack(item.track))

    return NextResponse.json({
      success: true,
      tracks: formattedTracks,
    })
  } catch (error) {
    console.error("Error getting playlist tracks:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to get playlist tracks",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
