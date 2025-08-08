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
        id: "hello",
        title: "Hello?",
        artist: "Clairo, Rejjie Snow",
        duration: "2:46",
        audioFile: "/albums/diary-001/hello.mp3",
        lyricsFile: "/albums/diary-001/hello.lrc",
      },
      {
        id: "flaming-hot-cheetos",
        title: "Flaming Hot Cheetos",
        artist: "Clairo",
        duration: "2:31",
        audioFile: "/albums/diary-001/flaming-hot-cheetos.mp3",
        lyricsFile: "/albums/diary-001/flaming-hot-cheetos.lrc",
      },
      {
        id: "bomd",
        title: "B.O.M.D.",
        artist: "Clairo, Danny L Harle",
        duration: "3:16",
        audioFile: "/albums/diary-001/bomd.mp3",
        lyricsFile: "/albums/diary-001/bomd.lrc",
      },
      {
        id: "4ever",
        title: "4EVER",
        artist: "Clairo",
        duration: "3:17",
        audioFile: "/albums/diary-001/4ever.mp3",
        lyricsFile: "/albums/diary-001/4ever.lrc",
      },
      {
        id: "pretty-girl",
        title: "Pretty Girl",
        artist: "Clairo",
        duration: "3:45",
        audioFile: "/albums/diary-001/pretty-girl.mp3",
        lyricsFile: "/albums/diary-001/pretty-girl.lrc",
      },
      {
        id: "how-demo",
        title: "How (demo)",
        artist: "Clairo",
        duration: "2:37",
        audioFile: "/albums/diary-001/how-demo.mp3",
        lyricsFile: "/albums/diary-001/how-demo.lrc",
      },
    ],
  },
  {
    id: "gemenfeile",
    title: "哥们废了",
    artist: "河南说唱之神",
    coverImage: "/albums/gemenfeile/cover.jpg",
    year: "2025",
    color: "bg-red-500",
    songs: [
      {
        id: "not-as-clear-as-you-think",
        title: "我没有你想的 活的明白",
        artist: "河南说唱之神",
        duration: "2:05",
        audioFile: "/albums/gemenfeile/not-as-clear-as-you-think.mp3",
        lyricsFile: "/albums/gemenfeile/not-as-clear-as-you-think.lrc",
      },
      {
        id: "now-you-are-unhappy",
        title: "现在 你才不幸福",
        artist: "河南说唱之神, KenRobb",
        duration: "2:18",
        audioFile: "/albums/gemenfeile/now-you-are-unhappy.mp3",
        lyricsFile: "/albums/gemenfeile/now-you-are-unhappy.lrc",
      },
      {
        id: "lang-ge-li-ge-lang",
        title: "啷个哩个啷",
        artist: "河南说唱之神",
        duration: "2:36",
        audioFile: "/albums/gemenfeile/lang-ge-li-ge-lang.mp3",
        lyricsFile: "/albums/gemenfeile/lang-ge-li-ge-lang.lrc",
      },
      {
        id: "na-ni-le",
        title: "那你嘞",
        artist: "河南说唱之神",
        duration: "3:45",
        audioFile: "/albums/gemenfeile/na-ni-le.mp3",
        lyricsFile: "/albums/gemenfeile/na-ni-le.lrc",
      },
      {
        id: "dont-want-to-get",
        title: "不想得到",
        artist: "河南说唱之神",
        duration: "2:03",
        audioFile: "/albums/gemenfeile/dont-want-to-get.mp3",
        lyricsFile: "/albums/gemenfeile/dont-want-to-get.lrc",
      },
      {
        id: "2021-wasted",
        title: "2021 wasted",
        artist: "河南说唱之神",
        duration: "2:58",
        audioFile: "/albums/gemenfeile/2021-wasted.mp3",
        lyricsFile: "/albums/gemenfeile/2021-wasted.lrc",
      },
      {
        id: "love-half-keep-half",
        title: "爱一半留一半",
        artist: "河南说唱之神",
        duration: "3:04",
        audioFile: "/albums/gemenfeile/love-half-keep-half.mp3",
        lyricsFile: "/albums/gemenfeile/love-half-keep-half.lrc",
      },
    ],
  },
];

export const getAlbumById = (id: string): Album | undefined => {
  return musicLibrary.find((album) => album.id === id);
};

export const getSongById = (
  songId: string
): { song: Song; album: Album } | undefined => {
  for (const album of musicLibrary) {
    const song = album.songs.find((s) => s.id === songId);
    if (song) {
      return { song, album };
    }
  }
  return undefined;
};
