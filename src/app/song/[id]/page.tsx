"use client";

import { useState, useRef, useEffect, useCallback, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Share } from "lucide-react";
import { parseLrcFile, LyricLine } from "../../../utils/lyricsParser";
import {
  extractColorsFromImage,
  generateBackgroundGradient,
  BackgroundGradient,
} from "../../../utils/colorExtractor";
import { getSongById } from "@/data/musicLibrary";
import { LyricsCard } from "@/components/LyricsCardGenerator";
import { useRouter } from "next/navigation";
import { Song, Album } from "@/data/musicLibrary";

export default function SongPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Next.js 15 feature to resolve params
  const resolvedParams = use(params);
  const [track, setTrack] = useState<Song>();
  const [album, setAlbum] = useState<Album>();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentLyricIndex, setCurrentLyricIndex] = useState(0);
  const [backgroundGradient, setBackgroundGradient] =
    useState<BackgroundGradient | null>(null);
  const [lyrics, setLyrics] = useState<LyricLine[]>([]);
  const [selectedLyrics, setSelectedLyrics] = useState<Set<number>>(new Set());
  const [showFullLyrics, setShowFullLyrics] = useState(false);
  const [showCardPreview, setShowCardPreview] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const router = useRouter();

  // Initialize song data
  useEffect(() => {
    const songData = getSongById(resolvedParams.id);
    if (songData) {
      setTrack(songData.song);
      setAlbum(songData.album);
    }
  }, [resolvedParams.id]);

  // Load lyrics
  useEffect(() => {
    if (!track) return;

    const loadLyrics = async () => {
      try {
        if (track.lyricsFile) {
          const response = await fetch(track.lyricsFile);
          const lrcContent = await response.text();
          const lyricsData = parseLrcFile(lrcContent);
          setLyrics(lyricsData);
        }
      } catch (error) {
        console.error("Failed to load lyrics:", error);
      }
    };

    loadLyrics();
  }, [track]);

  // Update current lyric
  const updateCurrentLyric = useCallback(
    (time: number) => {
      if (lyrics.length === 0) return;

      const index = lyrics.findIndex((lyric, i) => {
        const nextLyric = lyrics[i + 1];
        return time >= lyric.time && (!nextLyric || time < nextLyric.time);
      });
      if (index !== -1 && index !== currentLyricIndex) {
        setCurrentLyricIndex(index);
      }
    },
    [lyrics, currentLyricIndex]
  );

  useEffect(() => {
    if (audioRef.current) {
      const audio = audioRef.current;

      const handleTimeUpdate = () => {
        updateCurrentLyric(audio.currentTime);
      };

      const handlePlay = () => {
        setIsPlaying(true);
      };

      const handlePause = () => {
        setIsPlaying(false);
      };

      const handleEnded = () => {
        setIsPlaying(false);
      };

      const handleError = (e: Event) => {
        console.error("Audio error:", e);
      };

      // 添加事件监听器
      audio.addEventListener("timeupdate", handleTimeUpdate);
      audio.addEventListener("play", handlePlay);
      audio.addEventListener("pause", handlePause);
      audio.addEventListener("ended", handleEnded);

      // 清理函数
      return () => {
        audio.removeEventListener("timeupdate", handleTimeUpdate);
        audio.removeEventListener("play", handlePlay);
        audio.removeEventListener("pause", handlePause);
        audio.removeEventListener("ended", handleEnded);
        audio.removeEventListener("error", handleError);
      };
    }
  }, [updateCurrentLyric]);

  // 提取专辑封面颜色
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

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
  };

  // Lyrics selection function
  const toggleLyricSelection = (index: number) => {
    const newSelected = new Set(selectedLyrics);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedLyrics(newSelected);
  };

  const clearSelection = () => {
    setSelectedLyrics(new Set());
  };

  // Handle lyrics card preview
  const handleGenerateCard = () => {
    setShowCardPreview(true);
  };

  const handleClosePreview = () => {
    setShowCardPreview(false);
  };

  const handleSaveCard = () => {
    setShowCardPreview(false);
  };

  const handleSongBack = () => {
    if (showFullLyrics) {
      setShowFullLyrics(false);
    } else if (album) {
      router.push(`/album/${album.id}`);
    } else {
      router.push("/");
    }
  };

  if (!track) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 flex items-center justify-center">
        <div className="text-center text-black">
          <h1 className="text-2xl font-bold mb-4 ">Song not found</h1>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to music library
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col transition-all duration-1000 ease-in-out"
      style={{
        background: backgroundGradient?.style,
      }}
    >
      {/* Operation Buttons */}
      <div className="flex items-center justify-between">
        <div className="p-6 text-white" onClick={handleSongBack}>
          <ArrowLeft className="w-4 h-4" />
        </div>
        <div
          className="p-6 text-white cursor-pointer"
          onClick={() => setShowFullLyrics(true)}
        >
          <Share className="w-4 h-4" />
        </div>
      </div>

      {/* Hidden Audio Element */}
      <audio ref={audioRef} src={track?.audioFile} preload="metadata" />

      {showFullLyrics ? (
        // Full screen lyrics selection mode
        <div className="flex-1 flex flex-col">
          {/* Sticky top bar */}
          <div className="sticky top-0 z-10 backdrop-blur-sm p-6">
            {/* Top information bar */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <Image
                  src={album?.coverImage || "/default-cover.jpg"}
                  alt={`${album?.title} cover`}
                  width={60}
                  height={60}
                  className="rounded-lg shadow-lg"
                />
                <div>
                  <h1 className="text-lg font-bold text-white">
                    {track?.title}
                  </h1>
                  <p className="text-sm text-white/70">{track?.artist}</p>
                </div>
              </div>

              {/* Back button */}
              <div className="flex items-center justify-between">
                <div className="flex gap-3">
                  <button
                    onClick={clearSelection}
                    className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors backdrop-blur-sm text-sm"
                  >
                    Clear
                  </button>
                  {selectedLyrics.size > 0 && (
                    <button
                      onClick={handleGenerateCard}
                      className="px-6 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors backdrop-blur-sm text-sm"
                    >
                      Generate card ({selectedLyrics.size})
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Scrollable lyrics list */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              <div className="max-w-4xl mx-auto space-y-3">
                {lyrics.map((lyric, index) => (
                  <div
                    key={index}
                    className={`cursor-pointer p-4 rounded-xl transition-all duration-200 ${
                      selectedLyrics.has(index)
                        ? "bg-white/25 border-2 border-white/60 shadow-lg scale-[1.02]"
                        : "bg-white/10 hover:bg-white/15 border border-white/20"
                    }`}
                    onClick={() => toggleLyricSelection(index)}
                  >
                    <div className="flex items-center gap-4">
                      {/* Selection indicator */}
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          selectedLyrics.has(index)
                            ? "bg-white border-white"
                            : "border-white/50"
                        }`}
                      >
                        {selectedLyrics.has(index) && (
                          <svg
                            className="w-3 h-3 text-gray-800"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>

                      {/* Lyrics content */}
                      <div className="flex-1">
                        <p className="text-white text-base font-medium leading-relaxed">
                          {lyric.text}
                        </p>
                        {lyric.translation && (
                          <p className="text-white/60 text-sm mt-1">
                            {lyric.translation}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Default Play Mode
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full p-8 animate-fade-in-scale">
            {/* Album Cover */}
            <div className="flex justify-center mb-6">
              <div className="relative group" onClick={togglePlay}>
                <Image
                  src={album?.coverImage || ""}
                  alt={`${album?.title} cover`}
                  width={300}
                  height={300}
                  className="shadow-2xl cursor-pointer hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>

            {/* Info */}
            <div className="text-center mb-5 animate-slide-up-delay-2">
              <h1 className="text-2xl font-bold text-white">{track?.title}</h1>
              <p className="text-xl font-medium text-white/80 ">
                {track?.artist}
              </p>
            </div>

            {/* Lyrics */}
            <div className="text-center flex flex-col items-center justify-center animate-slide-up-delay-6">
              <div key={currentLyricIndex} className="lyrics-container">
                <p className="text-white text-xl font-semibold lyrics-text">
                  {lyrics.length > 0 && lyrics[currentLyricIndex]?.text
                    ? lyrics[currentLyricIndex].text
                    : ""}
                </p>
                <p className="text-white/70 text-lg font-bold lyrics-translation">
                  {lyrics.length > 0 && lyrics[currentLyricIndex]?.translation
                    ? lyrics[currentLyricIndex].translation
                    : ""}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lyrics Card Preview */}
      {showCardPreview && (
        <LyricsCard
          lyrics={lyrics}
          selectedIndices={selectedLyrics}
          songTitle={track?.title}
          artistName={track?.artist}
          coverImage={album?.coverImage}
          backgroundGradient={backgroundGradient}
          onClose={handleClosePreview}
          onSave={handleSaveCard}
        />
      )}
    </div>
  );
}
