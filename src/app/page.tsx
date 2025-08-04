"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { getPrettyGirlLyrics, LyricLine } from "../utils/lyricsParser";
import {
  extractColorsFromImage,
  generateBackgroundGradient,
  BackgroundGradient,
} from "../utils/colorExtractor";

export default function Home() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [currentLyricIndex, setCurrentLyricIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [backgroundGradient, setBackgroundGradient] =
    useState<BackgroundGradient | null>(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [lyrics, setLyrics] = useState<LyricLine[]>([]);

  const audioRef = useRef<HTMLAudioElement>(null);

  // 加载歌词
  useEffect(() => {
    const loadLyrics = async () => {
      try {
        const lyricsData = await getPrettyGirlLyrics();
        console.log("Loaded lyrics:", lyricsData.length, "lines");
        setLyrics(lyricsData);
      } catch (error) {
        console.error("Failed to load lyrics:", error);
      }
    };

    loadLyrics();
  }, []);

  // 更新当前歌词的函数
  const updateCurrentLyric = useCallback(
    (time: number) => {
      if (lyrics.length === 0) return;

      const index = lyrics.findIndex((lyric, i) => {
        const nextLyric = lyrics[i + 1];
        return time >= lyric.time && (!nextLyric || time < nextLyric.time);
      });
      if (index !== -1 && index !== currentLyricIndex) {
        console.log("Updating lyric index:", index, "at time:", time);
        setCurrentLyricIndex(index);
      }
    },
    [lyrics, currentLyricIndex]
  );

  useEffect(() => {
    if (audioRef.current) {
      const audio = audioRef.current;

      // 简化的加载逻辑
      const handleLoadedMetadata = () => {
        setDuration(audio.duration);
        setIsLoading(false);
        console.log("Audio loaded, duration:", audio.duration);
      };

      const handleTimeUpdate = () => {
        setCurrentTime(audio.currentTime);
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
        setIsLoading(false);
      };

      // 添加事件监听器
      audio.addEventListener("loadedmetadata", handleLoadedMetadata);
      audio.addEventListener("timeupdate", handleTimeUpdate);
      audio.addEventListener("play", handlePlay);
      audio.addEventListener("pause", handlePause);
      audio.addEventListener("ended", handleEnded);
      audio.addEventListener("error", handleError);

      // 设置超时，防止加载状态卡住
      const timeout = setTimeout(() => {
        console.log("Audio loading timeout, forcing ready state");
        setIsLoading(false);
      }, 5000);

      // 清理函数
      return () => {
        clearTimeout(timeout);
        audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
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
    const extractColors = async () => {
      try {
        const colors = await extractColorsFromImage("/Diary_001_EP_cover.jpg");
        const gradient = generateBackgroundGradient(colors);
        setBackgroundGradient(gradient);
        setIsImageLoaded(true);
        console.log("Extracted colors:", colors.dominant);
        console.log("Generated gradient:", gradient);
      } catch (error) {
        console.error("Failed to extract colors:", error);
        setIsImageLoaded(true);
      }
    };

    extractColors();
  }, []);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 transition-all duration-1000 ease-in-out"
      style={{
        background: backgroundGradient?.style,
      }}
    >
      <div className="max-w-2xl w-full p-8 animate-fade-in-scale">
        {/* 隐藏的音频元素 */}
        <audio
          ref={audioRef}
          src="/Clairo - Pretty Girl.mp3"
          preload="metadata"
        />

        {/* 专辑封面 */}
        <div className="flex justify-center mb-2 animate-slide-up-delay-1">
          <div className="relative group" onClick={togglePlay}>
            <Image
              src="/Diary_001_EP_cover.jpg"
              alt="Diary 001 EP Cover"
              width={300}
              height={300}
              className="shadow-2xl"
            />
          </div>
        </div>

        {/* 专辑信息 */}
        <div className="text-center animate-slide-up-delay-2">
          <h1 className="text-lg font-bold text-white">Pretty Girl</h1>
          <p className="text-lg font-medium text-white">Clairo</p>
        </div>

        {/* 动态歌词 */}
        <div className="text-center min-h-[80px] flex flex-col items-center justify-center animate-slide-up-delay-6">
          <div key={currentLyricIndex} className="lyrics-container">
            <p className="text-white text-medium font-bold lyrics-text">
              {lyrics.length > 0 && lyrics[currentLyricIndex]?.text
                ? lyrics[currentLyricIndex].text
                : "Polaroid of you dancing in my room"}
            </p>
            <p className="text-white/70 text-lg font-bold lyrics-translation">
              {lyrics.length > 0 && lyrics[currentLyricIndex]?.translation
                ? lyrics[currentLyricIndex].translation
                : "宝丽来照片里的你在我房间里跳舞"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
