"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { musicLibrary } from "@/data/musicLibrary";

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100">
      <div className="p-4 px-12">
        <div className="text-right mb-4">
          <div className="text-3xl font-bold text-black">08</div>
          <div className="text-black/60">/04</div>
          <div className="w-20 h-1 bg-black mt-2" />
        </div>
        {/* Music Albums */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Album</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {musicLibrary.map((album) => (
              <div key={album.id} className="group">
                <div
                  onClick={() => {
                    router.push(`/album/${album.id}`);
                  }}
                >
                  <Image
                    src={album.coverImage}
                    alt={album.title}
                    width={200}
                    height={200}
                    className="transition-transform duration-300 cursor-pointer"
                  />
                </div>
                <h3 className="font-semibold text-sm mt-2 text-gray-800">
                  {album.title}
                </h3>
                <p className="text-xs text-gray-600">{album.artist}</p>
                <p className="text-xs text-gray-500">
                  {album.year} • {album.songs.length} 首歌曲
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
