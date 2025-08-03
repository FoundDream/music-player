"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { getPrettyGirlLyrics, LyricLine } from "../utils/lyricsParser";
import {
  extractColorsFromImage,
  generateBackgroundGradient,
  BackgroundGradient,
} from "../utils/colorExtractor";

// 歌词数据 - 使用解析器从.lrc文件获取
const lyrics: LyricLine[] = getPrettyGirlLyrics();

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

  const audioRef = useRef<HTMLAudioElement>(null);

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
  }, []);

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

  const updateCurrentLyric = (time: number) => {
    const index = lyrics.findIndex((lyric, i) => {
      const nextLyric = lyrics[i + 1];
      return time >= lyric.time && (!nextLyric || time < nextLyric.time);
    });
    if (index !== -1 && index !== currentLyricIndex) {
      setCurrentLyricIndex(index);
    }
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 transition-all duration-1000 ease-in-out"
      style={{
        background:
          backgroundGradient?.style ||
          "linear-gradient(135deg, rgb(88, 28, 135) 0%, rgb(157, 23, 77) 50%, rgb(67, 56, 202) 100%)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-2xl w-full bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl"
      >
        {/* 颜色加载指示器 */}
        {!isImageLoaded && (
          <div className="absolute top-4 right-4 text-white/60 text-sm">
            正在分析封面颜色...
          </div>
        )}

        {/* 隐藏的音频元素 */}
        <audio
          ref={audioRef}
          src="/Clairo - Pretty Girl.mp3"
          preload="metadata"
        />

        {/* 专辑封面 */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="flex justify-center mb-8"
        >
          <div className="relative group">
            <Image
              src="/Diary_001_EP_cover.jpg"
              alt="Diary 001 EP Cover"
              width={300}
              height={300}
              className="rounded-2xl shadow-2xl transition-transform duration-500 group-hover:scale-105"
            />
            <motion.div
              className="absolute inset-0 bg-black/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              whileHover={{ scale: 1.02 }}
            />
          </div>
        </motion.div>

        {/* 专辑信息 */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">Diary 001 EP</h1>
          <p className="text-white/80 text-lg mb-4">Clairo</p>
          <p className="text-white/60 text-sm">2018 • Indie Pop</p>
        </motion.div>

        {/* 进度条 */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mb-6"
        >
          {isLoading ? (
            <div className="w-full h-2 bg-white/10 rounded-full flex items-center justify-center">
              <div className="text-white/60 text-sm">正在加载音频...</div>
            </div>
          ) : (
            <div className="w-full bg-white/20 rounded-full h-2">
              <motion.div
                className="bg-white/80 h-2 rounded-full"
                style={{
                  width: `${
                    duration > 0 ? (currentTime / duration) * 100 : 0
                  }%`,
                }}
                transition={{ duration: 0.1 }}
              />
            </div>
          )}
        </motion.div>

        {/* 播放控制 */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="flex items-center justify-center gap-6 mb-8"
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={togglePlay}
            disabled={isLoading}
            className="w-16 h-16 bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed rounded-full flex items-center justify-center transition-colors duration-300"
          >
            {isPlaying ? (
              <Pause className="w-8 h-8 text-white" />
            ) : (
              <Play className="w-8 h-8 text-white ml-1" />
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleMute}
            disabled={isLoading}
            className="w-12 h-12 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed rounded-full flex items-center justify-center transition-colors duration-300"
          >
            {isMuted ? (
              <VolumeX className="w-6 h-6 text-white" />
            ) : (
              <Volume2 className="w-6 h-6 text-white" />
            )}
          </motion.button>
        </motion.div>

        {/* 时间显示 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.0, duration: 0.8 }}
          className="flex justify-between text-white/60 text-sm mb-8"
        >
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </motion.div>

        {/* 动态歌词 */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="text-center min-h-[80px] flex flex-col items-center justify-center"
        >
          <AnimatePresence mode="wait">
            <div key={currentLyricIndex}>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="text-white text-xl font-medium mb-2"
              >
                {lyrics[currentLyricIndex]?.text ||
                  "Polaroid of you dancing in my room"}
              </motion.p>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-white/70 text-lg"
              >
                {lyrics[currentLyricIndex]?.translation ||
                  "宝丽来照片里的你在我房间里跳舞"}
              </motion.p>
            </div>
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  );
}
