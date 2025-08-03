import ColorThief from "colorthief";

export interface ExtractedColors {
  dominant: [number, number, number];
  palette: [number, number, number][];
}

export interface BackgroundGradient {
  from: string;
  via: string;
  to: string;
  style: string;
}

// RGB转HSL
function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h: number, s: number, l: number;

  l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
      default:
        h = 0;
    }
    h /= 6;
  }

  return [h * 360, s * 100, l * 100];
}

// HSL转RGB
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h /= 360;
  s /= 100;
  l /= 100;

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  if (s === 0) {
    return [l * 255, l * 255, l * 255];
  }

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  const r = hue2rgb(p, q, h + 1 / 3);
  const g = hue2rgb(p, q, h);
  const b = hue2rgb(p, q, h - 1 / 3);

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

// 生成互补色和类似色
function generateColorVariations(rgb: [number, number, number]): {
  darker: [number, number, number];
  lighter: [number, number, number];
  complementary: [number, number, number];
} {
  const [h, s, l] = rgbToHsl(rgb[0], rgb[1], rgb[2]);

  // 生成更深的颜色
  const darker = hslToRgb(h, Math.min(s + 10, 100), Math.max(l - 20, 10));

  // 生成更浅的颜色
  const lighter = hslToRgb(h, Math.max(s - 10, 0), Math.min(l + 15, 85));

  // 生成互补色
  const complementaryHue = (h + 180) % 360;
  const complementary = hslToRgb(complementaryHue, s, l);

  return { darker, lighter, complementary };
}

// 从图片提取颜色
export async function extractColorsFromImage(
  imageSrc: string
): Promise<ExtractedColors> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      try {
        const colorThief = new ColorThief();
        const dominant = colorThief.getColor(img);
        const palette = colorThief.getPalette(img, 5);

        resolve({
          dominant,
          palette,
        });
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error("Failed to load image"));
    };

    img.src = imageSrc;
  });
}

// 生成背景渐变
export function generateBackgroundGradient(
  colors: ExtractedColors
): BackgroundGradient {
  const [r, g, b] = colors.dominant;
  const variations = generateColorVariations([r, g, b]);

  // 使用主色调和其变化生成渐变
  const from = `rgb(${variations.darker.join(", ")})`;
  const via = `rgb(${r}, ${g}, ${b})`;
  const to = `rgb(${variations.lighter.join(", ")})`;

  // 生成CSS渐变字符串
  const style = `linear-gradient(135deg, ${from} 0%, ${via} 50%, ${to} 100%)`;

  return {
    from,
    via,
    to,
    style,
  };
}

// 生成Tailwind CSS类名
export function generateTailwindGradient(colors: ExtractedColors): string {
  const [r, g, b] = colors.dominant;
  const [h, s, l] = rgbToHsl(r, g, b);

  // 根据色相判断颜色类型
  let colorName = "purple";
  if (h >= 0 && h < 30) colorName = "red";
  else if (h >= 30 && h < 60) colorName = "orange";
  else if (h >= 60 && h < 120) colorName = "green";
  else if (h >= 120 && h < 180) colorName = "emerald";
  else if (h >= 180 && h < 240) colorName = "blue";
  else if (h >= 240 && h < 300) colorName = "purple";
  else if (h >= 300 && h < 360) colorName = "pink";

  // 根据亮度选择深浅
  const lightness = l < 30 ? "900" : l < 50 ? "800" : l < 70 ? "700" : "600";
  const midTone = l < 30 ? "800" : l < 50 ? "700" : l < 70 ? "600" : "500";
  const highlight = l < 30 ? "700" : l < 50 ? "600" : l < 70 ? "500" : "400";

  return `bg-gradient-to-br from-${colorName}-${lightness} via-${colorName}-${midTone} to-${colorName}-${highlight}`;
}

// 判断文字颜色（基于背景亮度）
export function getTextColor(rgb: [number, number, number]): "white" | "black" {
  const [r, g, b] = rgb;
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "black" : "white";
}
