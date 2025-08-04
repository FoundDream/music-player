export interface LyricLine {
  time: number;
  text: string;
  translation?: string;
}

export function parseLrcFile(lrcContent: string): LyricLine[] {
  const lines = lrcContent.split("\n");
  const lyrics: LyricLine[] = [];
  const timeMap = new Map<number, { text?: string; translation?: string }>();

  for (const line of lines) {
    // 匹配时间标签 [mm:ss.xxx]
    const timeMatch = line.match(/\[(\d{2}):(\d{2})\.(\d{3})\]/);
    if (!timeMatch) continue;

    const minutes = parseInt(timeMatch[1]);
    const seconds = parseInt(timeMatch[2]);
    const milliseconds = parseInt(timeMatch[3]);
    const time = minutes * 60 + seconds + milliseconds / 1000;

    // 提取歌词文本（移除时间标签）
    const text = line.replace(/\[.*?\]/g, "").trim();
    if (!text) continue;

    // 检查是否有中英文对照（用空格分隔）
    const parts = text.split(/\s{2,}/); // 两个或更多空格分隔
    if (parts.length >= 2) {
      // 一行内包含英文和中文
      lyrics.push({
        time,
        text: parts[0].trim(),
        translation: parts[1].trim(),
      });
    } else {
      // 处理分行的英中文对照
      if (!timeMap.has(time)) {
        timeMap.set(time, {});
      }

      const entry = timeMap.get(time)!;

      // 简单判断是否为中文（包含中文字符）
      const isChinese = /[\u4e00-\u9fff]/.test(text);

      if (isChinese) {
        entry.translation = text;
      } else {
        entry.text = text;
      }
    }
  }

  // 处理分行格式的歌词
  for (const [time, entry] of timeMap) {
    if (entry.text || entry.translation) {
      lyrics.push({
        time,
        text: entry.text || entry.translation || "",
        translation:
          entry.text && entry.translation ? entry.translation : undefined,
      });
    }
  }

  // 按时间排序
  return lyrics.sort((a, b) => a.time - b.time);
}

// 从文件内容解析Pretty Girl歌词
export async function getPrettyGirlLyrics(): Promise<LyricLine[]> {
  try {
    const response = await fetch("/Pretty-Girl-Clairo.lrc");
    const lrcContent = await response.text();
    console.log(lrcContent);
    return parseLrcFile(lrcContent);
  } catch (error) {
    console.error("Error loading lyrics file:", error);
    return [];
  }
}
