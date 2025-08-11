import type { Metadata } from 'next';
import { Geist, IBM_Plex_Mono, Noto_Sans_SC } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: '--font-ibm-plex-mono',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

// 中文支持字体（思源黑体简体）
const notoSansSC = Noto_Sans_SC({
  variable: '--font-noto-sans-sc',
  subsets: ['latin'],
  weight: ['400', '500', '700'],
});

export const metadata: Metadata = {
  title: 'Audiary',
  description: 'A music player for your favorite songs',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${ibmPlexMono.variable} ${geistSans.variable} ${notoSansSC.variable} antialiased h-full`}
      >
        {children}
      </body>
    </html>
  );
}
