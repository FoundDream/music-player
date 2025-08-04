"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { musicLibrary } from "@/data/musicLibrary";

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100">
      <div className="flex gap-6 p-6 px-12">
        {/* 左侧主要内容 */}
        <div className="flex-1">
          {/* 主要推荐区域 */}
          <div className="text-right mb-4">
            <div className="text-3xl font-bold text-black">08</div>
            <div className="text-black/60">/04</div>
            <div className="w-20 h-1 bg-black rounded-full mt-2">
              <div className="w-1/3 h-full bg-black/40 rounded-full"></div>
            </div>
          </div>
          {/* Music Albums */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Album</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {musicLibrary.map((album) => (
                <div key={album.id} className="group">
                  <div
                    className="relative overflow-hidden"
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
                    <div className="absolute"></div>
                  </div>
                  <h4 className="font-semibold text-sm mt-2 text-gray-800">
                    {album.title}
                  </h4>
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
    </div>
  );
}
