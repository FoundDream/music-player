export interface Song {
  id: string;
  title: string;
  artist: string;
  duration: string;
  audioFile: string;
  lyricsFile?: string;
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  coverImage: string;
  year: string;
  color: string;
  songs: Song[];
}

export const musicLibrary: Album[] = [
  {
    id: "diary-001",
    title: "Diary 001",
    artist: "Clairo",
    coverImage: "/albums/diary-001/cover.jpg",
    year: "2018",
    color: "bg-pink-400",
    songs: [
      {
        id: "pretty-girl",
        title: "Pretty Girl",
        artist: "Clairo",
        duration: "3:45",
        audioFile: "/albums/diary-001/pretty-girl.mp3",
        lyricsFile: "/albums/diary-001/pretty-girl.lrc",
      },
    ],
  },
  {
    id: "gemenfeile",
    title: "哥们废了",
    artist: "河南说唱之神",
    coverImage: "/albums/gemenfeile/cover.jpg",
    year: "2025",
    color: "bg-pink-400",
    songs: [
      {
        id: "2021-wasted",
        title: "2021 wasted",
        artist: "河南说唱之神",
        duration: "2:58",
        audioFile: "/albums/gemenfeile/2021-wasted.mp3",
        lyricsFile: "/albums/gemenfeile/2021-wasted.lrc",
      },
    ],
  },
];

export function getAlbumById(id: string): Album | undefined {
  console.log(id);
  return musicLibrary.find((album) => album.id === id);
}

export function getSongById(
  songId: string
): { song: Song; album: Album } | undefined {
  for (const album of musicLibrary) {
    const song = album.songs.find((s) => s.id === songId);
    if (song) {
      return { song, album };
    }
  }
  return undefined;
}
