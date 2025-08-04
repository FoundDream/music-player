"use client";

import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import { getAlbumById } from "@/data/musicLibrary";

export default function AlbumPage() {
  const router = useRouter();
  const params = useParams();
  const albumId = params.id as string;

  const album = getAlbumById(albumId);

  if (!album) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">专辑未找到</h1>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100">
      <div className="flex gap-6 p-6 px-12">
        {/* 左侧主要内容 */}
        <div className="flex-1">
          {/* 返回按钮 */}
          <div className="mb-6">
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              {/* 返回专辑列表 */}
            </button>
          </div>

          {/* 专辑信息头部 */}
          <div className="mb-8 flex gap-6">
            <div className="flex-shrink-0">
              <Image
                src={album.coverImage}
                alt={album.title}
                width={200}
                height={200}
                className="rounded-lg shadow-lg"
              />
            </div>
            <div className="flex flex-col justify-end">
              <div className="text-sm text-gray-600 mb-2">专辑</div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                {album.title}
              </h1>
              <div className="flex items-center gap-4 text-gray-600">
                <span className="font-medium">{album.artist}</span>
                <span>•</span>
                <span>{album.year}</span>
                <span>•</span>
                <span>{album.songs.length} 首歌曲</span>
              </div>
            </div>
          </div>

          {/* 歌曲列表 */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-6">歌曲列表</h3>
            <div className="space-y-2">
              {album.songs.map((song, index) => (
                <div
                  key={song.id}
                  className="group cursor-pointer p-4 rounded-lg hover:bg-white/50 transition-colors"
                  onClick={() => {
                    router.push(`/song/${song.id}`);
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 text-center text-gray-500 group-hover:text-gray-800">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800 group-hover:text-black">
                        {song.title}
                      </div>
                      <div className="text-sm text-gray-600">{song.artist}</div>
                    </div>
                    <div className="text-sm text-gray-500">{song.duration}</div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg
                        className="w-5 h-5 text-gray-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
