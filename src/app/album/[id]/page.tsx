"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getAlbumById } from "@/data/musicLibrary";
import {
  extractColorsFromImage,
  generateBackgroundGradient,
  BackgroundGradient,
} from "@/utils/colorExtractor";
import { ArrowLeft } from "lucide-react";

export default function AlbumPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const albumId = resolvedParams.id as string;

  const [backgroundGradient, setBackgroundGradient] =
    useState<BackgroundGradient | null>(null);

  const album = getAlbumById(albumId);

  // Extract background gradient from album cover image
  useEffect(() => {
    if (!album) return;

    const extractColors = async () => {
      try {
        const colors = await extractColorsFromImage(album.coverImage);
        const gradient = generateBackgroundGradient(colors);
        setBackgroundGradient(gradient);
      } catch (error) {
        console.error("Failed to extract colors:", error);
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
          <h1 className="text-2xl font-bold text-white mb-4">
            Album Not Found
          </h1>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 bg-white/20 text-white rounded-full cursor-pointer"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen pb-2"
      style={{
        background: backgroundGradient?.style,
      }}
    >
      {/* Back to Home */}
      <div className="p-6 top-6 left-6">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-white/80 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
      </div>

      <div className="px-20">
        {/* Album Info Header */}
        <div className="mb-8 flex gap-6">
          <Image
            src={album.coverImage}
            alt={album.title}
            width={200}
            height={200}
            className="shadow-lg"
          />
          <div className="flex flex-col justify-end">
            <div className="text-sm text-white/60 mb-2">Album</div>
            <h1 className="text-4xl font-bold text-white mb-2">
              {album.title}
            </h1>
            <div className="flex items-center gap-2 text-white/80">
              <span>{album.artist}</span>
              <span>•</span>
              <span>{album.year}</span>
              <span>•</span>
              <span>{album.songs.length} Songs</span>
            </div>
          </div>
        </div>

        {/* List */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-white mb-6">List</h3>
          <div className="space-y-2">
            {album.songs.map((song, index) => (
              <div
                key={song.id}
                className="group cursor-pointer p-4 hover:bg-white/10 transition-colors"
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
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
