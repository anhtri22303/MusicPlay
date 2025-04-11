import { NextResponse } from "next/server"
import { getSpotifyArtistTopTracks, formatSpotifyTrack } from "@/lib/spotify"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const artistId = params.id
    const { searchParams } = new URL(request.url)
    const market = searchParams.get("market") || "US"

    // Get artist top tracks from Spotify
    const tracks = await getSpotifyArtistTopTracks(artistId, market)

    // Format tracks for our app
    const formattedTracks = tracks.map(formatSpotifyTrack)

    return NextResponse.json({
      success: true,
      tracks: formattedTracks,
    })
  } catch (error) {
    console.error("Error getting artist top tracks:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to get artist top tracks",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
