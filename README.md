# 🎵 音乐收藏播放器

一个优雅的音乐收藏网站，采用专辑模式管理音乐文件。具有现代化的界面设计、动态背景颜色、实时歌词显示和流畅的动画效果。

## ✨ 功能特性

- 📚 **专辑模式管理** - 按专辑组织音乐文件，支持专辑 → 歌曲的层级浏览
- 🎨 **动态背景颜色** - 自动提取专辑封面主色调，生成相应的渐变背景
- 🎵 **音频播放控制** - 播放/暂停、静音/取消静音
- 📊 **简洁进度条** - 清晰显示播放进度
- 🎤 **动态歌词显示** - 中英对照歌词，根据播放进度自动切换
- ⏱️ **时间显示** - 当前播放时间和总时长
- 🎭 **流畅动画** - 使用纯 CSS 实现的优雅动效
- 📱 **响应式设计** - 适配各种屏幕尺寸
- 🗂️ **智能导航** - 首页 → 专辑页 → 歌曲页的清晰导航路径

## 🚀 快速开始

### 环境要求

- Node.js 18+
- npm 或 yarn

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看效果。

### 构建生产版本

```bash
npm run build
npm start
```

## 📁 项目结构

```
music/
├── public/
│   └── albums/                     # 专辑目录
│       └── diary-001/              # 专辑ID目录
│           ├── cover.jpg           # 专辑封面
│           ├── pretty-girl.mp3     # 音频文件
│           └── pretty-girl.lrc     # 歌词文件
├── src/
│   ├── app/
│   │   ├── album/[id]/             # 专辑页面
│   │   │   └── page.tsx
│   │   ├── song/[id]/              # 歌曲页面
│   │   │   └── page.tsx
│   │   ├── globals.css             # 全局样式
│   │   ├── layout.tsx              # 布局组件
│   │   └── page.tsx                # 首页（专辑列表）
│   ├── data/
│   │   └── musicLibrary.ts         # 音乐数据管理
│   ├── components/                 # 组件目录
│   └── utils/
│       ├── lyricsParser.ts         # 歌词解析器
│       └── colorExtractor.ts       # 颜色提取工具
├── package.json
└── README.md
```

## 🎨 技术栈

- **Next.js 15** - React 框架
- **TypeScript** - 类型安全
- **Tailwind CSS** - 样式框架
- **CSS Animations** - 纯 CSS 动画
- **Lucide React** - 图标库
- **ColorThief** - 图片颜色提取
- **HTML5 Audio API** - 音频处理

## 🎵 添加新专辑

### 1. 创建专辑目录

```bash
mkdir -p public/albums/your-album-id
```

### 2. 添加文件

将以下文件放入专辑目录：

- `cover.jpg` - 专辑封面
- `song-name.mp3` - 音频文件
- `song-name.lrc` - 歌词文件（可选）

### 3. 更新数据配置

在 `src/data/musicLibrary.ts` 中添加新专辑：

```tsx
export const musicLibrary: Album[] = [
  // 现有专辑...
  {
    id: "your-album-id",
    title: "专辑名称",
    artist: "艺术家",
    coverImage: "/albums/your-album-id/cover.jpg",
    year: "2024",
    color: "bg-blue-400", // 可选的主题色
    songs: [
      {
        id: "song-id",
        title: "歌曲名称",
        artist: "艺术家",
        duration: "3:45",
        audioFile: "/albums/your-album-id/song-name.mp3",
        lyricsFile: "/albums/your-album-id/song-name.lrc", // 可选
      },
    ],
  },
];
```

### 修改歌词

#### 方法一：直接修改代码

在 `src/utils/lyricsParser.ts` 中更新 `getPrettyGirlLyrics()` 函数中的歌词内容。

#### 方法二：使用.lrc 文件

1. 将.lrc 文件放入 `public/` 目录
2. 在 `src/utils/lyricsParser.ts` 中添加新的解析函数：

```tsx
export function parseLrcFileFromUrl(url: string): Promise<LyricLine[]> {
  return fetch(url)
    .then((response) => response.text())
    .then((content) => parseLrcFile(content));
}
```

#### 歌词格式示例：

```lrc
[00:02.970]Polaroid of you dancing in my room  宝丽来照片里的你在我房间里跳舞
[00:10.850]I want to remember  我想记住什么
[00:17.150]I think it was about noon  或许是到了正午吧
```

### 调整背景颜色

背景颜色现在会自动从专辑封面提取！如需手动调整，可以修改 `src/utils/colorExtractor.ts` 中的颜色生成逻辑：

```tsx
// 生成背景渐变
export function generateBackgroundGradient(
  colors: ExtractedColors
): BackgroundGradient {
  const [r, g, b] = colors.dominant;
  const variations = generateColorVariations([r, g, b]);

  // 自定义渐变生成逻辑
  const from = `rgb(${variations.darker.join(", ")})`;
  const via = `rgb(${r}, ${g}, ${b})`;
  const to = `rgb(${variations.lighter.join(", ")})`;

  return {
    from,
    via,
    to,
    style: `linear-gradient(135deg, ${from} 0%, ${via} 50%, ${to} 100%)`,
  };
}
```

## 🎨 设计特色

### 颜色方案

- **智能配色**：自动从专辑封面提取主色调
- **动态渐变**：基于主色调生成深浅不同的渐变背景
- **文字适配**：根据背景亮度自动调整文字颜色
- **视觉和谐**：确保界面与专辑封面色彩协调统一

### 动画效果

- **页面入场动画**：缩放和淡入效果
- **分层延迟动画**：元素依次出现，营造层次感
- **按钮交互反馈**：悬停缩放和点击缩放效果
- **歌词切换动画**：平滑的淡入淡出过渡
- **进度条动画**：流畅的宽度变化效果

### 交互设计

- 专辑封面悬停缩放效果
- 按钮状态反馈
- 加载状态指示
- 流畅的进度条动画

## 🔧 开发说明

### 动态颜色提取

使用 ColorThief 库从专辑封面提取颜色：

- **颜色分析**：提取图片主色调和调色板
- **HSL 转换**：进行色彩空间转换以便调整
- **渐变生成**：基于主色调生成深浅渐变
- **平滑过渡**：1 秒的 CSS 过渡动画

### CSS 动画实现

使用纯 CSS 实现所有动画效果，提供流畅的用户体验：

- **关键帧动画**：`@keyframes` 定义动画序列
- **延迟动画**：使用 `animation-delay` 创建分层效果
- **过渡动画**：`transition` 实现状态变化的平滑过渡
- **性能优化**：使用 `transform` 和 `opacity` 确保硬件加速

### 进度条实现

使用简洁的进度条显示播放状态：

- 实时更新播放进度
- 流畅的动画效果
- 清晰的视觉反馈

### 音频控制

使用 HTML5 Audio API：

- 播放/暂停控制
- 音量控制
- 时间更新监听
- 错误处理

### 响应式设计

使用 Tailwind CSS 的响应式类：

- 移动端友好的布局
- 自适应字体大小
- 灵活的间距系统

## 📝 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

享受音乐！🎵
