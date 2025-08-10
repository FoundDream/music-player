"use client";

import { useRef, useCallback, useState, useEffect } from "react";
import { LyricLine } from "@/utils/lyricsParser";
import { BackgroundGradient } from "@/utils/colorExtractor";

interface LyricsCardProps {
  lyrics: LyricLine[];
  selectedIndices: Set<number>;
  songTitle: string;
  artistName: string;
  coverImage?: string;
  backgroundGradient: BackgroundGradient | null;
  onClose: () => void;
  onSave: () => void;
}

export function LyricsCard({
  lyrics,
  selectedIndices,
  songTitle,
  artistName,
  coverImage,
  backgroundGradient,
  onClose,
  onSave,
}: LyricsCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [coverImg, setCoverImg] = useState<HTMLImageElement | null>(null);

  // 获取选中的歌词
  const selectedLyrics = Array.from(selectedIndices)
    .sort((a, b) => a - b)
    .map((index) => lyrics[index])
    .filter(Boolean);

  const handleSave = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsGenerating(true);
    try {
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png", 1.0);
      link.download = `${songTitle || "lyrics"}-card.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      onSave();
    } catch (error) {
      console.error("Failed to export canvas:", error);
    } finally {
      setIsGenerating(false);
    }
  }, [songTitle, onSave]);

  // 加载封面图
  useEffect(() => {
    if (!coverImage) {
      setCoverImg(null);
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => setCoverImg(img);
    img.onerror = () => setCoverImg(null);
    img.src = coverImage;
  }, [coverImage]);

  // 画布绘制：所见即所得
  const drawCard = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 逻辑尺寸与 DPR 缩放（宽固定，高度根据内容自适应）
    const cssWidth = 400;
    const padding = 32;
    const avatarSize = 48;
    const gap = 12;
    const headerHeight = avatarSize + 24; // 头像高度 + 底部留白

    // 文本换行（先定义，供测量使用）
    const wrapText = (
      text: string,
      font: string,
      maxWidth: number
    ): string[] => {
      if (!text) return [];
      ctx.font = font;
      const tokens = text.match(/([A-Za-z0-9'’]+|\s+|[^A-Za-z0-9\s])/g) || [];
      const lines: string[] = [];
      let current = "";
      for (const tk of tokens) {
        const next = current + tk;
        const w = ctx.measureText(next).width;
        if (w <= maxWidth || current.length === 0) current = next;
        else {
          lines.push(current.trimEnd());
          current = tk.trimStart();
        }
      }
      if (current) lines.push(current.trimEnd());
      return lines;
    };

    // 先测量内容总高度，得到自适应高度
    const contentWMeasure = cssWidth - padding * 2 - 16; // 与绘制一致
    let lyricsHeight = 10; // 顶部内边距
    for (let i = 0; i < selectedLyrics.length; i++) {
      const lyric = selectedLyrics[i];
      const titleFont = "bold 32px IBM Plex Sans ";
      const titleLines = wrapText(lyric.text || "", titleFont, contentWMeasure);
      lyricsHeight += titleLines.length * 32 * 1.3;
      if (lyric.translation) {
        const subFont = "18px IBM Plex Sans";
        const subLines = wrapText(lyric.translation, subFont, contentWMeasure);
        lyricsHeight += subLines.length * 18 * 1.4;
      }
      if (i < selectedLyrics.length - 1) lyricsHeight += 14;
    }
    const footerHeight = 28; // 版权区域大致高度
    const estimatedHeight =
      padding + headerHeight + 24 + lyricsHeight + padding + footerHeight;
    const minCssHeight = 360;
    const maxCssHeight = Math.min(900, Math.floor(window.innerHeight * 0.85));
    const cssHeight = Math.max(
      minCssHeight,
      Math.min(maxCssHeight, Math.ceil(estimatedHeight))
    );

    const dpr = Math.max(1, Math.min(3, window.devicePixelRatio || 1));
    canvas.width = Math.floor(cssWidth * dpr);
    canvas.height = Math.floor(cssHeight * dpr);
    canvas.style.width = `${cssWidth}px`;
    canvas.style.height = `${cssHeight}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // 清屏
    ctx.clearRect(0, 0, cssWidth, cssHeight);

    // 背景圆角卡片
    const radius = 0;
    const drawRoundedRect = (
      x: number,
      y: number,
      w: number,
      h: number,
      r: number
    ) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    };

    // 先直接填充圆角背景，再建立同样的裁剪路径，避免边缘出现细白边
    drawRoundedRect(0, 0, cssWidth, cssHeight, radius);
    const pickColor = () => {
      const via = backgroundGradient?.via; // e.g. "rgb(210, 180, 120)"
      if (via && via.startsWith("rgb")) return via;
      return "#C19A5B"; // fallback
    };
    ctx.fillStyle = pickColor();
    ctx.fill();
    // 使用同样路径作为裁剪区域
    ctx.save();
    drawRoundedRect(0, 0, cssWidth, cssHeight, radius);
    ctx.clip();

    const contentX = padding;
    const contentY = padding;
    const contentW = cssWidth - padding * 2;
    const contentH = cssHeight - padding * 2;

    // 顶部信息区
    // 封面图或首字母占位
    if (coverImg) {
      const r = 0;
      drawRoundedRect(contentX, contentY, avatarSize, avatarSize, r);
      ctx.save();
      ctx.clip();
      const iw = coverImg.width;
      const ih = coverImg.height;
      const scale = Math.max(avatarSize / iw, avatarSize / ih);
      const dw = iw * scale;
      const dh = ih * scale;
      const dx = contentX + (avatarSize - dw) / 2;
      const dy = contentY + (avatarSize - dh) / 2;
      ctx.drawImage(coverImg, dx, dy, dw, dh);
      ctx.restore();
    }

    // 标题与作者
    const textLeft = contentX + avatarSize + gap;
    const titleY = contentY + 8;
    ctx.textAlign = "left";
    ctx.fillStyle = "#fff";
    ctx.font = "bold 22px IBM Plex Sans Noto Sans SC";
    ctx.fillText(songTitle || "", textLeft, titleY + 14);
    ctx.fillStyle = "#fff";
    ctx.font = "16px IBM Plex Sans Noto Sans SC";
    ctx.fillText(artistName || "", textLeft, titleY + 14 + 18);

    // 中间歌词区
    const startY = contentY + headerHeight; // 顶部信息下方空隙
    const maxTextWidth = contentW - 16; // 左右再留点边距

    // 选中歌词渲染
    let y = startY + 10; // 顶部内边距
    for (let i = 0; i < selectedLyrics.length; i++) {
      const lyric = selectedLyrics[i];
      // 主文本
      ctx.fillStyle = "#fff";
      const titleFont = "bold 32px IBM Plex Sans Noto Sans SC";
      const titleLines = wrapText(lyric.text || "", titleFont, maxTextWidth);
      ctx.font = titleFont;
      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";
      for (const line of titleLines) {
        ctx.fillText(line, contentX, y + 32);
        y += 32 * 1.3; // 行高
      }
      // 翻译文本
      // if (lyric.translation) {
      //   const subFont = "18px IBM Plex Sans";
      //   ctx.fillStyle = "#fff";
      //   const subLines = wrapText(lyric.translation, subFont, maxTextWidth);
      //   ctx.font = subFont;
      //   ctx.textAlign = "left";
      //   for (const line of subLines) {
      //     ctx.fillText(line, contentX + 8, y + 18);
      //     y += 18 * 1.4;
      //   }
      // }
      // 段落间距
      if (i < selectedLyrics.length - 1) y += 14;
    }
    // 底部版权信息
    ctx.fillStyle = "#fff";
    ctx.font = "bold 16px IBM Plex Sans Noto Sans SC";
    ctx.textAlign = "left";
    ctx.fillText("@Audiary", contentX, contentH + 20);
  }, [artistName, songTitle, selectedLyrics, backgroundGradient, coverImg]);

  // 渲染生命周期：依赖变更时重绘，初次也会绘制
  useEffect(() => {
    drawCard();
  }, [drawCard]);

  if (selectedLyrics.length === 0) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="max-w-[400px] w-full max-h-[90vh] overflow-y-auto">
        {/* 卡片内容：Canvas 所见即所得 */}
        <div className="flex justify-center items-center">
          <canvas
            ref={canvasRef}
            className="block"
            style={{ width: 400, height: 500 }}
            aria-label="lyrics-card-canvas"
          />
        </div>

        {/* 操作按钮 */}
        <div className="p-4 bg-white">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-white px-4 text-black-600 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isGenerating}
              className="flex-1 px-4 py-2 text-white cursor-pointer"
              style={{
                backgroundColor: isGenerating
                  ? "#ccc"
                  : backgroundGradient?.via,
              }}
            >
              {isGenerating ? "Generating..." : "Save image"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
