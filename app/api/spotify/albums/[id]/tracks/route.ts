import { NextResponse } from "next/server"
import { getSpotifyAlbumTracks, getSpotifyTrack, formatSpotifyTrack } from "@/lib/spotify"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const albumId = params.id
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    // Get album tracks from Spotify
    const tracks = await getSpotifyAlbumTracks(albumId, limit, offset)

    // Get full track details for each track
    const fullTracks = await Promise.all(
      tracks.map(async (track: any) => {
        try {
          return await getSpotifyTrack(track.id)
        } catch (error) {
          console.error(`Error getting track ${track.id}:`, error)
          return track
        }
      }),
    )

    // Format tracks for our app
    const formattedTracks = fullTracks.map(formatSpotifyTrack)

    return NextResponse.json({
      success: true,
      tracks: formattedTracks,
    })
  } catch (error) {
    console.error("Error getting album tracks:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to get album tracks",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
