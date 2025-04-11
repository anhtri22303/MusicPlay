import { NextResponse } from "next/server"
import { getSpotifyFeaturedPlaylists, formatSpotifyPlaylist } from "@/lib/spotify"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    // Get featured playlists from Spotify
    const playlists = await getSpotifyFeaturedPlaylists(limit, offset)

    // Format playlists for our app
    const formattedPlaylists = playlists.map(formatSpotifyPlaylist)

    return NextResponse.json({
      success: true,
      playlists: formattedPlaylists,
    })
  } catch (error) {
    console.error("Error getting featured playlists:", error)

    // Return empty array instead of error to prevent UI from breaking
    return NextResponse.json({
      success: true,
      playlists: [],
      error: error instanceof Error ? error.message : String(error),
    })
  }
}
