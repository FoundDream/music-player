export interface LyricLine {
  time: number;
  text: string;
  translation?: string;
}

export function parseLrcFile(lrcContent: string): LyricLine[] {
  const lines = lrcContent.split('\n');
  const lyrics: LyricLine[] = [];
  
  for (const line of lines) {
    // 匹配时间标签 [mm:ss.xxx]
    const timeMatch = line.match(/\[(\d{2}):(\d{2})\.(\d{3})\]/);
    if (!timeMatch) continue;
    
    const minutes = parseInt(timeMatch[1]);
    const seconds = parseInt(timeMatch[2]);
    const milliseconds = parseInt(timeMatch[3]);
    const time = minutes * 60 + seconds + milliseconds / 1000;
    
    // 提取歌词文本（移除时间标签）
    const text = line.replace(/\[.*?\]/g, '').trim();
    if (!text) continue;
    
    // 检查是否有中英文对照（用空格分隔）
    const parts = text.split(/\s{2,}/); // 两个或更多空格分隔
    if (parts.length >= 2) {
      lyrics.push({
        time,
        text: parts[0].trim(),
        translation: parts[1].trim()
      });
    } else {
      lyrics.push({
        time,
        text: text
      });
    }
  }
  
  // 按时间排序
  return lyrics.sort((a, b) => a.time - b.time);
}

// 从文件内容解析Pretty Girl歌词
export function getPrettyGirlLyrics(): LyricLine[] {
  const lrcContent = `[00:00.000]作词 : Clairo
[00:01.000]作曲 : Clairo
[00:02.970]Polaroid of you dancing in my room  宝丽来照片里的你在我房间里跳舞
[00:10.850]I want to remember  我想记住什么
[00:17.150]I think it was about noon  或许是到了正午吧
[00:19.310]It's getting harder to understand, to understand  越来越难以猜透
[00:28.090]How you felt in my hands (in my hands)  你牵我手时的感受
[00:35.800]I could be a pretty girl  或许我会变成漂亮的女生
[00:40.210]I'll wear a skirt for you  为了你穿上裙子
[00:44.300]I could be a pretty girl  或许我会变成漂亮的女生
[00:48.700]Shut up when you want me too  但你别指望你想要我就得听你的
[00:52.640]I could be a pretty girl  或许我会变成漂亮的女生
[00:56.970]Won't ever make you blue  永远不会让你感到忧郁
[01:01.390]I could be a pretty girl  或许我会变成漂亮的女生
[01:05.420]I'll lose myself in you  我会因你迷失自己
[01:09.700]I was so blinded by you, now I cry  我被你耍得团团转 现在我好想哭T-T
[01:20.400]Just thinking 'bout the fool that I was  想想我怎么那么傻白甜
[01:25.910]I was such a fool!  我真是个大傻比！
[01:28.170]I'm alone now but it's better for me  可能现在我一个人对我来说还更好吧
[01:35.250]I don't need all your negativity  我才不想你丧到我
[01:44.650]I could be a pretty girl  或许我会变成漂亮的女生
[01:48.370]I'll wear a skirt for you  我只能为你穿条裙子
[01:53.200]I could be a pretty girl  或许我会变成漂亮的女生
[01:56.870]Shut up when you want me too  但你别指望你想要我就得听你的（白眼
[02:01.690]I could be a pretty girl  或许我会变成漂亮的女生
[02:05.390]Won't ever make you blue  永远不会让你感到忧郁
[02:10.160]I could be a pretty girl  或许我会变成漂亮的女生
[02:14.000]I'll lose myself in you  我会因为你迷失自己`;

  return parseLrcFile(lrcContent);
} 