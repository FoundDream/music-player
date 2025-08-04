"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import { getAlbumById } from "@/data/musicLibrary";
import {
  extractColorsFromImage,
  generateBackgroundGradient,
  BackgroundGradient,
} from "@/utils/colorExtractor";

export default function AlbumPage() {
  const router = useRouter();
  const params = useParams();
  const albumId = params.id as string;

  const [backgroundGradient, setBackgroundGradient] =
    useState<BackgroundGradient | null>(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const album = getAlbumById(albumId);

  // 提取专辑封面颜色
  useEffect(() => {
    if (!album) return;

    const extractColors = async () => {
      try {
        const colors = await extractColorsFromImage(album.coverImage);
        const gradient = generateBackgroundGradient(colors);
        setBackgroundGradient(gradient);
        setIsImageLoaded(true);
      } catch (error) {
        console.error("Failed to extract colors:", error);
        setIsImageLoaded(true);
      }
    };

    extractColors();
  }, [album]);

  if (!album) {
    return (
      <div
        className="min-h-screen flex items-center justify-center transition-all duration-1000 ease-in-out"
        style={{
          background:
            backgroundGradient?.style ||
            "linear-gradient(to br, #fefce8, #fef3c7)",
        }}
      >
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">专辑未找到</h1>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 bg-white/20 text-white rounded-full hover:bg-white/30 transition-colors backdrop-blur-sm"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen transition-all duration-1000 ease-in-out"
      style={{
        background:
          backgroundGradient?.style ||
          "linear-gradient(to br, #fefce8, #fef3c7)",
      }}
    >
      <div className="flex gap-6 p-6 px-12">
        {/* 左侧主要内容 */}
        <div className="flex-1">
          {/* 返回按钮 */}
          <div className="mb-6">
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
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
              <div className="text-sm text-white/60 mb-2">专辑</div>
              <h1 className="text-4xl font-bold text-white mb-2">
                {album.title}
              </h1>
              <div className="flex items-center gap-4 text-white/80">
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
            <h3 className="text-xl font-bold text-white mb-6">歌曲列表</h3>
            <div className="space-y-2">
              {album.songs.map((song, index) => (
                <div
                  key={song.id}
                  className="group cursor-pointer p-4 rounded-lg hover:bg-white/20 transition-colors"
                  onClick={() => {
                    router.push(`/song/${song.id}`);
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 text-center text-white/60 group-hover:text-white">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-white group-hover:text-white">
                        {song.title}
                      </div>
                      <div className="text-sm text-white/70">{song.artist}</div>
                    </div>
                    <div className="text-sm text-white/60">{song.duration}</div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg
                        className="w-5 h-5 text-white/80"
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
