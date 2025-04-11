import { Home, Search, Library, PlusCircle, Music2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useMusicStore } from "@/lib/music-store"
import Link from "next/link"

export default function Sidebar() {
  const { playlists } = useMusicStore()

  return (
    <div className="w-64 border-r border-zinc-800 bg-zinc-900 flex flex-col h-full">
      <div className="p-6">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Music2 className="h-6 w-6 text-green-400" />
          <span>MusicApp</span>
        </h1>
      </div>

      <div className="px-3">
        <Link href="/">
          <Button variant="ghost" className="w-full justify-start gap-3 mb-1">
            <Home className="h-5 w-5" />
            <span>Home</span>
          </Button>
        </Link>
        <Button variant="ghost" className="w-full justify-start gap-3 mb-1">
          <Search className="h-5 w-5" />
          <span>Search</span>
        </Button>
        <Link href="/add-music">
          <Button variant="ghost" className="w-full justify-start gap-3 mb-1">
            <Plus className="h-5 w-5" />
            <span>Add Music</span>
          </Button>
        </Link>
      </div>

      <div className="mt-6 px-3">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" className="gap-2 p-2">
            <Library className="h-5 w-5" />
            <span>Your Library</span>
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <PlusCircle className="h-5 w-5" />
          </Button>
        </div>

        <ScrollArea className="h-[calc(100vh-280px)]">
          <div className="space-y-1 pr-2">
            {playlists.map((playlist) => (
              <Button
                key={playlist.id}
                variant="ghost"
                className="w-full justify-start font-normal text-zinc-400 hover:text-white"
              >
                {playlist.name}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
