"use client";

import { useState, useRef, useEffect, useCallback, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { parseLrcFile, LyricLine } from "../../../utils/lyricsParser";
import {
  extractColorsFromImage,
  generateBackgroundGradient,
  BackgroundGradient,
} from "../../../utils/colorExtractor";
import { getSongById } from "@/data/musicLibrary";

interface SongPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function SongPage({ params }: SongPageProps) {
  const resolvedParams = use(params);
  const [track, setTrack] = useState<any | null>(null);
  const [album, setAlbum] = useState<any | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentLyricIndex, setCurrentLyricIndex] = useState(0);
  const [backgroundGradient, setBackgroundGradient] =
    useState<BackgroundGradient | null>(null);
  const [lyrics, setLyrics] = useState<LyricLine[]>([]);

  const audioRef = useRef<HTMLAudioElement>(null);

  // 初始化歌曲数据
  useEffect(() => {
    const songData = getSongById(resolvedParams.id);
    if (songData) {
      setTrack(songData.song);
      setAlbum(songData.album);
    }
  }, [resolvedParams.id]);

  // 加载歌词
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

  // 更新当前歌词的函数
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

      // 简化的加载逻辑

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
      audio.addEventListener("error", handleError);

      // 设置超时，防止加载状态卡住

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

  if (!track) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">歌曲未找到</h1>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            返回音乐库
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col transition-all duration-1000 ease-in-out"
      style={{
        background:
          backgroundGradient?.style ||
          "linear-gradient(to br, #1e1b4b, #312e81, #3730a3)",
      }}
    >
      {/* 返回按钮 */}
      <div className="p-6">
        <Link
          href={album ? `/album/${album.id}` : "/"}
          className="inline-flex items-center gap-2 text-white"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
      </div>

      {/* 主要内容 */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full p-8 animate-fade-in-scale">
          {/* 隐藏的音频元素 */}
          <audio ref={audioRef} src={track?.audioFile} preload="metadata" />

          {/* 专辑封面 */}
          <div className="flex justify-center mb-6 animate-slide-up-delay-1">
            <div className="relative group" onClick={togglePlay}>
              <Image
                src={album?.coverImage || "/default-cover.jpg"}
                alt={`${album?.title} cover`}
                width={300}
                height={300}
                className="shadow-2xl cursor-pointer hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>

          {/* 歌曲信息 */}
          <div className="text-center mb-4 animate-slide-up-delay-2">
            <h1 className="text-2xl font-bold text-white">{track?.title}</h1>
            <p className="text-xl font-medium text-white/80 ">
              {track?.artist}
            </p>
          </div>

          {/* 动态歌词 */}
          <div className="text-center flex flex-col items-center justify-center animate-slide-up-delay-6">
            <div key={currentLyricIndex} className="lyrics-container">
              <p className="text-white text-xl font-bold lyrics-text">
                {lyrics.length > 0 && lyrics[currentLyricIndex]?.text
                  ? lyrics[currentLyricIndex].text
                  : track?.title}
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
    </div>
  );
}
