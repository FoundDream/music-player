"use client";

import { useRef, useCallback, useState } from "react";
import { LyricLine } from "@/utils/lyricsParser";
import { BackgroundGradient } from "@/utils/colorExtractor";

interface LyricsCardProps {
  lyrics: LyricLine[];
  selectedIndices: Set<number>;
  songTitle: string;
  artistName: string;
  albumTitle: string;
  backgroundGradient: BackgroundGradient | null;
  onClose: () => void;
  onSave: () => void;
}

export function LyricsCard({
  lyrics,
  selectedIndices,
  songTitle,
  artistName,
  albumTitle,
  backgroundGradient,
  onClose,
  onSave,
}: LyricsCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // 获取选中的歌词
  const selectedLyrics = Array.from(selectedIndices)
    .sort((a, b) => a - b)
    .map((index) => lyrics[index])
    .filter(Boolean);

  const handleSave = useCallback(async () => {
    if (!cardRef.current) return;

    setIsGenerating(true);
    try {
      // 创建一个临时的、干净的卡片元素用于截图
      const tempCard = document.createElement("div");
      tempCard.style.position = "fixed";
      tempCard.style.top = "-9999px";
      tempCard.style.left = "-9999px";
      tempCard.style.width = "400px";
      tempCard.style.height = "500px";
      tempCard.style.backgroundColor =
        backgroundGradient?.from || "rgb(30, 27, 75)";
      tempCard.style.borderRadius = "12px";
      tempCard.style.overflow = "hidden";
      tempCard.style.fontFamily = "system-ui, -apple-system, sans-serif";

      // 创建内容
      tempCard.innerHTML = `
        <div style="position: absolute; inset: 0; background: rgba(0, 0, 0, 0.2);"></div>
        <div style="position: relative; height: 100%; display: flex; flex-direction: column; justify-content: space-between; padding: 32px; color: white;">
          <div style="text-align: center;">
            <h1 style="font-size: 24px; font-weight: bold; margin-bottom: 8px; line-height: 1.2; margin: 0 0 8px 0;">
              ${songTitle}
            </h1>
            <p style="color: rgba(255, 255, 255, 0.8); font-size: 14px; margin: 0;">
              ${artistName} • ${albumTitle}
            </p>
          </div>
          <div style="flex: 1; display: flex; align-items: center; justify-content: center;">
            <div style="text-align: center; max-width: 100%;">
              ${selectedLyrics
                .map(
                  (lyric, index) => `
                <div style="margin-bottom: ${
                  index < selectedLyrics.length - 1 ? "24px" : "0"
                };">
                  <p style="color: white; font-size: 16px; font-weight: 500; line-height: 1.5; margin: 0;">
                    ${lyric.text}
                  </p>
                  ${
                    lyric.translation
                      ? `
                    <p style="color: rgba(255, 255, 255, 0.7); font-size: 14px; margin: 4px 0 0 0;">
                      ${lyric.translation}
                    </p>
                  `
                      : ""
                  }
                </div>
              `
                )
                .join("")}
            </div>
          </div>
          <div style="text-align: center; font-size: 12px; color: rgba(255, 255, 255, 0.6);">
            <p style="margin: 0;">♪ 歌词卡片 ♪</p>
          </div>
        </div>
      `;

      document.body.appendChild(tempCard);

      // 动态导入html2canvas
      const html2canvas = (await import("html2canvas")).default;

      // 截图临时元素
      const canvas = await html2canvas(tempCard, {
        scale: 2,
        backgroundColor: backgroundGradient?.from || "rgb(30, 27, 75)",
        logging: false,
        useCORS: true,
        width: 400,
        height: 500,
      });

      // 清理临时元素
      document.body.removeChild(tempCard);

      // 创建下载链接
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png", 0.9);
      link.download = `${songTitle || "lyrics"}-card.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      onSave();
    } catch (error) {
      console.error("Failed to generate image:", error);
    } finally {
      setIsGenerating(false);
    }
  }, [
    songTitle,
    artistName,
    albumTitle,
    backgroundGradient,
    selectedLyrics,
    onSave,
  ]);

  if (selectedLyrics.length === 0) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* 预览标题 */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">
              歌词卡片预览
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* 卡片内容 */}
        <div className="p-4">
          <div
            ref={cardRef}
            className="w-full aspect-[4/5] rounded-xl overflow-hidden relative"
            style={{
              backgroundColor: backgroundGradient?.from || "rgb(30, 27, 75)",
            }}
          >
            {/* 背景遮罩 */}
            <div className="absolute inset-0 bg-black/20"></div>

            {/* 内容容器 */}
            <div className="relative h-full flex flex-col justify-between p-8">
              {/* 顶部歌曲信息 */}
              <div className="text-center text-white">
                <h1 className="text-2xl font-bold mb-2 leading-tight">
                  {songTitle}
                </h1>
                <p className="text-white/80 text-sm">
                  {artistName} • {albumTitle}
                </p>
              </div>

              {/* 歌词内容 */}
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center space-y-6 max-w-full">
                  {selectedLyrics.map((lyric, index) => (
                    <div key={index} className="space-y-2">
                      {lyric.text && (
                        <p className="text-white text-lg font-medium leading-relaxed">
                          {lyric.text}
                        </p>
                      )}
                      {lyric.translation && (
                        <p className="text-white/70 text-sm leading-relaxed">
                          {lyric.translation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 底部装饰 */}
              <div className="text-center">
                <div className="inline-flex items-center gap-2 text-white/50 text-xs">
                  <div className="w-2 h-2 bg-white/50 rounded-full"></div>
                  <span>Music Player</span>
                  <div className="w-2 h-2 bg-white/50 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              disabled={isGenerating}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? "生成中..." : "保存图片"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
